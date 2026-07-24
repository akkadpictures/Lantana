// lib/seoLantana.ts
// ملف جديد — لا يتعارض مع lib/seo.ts الموجود.
// ✅ جاهز للاستخدام كما هو.

import type { Metadata } from "next";

const SITE = "https://www.lantanaperfume.com";

const META = {
  ar: {
    title: "لانتانا | عطور دمشق الفاخرة — عطور رجالية ونسائية",
    description:
      "لانتانا — دار عطور فاخرة في الشعلان، دمشق. عطور رجالية ونسائية بخلاصات فرنسية من غراس وثبات يمتد ٨ ساعات. عشر تركيبات توقيعية. زورونا في المحل أو تسوّقوا أونلاين مع التوصيل داخل سوريا والخليج.",
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
      "LANTANA — luxury maison de parfum in Al-Shaalan, Damascus. Ten signature eaux de parfum with French essences from Grasse. Visit the boutique or shop online with delivery across Syria and the Gulf.",
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

export function lantanaMetadata(locale: string): Metadata {
  const loc = locale === "ar" ? "ar" : "en";
  const m = META[loc];
  const path = loc === "ar" ? "/ar" : "";

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
      canonical: `${SITE}${path}`,
      languages: {
        en: SITE,
        ar: `${SITE}/ar`,
        "x-default": SITE,
      },
    },
    openGraph: {
      type: "website",
      siteName: "LANTANA",
      locale: loc === "ar" ? "ar_SY" : "en_US",
      alternateLocale: loc === "ar" ? "en_US" : "ar_SY",
      title: m.ogTitle,
      description: m.ogDescription,
      url: `${SITE}${path}`,
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
