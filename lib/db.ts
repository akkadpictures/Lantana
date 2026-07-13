/**
 * Data layer.
 * When Supabase is configured (lib/supabase.hasDB), all reads/writes go to Postgres.
 * Otherwise a mutable in-memory store seeded from lib/catalog.ts keeps the whole app
 * (including the admin dashboard) fully functional for local development and preview.
 */
import { hasDB, supa } from "./supabase";
import {
  PRODUCTS, COLLECTIONS, SHIPPING_RATES, COUPONS, REVIEWS, BLOG_POSTS,
} from "./catalog";
import type {
  Product, Collection, Order, Coupon, ShippingRate, Review, BlogPost, CountryCode, OrderStatus,
} from "@/types";

/* ── In-memory store (deep-cloned so seeds stay pristine) ────── */
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
const mem = {
  products: clone(PRODUCTS) as Product[],
  collections: clone(COLLECTIONS) as Collection[],
  shipping: clone(SHIPPING_RATES) as ShippingRate[],
  coupons: clone(COUPONS) as Coupon[],
  reviews: clone(REVIEWS) as Review[],
  posts: clone(BLOG_POSTS) as BlogPost[],
  orders: [] as Order[],
  newsletter: [] as string[],
};

/* ── Products ────────────────────────────────────────────────── */
export async function getProducts(opts?: { includeDrafts?: boolean }): Promise<Product[]> {
  if (hasDB) {
    let q = supa().from("products").select("*").order("created_at", { ascending: false });
    if (!opts?.includeDrafts) q = q.eq("status", "active");
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(rowToProduct);
  }
  const list = [...mem.products].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return opts?.includeDrafts ? list : list.filter((p) => p.status === "active");
}
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (hasDB) {
    const { data } = await supa().from("products").select("*").eq("slug", slug).maybeSingle();
    return data ? rowToProduct(data) : null;
  }
  return mem.products.find((p) => p.slug === slug) ?? null;
}
export async function getProductById(id: string): Promise<Product | null> {
  if (hasDB) {
    const { data } = await supa().from("products").select("*").eq("id", id).maybeSingle();
    return data ? rowToProduct(data) : null;
  }
  return mem.products.find((p) => p.id === id) ?? null;
}
export async function upsertProduct(p: Product): Promise<void> {
  if (hasDB) {
    const { error } = await supa().from("products").upsert(productToRow(p));
    if (error) throw error;
    return;
  }
  const i = mem.products.findIndex((x) => x.id === p.id);
  if (i >= 0) mem.products[i] = p; else mem.products.unshift(p);
}
export async function deleteProduct(id: string): Promise<void> {
  if (hasDB) { await supa().from("products").delete().eq("id", id); return; }
  mem.products = mem.products.filter((p) => p.id !== id);
}
export async function adjustInventory(id: string, delta: number): Promise<void> {
  if (hasDB) {
    const { data } = await supa().from("products").select("inventory").eq("id", id).maybeSingle();
    if (data) await supa().from("products").update({ inventory: Math.max(0, (data.inventory ?? 0) + delta) }).eq("id", id);
    return;
  }
  const p = mem.products.find((x) => x.id === id);
  if (p) p.inventory = Math.max(0, p.inventory + delta);
}

/* ── Collections ─────────────────────────────────────────────── */
export async function getCollections(): Promise<Collection[]> {
  if (hasDB) {
    const { data } = await supa().from("collections").select("*").order("id");
    if (data?.length) return data.map((r: Record<string, unknown>) => ({ id: r.id as string, slug: r.slug as string, name: r.name as Collection["name"], description: r.description as Collection["description"], image: r.image as string }));
  }
  return mem.collections;
}
export async function upsertCollection(c: Collection): Promise<void> {
  if (hasDB) { await supa().from("collections").upsert({ id: c.id, slug: c.slug, name: c.name, description: c.description, image: c.image }); return; }
  const i = mem.collections.findIndex((x) => x.id === c.id);
  if (i >= 0) mem.collections[i] = c; else mem.collections.push(c);
}
export async function deleteCollection(id: string): Promise<void> {
  if (hasDB) { await supa().from("collections").delete().eq("id", id); return; }
  mem.collections = mem.collections.filter((c) => c.id !== id);
}

/* ── Shipping ────────────────────────────────────────────────── */
export async function getShippingRates(): Promise<ShippingRate[]> {
  if (hasDB) {
    const { data } = await supa().from("shipping_rates").select("*");
    if (data?.length) return data.map((r: Record<string, unknown>) => ({ country: r.country as CountryCode, label: r.label as ShippingRate["label"], priceUSD: Number(r.price_usd), etaDays: [Number(r.eta_min), Number(r.eta_max)] as [number, number] }));
  }
  return mem.shipping;
}
export async function upsertShippingRate(r: ShippingRate): Promise<void> {
  if (hasDB) {
    await supa().from("shipping_rates").upsert({ country: r.country, label: r.label, price_usd: r.priceUSD, eta_min: r.etaDays[0], eta_max: r.etaDays[1] });
    return;
  }
  const i = mem.shipping.findIndex((x) => x.country === r.country);
  if (i >= 0) mem.shipping[i] = r; else mem.shipping.push(r);
}

