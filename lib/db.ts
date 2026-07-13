/**
 * Frontend data layer.
 * Reads come from the bundled catalog (lib/catalog.ts) — no external service required,
 * so `npm run dev` works immediately. Writes (orders, reviews, newsletter) are handled
 * optimistically on the client; wire them to a backend later without touching page code.
 */
import {
  PRODUCTS, COLLECTIONS, SHIPPING_RATES, COUPONS, REVIEWS, BLOG_POSTS,
} from "./catalog";
import type { Product, Collection, Coupon, ShippingRate, Review, BlogPost } from "@/types";

export async function getProducts(opts?: { includeDrafts?: boolean }): Promise<Product[]> {
  return opts?.includeDrafts ? PRODUCTS : PRODUCTS.filter((p) => p.status === "active");
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  return PRODUCTS.find((p) => p.id === id) ?? null;
}

export async function getCollections(): Promise<Collection[]> {
  return COLLECTIONS;
}

export async function getShippingRates(): Promise<ShippingRate[]> {
  return SHIPPING_RATES;
}

export async function getCoupon(code: string): Promise<Coupon | null> {
  const c = code.trim().toUpperCase();
  return COUPONS.find((x) => x.code === c && x.active) ?? null;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return [...BLOG_POSTS].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  return BLOG_POSTS.find((b) => b.slug === slug) ?? null;
}

export async function getReviews(productId: string): Promise<Review[]> {
  return REVIEWS.filter((r) => r.productId === productId && r.approved);
}
