import type { Metadata } from "next";
import type { Locale, Product } from "@/types";
import { t } from "./utils";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

/**
 * English lives at the bare path (no "/en" segment); Arabic keeps its prefix.
 * Every canonical, hreflang and Open Graph URL must agree with that, otherwise
 * search engines index a URL that immediately redirects.
 */
export function localeUrl(locale: Locale, path = ""): string {
  const suffix = path && !path.startsWith("/") ? `/${path}` : path;
  return locale === "ar" ? `${SITE_URL}/ar${suffix}` : `${SITE_URL}${suffix || ""}`;
}

export function baseMetadata(locale: Locale): Metadata {
  const isAr = locale === "ar";
  const title = isAr ? "لانتانا — دار عطور دمشق" : "LANTANA — Maison de Parfum, Damascus";
  const description = isAr
    ? "عطور فاخرة مُركّبة من خلاصاتٍ فرنسية، تُصاغ في دبي وموطنها دمشق — مدينة الياسمين. ثمانية عطور أصلية من دار لانتانا."
    : "Luxury eaux de parfum composed with French essences, crafted in Dubai and at home in Damascus — the city of jasmine. Eight signature fragrances by LANTANA.";
  const canonical = localeUrl(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: isAr ? "%s — لانتانا" : "%s — LANTANA" },
    description,
    alternates: {
      canonical,
      languages: {
        en: localeUrl("en"),
        ar: localeUrl("ar"),
        "x-default": localeUrl("en"),
      },
    },
    openGraph: {
      type: "website",
      siteName: "LANTANA",
      title,
      description,
      url: canonical,
      locale: isAr ? "ar_SY" : "en_US",
      images: [{ url: "/images/brand/og.jpg", width: 1200, height: 630, alt: "LANTANA" }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/images/brand/og.jpg"] },
    robots: { index: true, follow: true },
    icons: { icon: "/icon.svg" },
  };
}

export function productJsonLd(p: Product, locale: Locale, price: number, currency: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: t(p.name, locale),
    description: t(p.description, locale),
    image: `${SITE_URL}${p.image}`,
    brand: { "@type": "Brand", name: "LANTANA" },
    sku: p.id,
    category: "Eau de Parfum",
    offers: {
      "@type": "Offer",
      url: localeUrl(locale, `/product/${p.slug}`),
      priceCurrency: currency,
      price,
      availability: p.inventory > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LANTANA",
    url: SITE_URL,
    logo: `${SITE_URL}/images/brand/logo-olive.png`,
    address: { "@type": "PostalAddress", addressLocality: "Damascus", addressCountry: "SY" },
    sameAs: ["https://instagram.com/Lantana.perfume"],
  };
}
