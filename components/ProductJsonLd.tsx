// components/ProductJsonLd.tsx
// ملف جديد — انسخه كما هو. لا يحتاج أي import.
// هذا أهم ملف: بدونه غوغل لا يرى عطورك كمنتجات إطلاقاً.

const SITE = "https://www.lantanaperfume.com";

type Localized = { ar?: string; en?: string } | string;

const pick = (v: Localized | undefined, locale: string): string => {
  if (!v) return "";
  if (typeof v === "string") return v;
  return (locale === "ar" ? v.ar : v.en) || v.en || v.ar || "";
};

export default function ProductJsonLd({
  product,
  locale = "en",
  priceUSD,
}: {
  product: any;
  locale?: string;
  priceUSD?: number;
}) {
  if (!product) return null;

  const isAr = locale === "ar";
  const name = pick(product.name, locale);
  const url = `${SITE}/${locale}/product/${product.slug}`;

  // السعر المعروض = basePriceUSD × ٣ (نفس معامل الموقع)
  const price = priceUSD ?? (product.basePriceUSD ?? 0) * 3;

  // بناء وصف غني بالكلمات المفتاحية من نوتات العطر
  const notes = product.notes || {};
  const noteLine = (arr: any[] = []) =>
    arr.map((n) => pick(n, locale)).filter(Boolean).join("، ");

  const baseDesc = pick(product.description, locale);
  const accord = pick(product.accord, locale);

  const description = isAr
    ? `${baseDesc} عطر ${name} من لانتانا — ${accord}، ${product.concentration || "Eau de Parfum"} بحجم ${product.size || ""}. ` +
      `النوتات العلوية: ${noteLine(notes.top)}. نوتات القلب: ${noteLine(notes.heart)}. النوتات القاعدية: ${noteLine(notes.base)}. ` +
      `متوفر في دمشق مع التوصيل داخل سوريا والخليج.`
    : `${baseDesc} ${name} by LANTANA — ${accord}, ${product.concentration || "Eau de Parfum"}, ${product.size || ""}. ` +
      `Top notes: ${noteLine(notes.top)}. Heart notes: ${noteLine(notes.heart)}. Base notes: ${noteLine(notes.base)}. ` +
      `Available in Damascus with shipping across Syria and the Gulf.`;

  const images = [product.image, ...(product.gallery || [])].filter(Boolean);

  const inStock = (product.inventory ?? 0) > 0 && product.status === "active";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: isAr ? `عطر ${name} من لانتانا` : `${name} by LANTANA`,
    alternateName: [pick(product.name, "ar"), pick(product.name, "en")].filter(Boolean),
    sku: product.id,
    description: description.replace(/\s+/g, " ").trim(),
    image: images,
    url,
    category: isAr ? "عطور" : "Fragrance",
    brand: { "@type": "Brand", name: "LANTANA", "@id": `${SITE}/#brand` },
    manufacturer: { "@type": "Organization", name: "LANTANA" },
    countryOfOrigin: { "@type": "Country", name: "Syria" },
    size: product.size,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: isAr ? "التركيز" : "Concentration",
        value: product.concentration || "Eau de Parfum",
      },
      {
        "@type": "PropertyValue",
        name: isAr ? "الحجم" : "Size",
        value: product.size || "",
      },
      {
        "@type": "PropertyValue",
        name: isAr ? "العائلة العطرية" : "Olfactive family",
        value: accord,
      },
      {
        "@type": "PropertyValue",
        name: isAr ? "النوتات العلوية" : "Top notes",
        value: noteLine(notes.top),
      },
      {
        "@type": "PropertyValue",
        name: isAr ? "نوتات القلب" : "Heart notes",
        value: noteLine(notes.heart),
      },
      {
        "@type": "PropertyValue",
        name: isAr ? "النوتات القاعدية" : "Base notes",
        value: noteLine(notes.base),
      },
    ].filter((p) => p.value),
    offers: {
      "@type": "Offer",
      "@id": `${url}#offer`,
      url,
      price: price.toFixed(2),
      priceCurrency: "USD",
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "LANTANA", "@id": `${SITE}/#store` },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: [
          { "@type": "DefinedRegion", addressCountry: "SY" },
          { "@type": "DefinedRegion", addressCountry: "SA" },
          { "@type": "DefinedRegion", addressCountry: "AE" },
          { "@type": "DefinedRegion", addressCountry: "QA" },
          { "@type": "DefinedRegion", addressCountry: "KW" },
        ],
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 7,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "SY",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