/* ── Coupons ─────────────────────────────────────────────────── */
export async function getCoupons(): Promise<Coupon[]> {
  if (hasDB) {
    const { data } = await supa().from("coupons").select("*");
    if (data) return data.map((c: Record<string, unknown>) => ({ code: c.code as string, type: c.type as Coupon["type"], value: Number(c.value), active: Boolean(c.active), minSubtotalUSD: Number(c.min_subtotal_usd) }));
  }
  return mem.coupons;
}
export async function getCoupon(code: string): Promise<Coupon | null> {
  const c = code.trim().toUpperCase();
  if (!c) return null;
  if (hasDB) {
    const { data } = await supa().from("coupons").select("*").eq("code", c).eq("active", true).maybeSingle();
    return data ? { code: data.code, type: data.type, value: Number(data.value), active: data.active, minSubtotalUSD: Number(data.min_subtotal_usd) } : null;
  }
  return mem.coupons.find((x) => x.code === c && x.active) ?? null;
}
export async function upsertCoupon(c: Coupon): Promise<void> {
  const code = c.code.trim().toUpperCase();
  if (hasDB) { await supa().from("coupons").upsert({ code, type: c.type, value: c.value, active: c.active, min_subtotal_usd: c.minSubtotalUSD }); return; }
  const i = mem.coupons.findIndex((x) => x.code === code);
  const row = { ...c, code };
  if (i >= 0) mem.coupons[i] = row; else mem.coupons.push(row);
}
export async function deleteCoupon(code: string): Promise<void> {
  const c = code.trim().toUpperCase();
  if (hasDB) { await supa().from("coupons").delete().eq("code", c); return; }
  mem.coupons = mem.coupons.filter((x) => x.code !== c);
}

/* ── Blog ────────────────────────────────────────────────────── */
export async function getBlogPosts(): Promise<BlogPost[]> {
  if (hasDB) {
    const { data } = await supa().from("blog_posts").select("*").order("published_at", { ascending: false });
    if (data?.length) return data.map((r: Record<string, unknown>) => ({ id: r.id as string, slug: r.slug as string, title: r.title as BlogPost["title"], excerpt: r.excerpt as BlogPost["excerpt"], body: r.body as BlogPost["body"], image: r.image as string, publishedAt: r.published_at as string }));
  }
  return [...mem.posts].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  return (await getBlogPosts()).find((b) => b.slug === slug) ?? null;
}
export async function upsertBlogPost(b: BlogPost): Promise<void> {
  if (hasDB) { await supa().from("blog_posts").upsert({ id: b.id, slug: b.slug, title: b.title, excerpt: b.excerpt, body: b.body, image: b.image, published_at: b.publishedAt }); return; }
  const i = mem.posts.findIndex((x) => x.id === b.id);
  if (i >= 0) mem.posts[i] = b; else mem.posts.unshift(b);
}
export async function deleteBlogPost(id: string): Promise<void> {
  if (hasDB) { await supa().from("blog_posts").delete().eq("id", id); return; }
  mem.posts = mem.posts.filter((p) => p.id !== id);
}

/* ── Reviews ─────────────────────────────────────────────────── */
export async function getReviews(productId: string): Promise<Review[]> {
  if (hasDB) {
    const { data } = await supa().from("reviews").select("*").eq("product_id", productId).eq("approved", true).order("created_at", { ascending: false });
    return (data ?? []).map(rowToReview);
  }
  return mem.reviews.filter((r) => r.productId === productId && r.approved);
}
export async function getAllReviews(): Promise<Review[]> {
  if (hasDB) {
    const { data } = await supa().from("reviews").select("*").order("created_at", { ascending: false });
    return (data ?? []).map(rowToReview);
  }
  return [...mem.reviews].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
export async function addReview(r: Omit<Review, "id" | "approved" | "createdAt">): Promise<void> {
  const row: Review = { ...r, id: crypto.randomUUID(), approved: false, createdAt: new Date().toISOString() };
  if (hasDB) {
    await supa().from("reviews").insert({ id: row.id, product_id: row.productId, author: row.author, rating: row.rating, body: row.body, approved: false });
    return;
  }
  mem.reviews.unshift(row);
}
export async function setReviewApproval(id: string, approved: boolean): Promise<void> {
  if (hasDB) { await supa().from("reviews").update({ approved }).eq("id", id); return; }
  const r = mem.reviews.find((x) => x.id === id);
  if (r) r.approved = approved;
}
export async function deleteReview(id: string): Promise<void> {
  if (hasDB) { await supa().from("reviews").delete().eq("id", id); return; }
  mem.reviews = mem.reviews.filter((r) => r.id !== id);
}

/* ── Orders ──────────────────────────────────────────────────── */
export async function createOrder(o: Order): Promise<void> {
  if (hasDB) {
    const { error } = await supa().from("orders").insert({
      id: o.id, number: o.number, status: o.status, payment_method: o.paymentMethod,
      currency: o.currency, country: o.country, subtotal: o.subtotal, shipping: o.shipping,
      discount: o.discount, total: o.total, coupon_code: o.couponCode ?? null,
      customer: o.customer, items: o.items, created_at: o.createdAt,
    });
    if (error) throw error;
    return;
  }
  mem.orders.unshift(o);
}
export async function getOrders(): Promise<Order[]> {
  if (hasDB) {
    const { data } = await supa().from("orders").select("*").order("created_at", { ascending: false });
    return (data ?? []).map(rowToOrder);
  }
  return mem.orders;
}
export async function getOrder(id: string): Promise<Order | null> {
  if (hasDB) {
    const { data } = await supa().from("orders").select("*").eq("id", id).maybeSingle();
    return data ? rowToOrder(data) : null;
  }
  return mem.orders.find((o) => o.id === id) ?? null;
}
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  if (hasDB) { await supa().from("orders").update({ status }).eq("id", id); return; }
  const o = mem.orders.find((x) => x.id === id);
  if (o) o.status = status;
}

