import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getProducts, getCollections, getBlogPosts } from "@/lib/db";
import { locales } from "@/lib/i18n/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections, posts] = await Promise.all([getProducts(), getCollections(), getBlogPosts()]);
  const entries: MetadataRoute.Sitemap = [];
  const statics = ["", "/shop", "/collections", "/about", "/journal", "/contact", "/legal/privacy", "/legal/terms", "/legal/shipping-returns"];
  const now = new Date();
  // English lives at the bare path (middleware 301s /en/* → /*); Arabic keeps /ar.
  const base = (locale: string) => (locale === "en" ? SITE_URL : `${SITE_URL}/${locale}`);
  for (const locale of locales) {
    for (const p of statics) entries.push({ url: `${base(locale)}${p}`, lastModified: now, changeFrequency: "weekly", priority: p === "" ? 1 : 0.7 });
    for (const p of products) entries.push({ url: `${base(locale)}/product/${p.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.9 });
    for (const c of collections) entries.push({ url: `${base(locale)}/collections/${c.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.8 });
    for (const b of posts) entries.push({ url: `${base(locale)}/journal/${b.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.5 });
  }
  return entries;
}
