import type { Metadata } from "next";
import type { Locale, Product } from "@/types";
import { t } from "./utils";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lantana.com";

export function baseMetadata(locale: Locale): Metadata {
  const isAr = locale === "ar";
  const title = isAr ? "لانتانا — دار عطور دمشق" : "LANTANA — Maison de Parfum, Damascus";
  const description = isAr
    ? "عطور فاخرة مركّبة من خلاصات فرنسية وسويسرية، وُلدت في مدينة الياسمين. ثمانية عطور أصلية من دار لانتانا."
    : "Luxury eaux de parfum composed with French and Swiss essences, born in Damascus — the city of jasmine. Eight signature fragrances by LANTANA.";
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: isAr ? "%s — لانتانا" : "%s — LANTANA" },
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: { en: `${SITE_URL}/en`, ar: `${SITE_URL}/ar`, "x-default": `${SITE_URL}/en` },
    },
    openGraph: {
      type: "website", siteName: "LANTANA", title, description,
      url: `${SITE_URL}/${locale}`, locale: isAr ? "ar_SY" : "en_US",
      images: [{ url: "/images/brand/og.jpg", width: 1200, height: 630, alt: "LANTANA" }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/images/brand/og.jpg"] },
    robots: { index: true, follow: true },
    icons: { icon: "/icon.svg" },
  };
}

export function productJsonLd(p: Product, locale: Locale, price: number, currency: string) {
  return {
    "@context": "https://schema.org", "@type": "Product",
    name: t(p.name, locale), description: t(p.description, locale),
    image: `${SITE_URL}${p.image}`, brand: { "@type": "Brand", name: "LANTANA" },
    sku: p.id, category: "Eau de Parfum",
    offers: {
      "@type": "Offer", url: `${SITE_URL}/${locale}/product/${p.slug}`,
      priceCurrency: currency, price,
      availability: p.inventory > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org", "@type": "Organization",
    name: "LANTANA", url: SITE_URL, logo: `${SITE_URL}/images/brand/logo-olive.png`,
    address: { "@type": "PostalAddress", addressLocality: "Damascus", addressCountry: "SY" },
    sameAs: ["https://instagram.com/lantana"],
  };
}
