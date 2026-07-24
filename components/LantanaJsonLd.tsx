components/LantanaJsonLd.tsx// components/LantanaJsonLd.tsx
// ملف جديد — انسخه كما هو. لا يحتاج أي import.
// ✅ جاهز — العنوان والإحداثيات مضبوطة على محل الشعلان بدمشق.

const SITE = "https://www.lantanaperfume.com";

const STORE_ADDRESS = "الشعلان، دمشق";
const STORE_GEO = { lat: 33.5172, lng: 36.2885 }; // الشعلان، دمشق — G78Q+V9P

export default function LantanaJsonLd({ locale = "en" }: { locale?: string }) {
  const isAr = locale === "ar";

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      /* ── المتجر / النشاط المحلي ── */
      {
        "@type": ["Store", "PerfumeStore", "LocalBusiness"],
        "@id": `${SITE}/#store`,
        name: "LANTANA",
        alternateName: [
          "لانتانا",
          "لانتانا للعطور",
          "عطور لانتانا",
          "Lantana Perfume",
          "Lantana Maison de Parfum",
        ],
        description: isAr
          ? "لانتانا — دار عطور فاخرة في دمشق. عطور رجالية ونسائية بخلاصات فرنسية من غراس، تُصنع في دبي وتولد في مدينة الياسمين. عشر تركيبات توقيعية بثبات عالٍ."
          : "LANTANA — luxury maison de parfum in Damascus. Eaux de parfum composed with French essences from Grasse, crafted in Dubai, born in the city of jasmine.",
        url: SITE,
        logo: `${SITE}/images/brand/logo-olive.png`,
        image: [`${SITE}/images/brand/og.jpg`],
        telephone: "+963984179484",
        priceRange: "$$$",
        currenciesAccepted: "USD, SYP, AED, SAR, QAR, KWD, TRY",
        paymentAccepted: "Cash, Credit Card, Bank Transfer",
        foundingDate: "2026",
        slogan: isAr ? "العطر ذاكرة" : "Scent is memory",
        knowsLanguage: ["ar", "en"],
        address: {
          "@type": "PostalAddress",
          streetAddress: STORE_ADDRESS,
          addressLocality: isAr ? "دمشق" : "Damascus",
          addressRegion: isAr ? "دمشق" : "Damascus",
          addressCountry: "SY",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: STORE_GEO.lat,
          longitude: STORE_GEO.lng,
        },
        areaServed: [
          { "@type": "City", name: isAr ? "دمشق" : "Damascus" },
          { "@type": "Country", name: isAr ? "سوريا" : "Syria" },
          { "@type": "Country", name: isAr ? "السعودية" : "Saudi Arabia" },
          { "@type": "Country", name: isAr ? "الإمارات" : "United Arab Emirates" },
          { "@type": "Country", name: isAr ? "قطر" : "Qatar" },
          { "@type": "Country", name: isAr ? "الكويت" : "Kuwait" },
        ],
        hasMap:
          "https://www.google.com/maps?q=G78Q%2BV9P+LANTANA+PERFUME,+Damascus,+Syria",
        sameAs: [
          "https://instagram.com/Lantana.perfume",
          "https://wa.me/963984179484",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+963984179484",
          contactType: "customer service",
          availableLanguage: ["Arabic", "English"],
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: isAr ? "عطور لانتانا" : "LANTANA Fragrances",
          itemListElement: [
            {
              "@type": "OfferCatalog",
              name: isAr ? "عطور نسائية" : "Women's fragrances",
            },
            {
              "@type": "OfferCatalog",
              name: isAr ? "عطور رجالية" : "Men's fragrances",
            },
            {
              "@type": "OfferCatalog",
              name: isAr ? "علب الهدايا" : "Coffrets",
            },
          ],
        },
      },

      /* ── البراند ── */
      {
        "@type": "Brand",
        "@id": `${SITE}/#brand`,
        name: "LANTANA",
        alternateName: "لانتانا",
        logo: `${SITE}/images/brand/logo-olive.png`,
        url: SITE,
        slogan: isAr ? "العطر ذاكرة" : "Scent is memory",
      },

      /* ── الموقع + بحث داخلي ── */
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        url: SITE,
        name: "LANTANA",
        inLanguage: isAr ? "ar" : "en",
        publisher: { "@id": `${SITE}/#store` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE}/${locale}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },

      /* ── الأسئلة الشائعة ── */
      {
        "@type": "FAQPage",
        "@id": `${SITE}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: isAr
              ? "وين أشتري عطور فاخرة في دمشق؟"
              : "Where can I buy luxury perfume in Damascus?",
            acceptedAnswer: {
              "@type": "Answer",
              text: isAr
                ? "لانتانا دار عطور فاخرة في دمشق، تقدّم عشر تركيبات توقيعية بخلاصات فرنسية من غراس. يمكنك زيارة المحل في دمشق أو الطلب أونلاين عبر lantanaperfume.com مع التوصيل داخل سوريا ودول الخليج."
                : "LANTANA is a luxury maison de parfum in Damascus offering ten signature compositions with French essences from Grasse. Visit the boutique in Damascus or order online at lantanaperfume.com.",
            },
          },
          {
            "@type": "Question",
            name: isAr ? "ما هي عطور لانتانا؟" : "What fragrances does LANTANA offer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: isAr
                ? "تضم مجموعة لانتانا: ياسمين (زهري أبيض مشمس)، مون (زهري ليلي عنبري)، لونيا (وردي بودري)، مسك (مسك أبيض)، أسرار، ليال، وقار، وبرق — بالإضافة إلى علبة الاكتشاف. جميعها Eau de Parfum بحجم ٥٠ مل و١٠٠ مل."
                : "The LANTANA collection includes Yasmeen, Moon, Lunéa, Misk, Asrar, Layal, Waqaar and Barq, plus the Discovery Coffret. All are Eau de Parfum in 50 ml and 100 ml.",
            },
          },
          {
            "@type": "Question",
            name: isAr ? "هل توصلون للخليج؟" : "Do you ship to the Gulf?",
            acceptedAnswer: {
              "@type": "Answer",
              text: isAr
                ? "نعم، نوصّل إلى السعودية والإمارات وقطر والكويت، بالإضافة إلى التوصيل داخل سوريا. الشحن خلال ٤٨ ساعة من دمشق ودبي."
                : "Yes — we ship to Saudi Arabia, the UAE, Qatar and Kuwait, as well as within Syria. Dispatched within 48 hours from Damascus and Dubai.",
            },
          },
          {
            "@type": "Question",
            name: isAr ? "كم يدوم ثبات عطور لانتانا؟" : "How long do LANTANA fragrances last?",
            acceptedAnswer: {
              "@type": "Answer",
              text: isAr
                ? "جميع عطور لانتانا بتركيز Eau de Parfum وتُنقَع لأسابيع قبل التعبئة، ما يمنحها ثباتاً يمتد من ٦ إلى ٨ ساعات على البشرة."
                : "All LANTANA fragrances are Eau de Parfum concentration, macerated for weeks before bottling, giving 6 to 8 hours of wear.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
