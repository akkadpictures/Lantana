// lib/seoLantana.ts
// ملف جديد — لا يتعارض مع lib/seo.ts الموجود.
// ✅ جاهز للاستخدام كما هو.

import type { Metadata } from "next";

const SITE = "https://www.lantanaperfume.com";

const META = {
  ar: {
    title: "لانتانا | عطور دمشق الفاخرة — عطور رجالية ونسائية",
    description:
      "لانتانا — دار عطور فاخرة في الشعلان، دمشق. عطور رجالية ونسائية بخلاصات فرنسية من غراس وثبات من ست إلى ثماني ساعات. ثماني تركيبات توقيعية. زورونا في المحل أو تسوّقوا أونلاين مع التوصيل داخل سوريا والخليج.",
    ogTitle: "لانتانا | عطور دمشق الفاخرة",
    ogDescription:
      "عطور فاخرة من قلب دمشق — خلاصات فرنسية، ثبات عالٍ، وتوصيل لسوريا والخليج.",
    keywords: [
      "عطور دمشق",
      "برفيوم دمشق",
      "عطور فاخرة دمشق",
      "أفضل عطر بدمشق",
      "محل عطور دمشق",
      "عطور الشعلان",
      "عطور سورية",
      "عطور رجالية دمشق",
      "عطور نسائية دمشق",
      "عطور نيش",
      "لانتانا",
      "لانتانا للعطور",
      "Lantana Perfume Damascus",
    ],
  },
  en: {
    title: "LANTANA | Luxury Perfume Damascus — Maison de Parfum",
    description:
      "LANTANA — luxury maison de parfum in Al-Shaalan, Damascus. Eight signature eaux de parfum with French essences from Grasse, holding six to eight hours. Visit the boutique or shop online with delivery across Syria and the Gulf.",
    ogTitle: "LANTANA | Luxury Perfume Damascus",
    ogDescription:
      "Luxury eaux de parfum from the city of jasmine — French essences, lasting wear, delivery across Syria and the Gulf.",
    keywords: [
      "luxury perfume Damascus",
      "perfume shop Damascus",
      "Syrian perfume",
      "niche fragrance Damascus",
      "eau de parfum Syria",
      "Arabian perfume",
      "Lantana perfume",
    ],
  },
} as const;

/**
 * Canonical + hreflang for any page.
 * `route` is the path AFTER the locale segment, e.g. "/shop" or "/journal/x".
 * English lives at the bare path, Arabic keeps its /ar prefix — both must
 * agree with the URL that actually serves, or Google indexes a redirect.
 */
export function lantanaAlternates(locale: string, route = ""): {
  canonical: string;
  languages: Record<string, string>;
} {
  const r = route && !route.startsWith("/") ? `/${route}` : route;
  const en = `${SITE}${r}`;
  const ar = `${SITE}/ar${r}`;
  return {
    canonical: locale === "ar" ? ar : en,
    languages: { en, ar, "x-default": en },
  };
}

export function lantanaMetadata(locale: string, route = ""): Metadata {
  const loc = locale === "ar" ? "ar" : "en";
  const m = META[loc];
  const alt = lantanaAlternates(loc, route);

  return {
    metadataBase: new URL(SITE),
    title: m.title,
    description: m.description,
    keywords: [...m.keywords],
    applicationName: "LANTANA",
    authors: [{ name: "LANTANA" }],
    creator: "LANTANA",
    publisher: "LANTANA",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: {
      canonical: alt.canonical,
      languages: alt.languages,
    },
    openGraph: {
      type: "website",
      siteName: "LANTANA",
      locale: loc === "ar" ? "ar_SY" : "en_US",
      alternateLocale: loc === "ar" ? "en_US" : "ar_SY",
      title: m.ogTitle,
      description: m.ogDescription,
      url: alt.canonical,
      images: [
        {
          url: `${SITE}/images/brand/og.jpg`,
          width: 1200,
          height: 630,
          alt: "LANTANA — لانتانا",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: m.ogTitle,
      description: m.ogDescription,
      images: [`${SITE}/images/brand/og.jpg`],
    },
    other: {
      "geo.region": "SY-DI",
      "geo.placename": "Al-Shaalan, Damascus",
      "geo.position": "33.5172;36.2885",
      ICBM: "33.5172, 36.2885",
    },
  };
}
