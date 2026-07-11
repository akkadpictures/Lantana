import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getProducts, getCollections, getBlogPosts } from "@/lib/db";
import { locales } from "@/lib/i18n/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections, posts] = await Promise.all([getProducts(), getCollections(), getBlogPosts()]);
  const entries: MetadataRoute.Sitemap = [];
  const statics = ["", "/shop", "/collections", "/about", "/journal", "/contact", "/legal/privacy", "/legal/terms", "/legal/shipping-returns"];
  for (const locale of locales) {
    for (const p of statics) entries.push({ url: `${SITE_URL}/${locale}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : 0.7 });
    for (const p of products) entries.push({ url: `${SITE_URL}/${locale}/product/${p.slug}`, changeFrequency: "weekly", priority: 0.9 });
    for (const c of collections) entries.push({ url: `${SITE_URL}/${locale}/collections/${c.slug}`, changeFrequency: "weekly", priority: 0.8 });
    for (const b of posts) entries.push({ url: `${SITE_URL}/${locale}/journal/${b.slug}`, changeFrequency: "monthly", priority: 0.5 });
  }
  return entries;
}