/* ── Customers (derived from orders) ─────────────────────────── */
export interface CustomerSummary {
  email: string; name: string; phone: string; country: string;
  orders: number; totalUSD: number; lastOrder: string;
}
export async function getCustomers(): Promise<CustomerSummary[]> {
  const orders = await getOrders();
  const map = new Map<string, CustomerSummary>();
  for (const o of orders) {
    const key = o.customer.email.toLowerCase();
    const existing = map.get(key);
    const totalUSD = o.currency === "USD" ? o.total : 0; // display uses order currency; USD kept for rough sort
    if (existing) {
      existing.orders += 1;
      existing.totalUSD += totalUSD;
      if (o.createdAt > existing.lastOrder) existing.lastOrder = o.createdAt;
    } else {
      map.set(key, {
        email: o.customer.email, name: o.customer.name, phone: o.customer.phone,
        country: o.country, orders: 1, totalUSD, lastOrder: o.createdAt,
      });
    }
  }
  return [...map.values()].sort((a, b) => +new Date(b.lastOrder) - +new Date(a.lastOrder));
}

/* ── Newsletter ──────────────────────────────────────────────── */
export async function subscribeNewsletter(email: string): Promise<void> {
  if (hasDB) { await supa().from("newsletter").upsert({ email }); return; }
  if (!mem.newsletter.includes(email)) mem.newsletter.push(email);
}

/* ── Row mappers ─────────────────────────────────────────────── */
function rowToProduct(r: Record<string, unknown>): Product {
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as Product["name"],
    tagline: r.tagline as Product["tagline"], description: r.description as Product["description"],
    size: r.size as string, concentration: r.concentration as string, collection: r.collection as string,
    notes: r.notes as Product["notes"], accord: r.accord as Product["accord"],
    image: r.image as string, gallery: (r.gallery as string[]) ?? [],
    basePriceUSD: Number(r.base_price_usd), prices: (r.prices as Product["prices"]) ?? {},
    inventory: Number(r.inventory ?? 0), featured: Boolean(r.featured), hero: Boolean(r.hero),
    status: r.status as Product["status"], createdAt: r.created_at as string,
  };
}
function productToRow(p: Product) {
  return {
    id: p.id, slug: p.slug, name: p.name, tagline: p.tagline, description: p.description,
    size: p.size, concentration: p.concentration, collection: p.collection, notes: p.notes,
    accord: p.accord, image: p.image, gallery: p.gallery, base_price_usd: p.basePriceUSD,
    prices: p.prices, inventory: p.inventory, featured: p.featured, hero: p.hero ?? false,
    status: p.status, created_at: p.createdAt,
  };
}
function rowToOrder(r: Record<string, unknown>): Order {
  return {
    id: r.id as string, number: r.number as string, status: r.status as OrderStatus,
    paymentMethod: r.payment_method as Order["paymentMethod"], currency: r.currency as Order["currency"],
    country: r.country as string, subtotal: Number(r.subtotal), shipping: Number(r.shipping),
    discount: Number(r.discount), total: Number(r.total), couponCode: (r.coupon_code as string) ?? null,
    customer: r.customer as Order["customer"], items: r.items as Order["items"],
    createdAt: r.created_at as string,
  };
}
function rowToReview(r: Record<string, unknown>): Review {
  return {
    id: r.id as string, productId: r.product_id as string, author: r.author as string,
    rating: Number(r.rating), body: r.body as string, approved: Boolean(r.approved),
    createdAt: r.created_at as string,
  };
}
