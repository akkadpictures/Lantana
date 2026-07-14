import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { getProducts, getProductBySlug, getReviews, getShippingRates } from "@/lib/db";
import { getMarket } from "@/lib/market";
import { priceOf } from "@/lib/currency";
import { productJsonLd } from "@/lib/seo";
import { NotesPyramid } from "@/components/product/NotesPyramid";
import { AddToCart } from "@/components/product/AddToCart";
import { ProductCard } from "@/components/product/ProductCard";
import { TrackRecent } from "@/components/product/TrackRecent";
import { Stars } from "@/components/product/Stars";
import { ReviewForm } from "@/components/product/ReviewForm";
import { Price } from "@/components/product/Price";
import { Gallery, type GalleryImage } from "@/components/product/Gallery";
import { Reveal } from "@/components/motion/Reveal";
import { t } from "@/lib/utils";
import type { Locale } from "@/types";

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.flatMap((p) => [{ locale: "en", slug: p.slug }, { locale: "ar", slug: p.slug }]);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const p = await getProductBySlug(slug);
  if (!p) return {};
  return {
    title: t(p.name, locale),
    description: t(p.description, locale).slice(0, 160),
    openGraph: { images: [{ url: p.image }], title: t(p.name, locale), description: t(p.tagline, locale) },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const dict = await getDictionary(locale);
  const product = await getProductBySlug(slug);
  if (!product || product.status !== "active") notFound();

  const market = await getMarket();
  const price = priceOf(product, market.currency, market.multiplier, market.rates);

  const [allProducts, reviews, rates] = await Promise.all([getProducts(), getReviews(product.id), getShippingRates()]);
  const related = allProducts.filter((p) => p.id !== product.id && (p.collection === product.collection || p.featured)).slice(0, 4);
  const rate = rates.find((r) => r.country === market.country) ?? rates.find((r) => r.country === "WW");

  const name = t(product.name, locale);
  const secondary: GalleryImage[] = product.gallery
    .filter((src) => src !== product.image)
    .map((src, i) => ({ src, caption: `${name} — ${i + 2}` }));

  return (
    <article className="shell py-14 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product, locale, price, market.currency)) }}
      />
      <TrackRecent slug={product.slug} />

      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Hero frame + gallery */}
        <Reveal className="space-y-6">
          <div className="frame-zoom relative aspect-[4/5] overflow-hidden bg-ivory-soft">
            <Image src={product.image} alt={name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          {secondary.length > 0 && <Gallery images={secondary} alt={name} className="!columns-2 gap-4" />}
        </Reveal>

        {/* Details */}
        <Reveal delay={0.1} className="lg:py-8">
          <p className="eyebrow mb-4">{product.concentration} · {product.size}</p>
          <h1 className="t-h1 text-ink">{name}</h1>
          <p className="mt-4 font-display text-d4 font-light italic text-olive-deep">{t(product.tagline, locale)}</p>

          <p className="mt-8 font-body text-d4 tracking-wide2 text-ink tabular-nums">
            <Price product={product} />
          </p>

          <p className="t-body mt-8 max-w-prose2">{t(product.description, locale)}</p>
          <p className="t-label mt-5 tracking-wide2 text-ink/50">
            {dict.product.accord}: {t(product.accord, locale)}
          </p>

          <div className="mt-10 max-w-md">
            <AddToCart product={product} locale={locale} dict={dict} />
          </div>

          <details className="mt-12 border-t hairline pt-6">
            <summary className="t-label cursor-pointer tracking-wide2 text-ink/70">{dict.product.shippingReturns}</summary>
            <p className="t-small mt-4">
              {dict.product.shippingBody}
              {rate && <> {dict.checkout.eta}: {rate.etaDays[0]}–{rate.etaDays[1]} {dict.checkout.days}.</>}
            </p>
          </details>
        </Reveal>
      </div>

      {/* Olfactive pyramid */}
      <Reveal className="mx-auto mt-28 max-w-4xl md:mt-36">
        <NotesPyramid notes={product.notes} locale={locale} dict={dict} />
      </Reveal>

      {/* Reviews */}
      <Reveal className="mx-auto mt-28 max-w-3xl md:mt-36">
        <h2 className="t-h2 mb-10 text-center text-ink">{dict.product.reviews}</h2>
        {reviews.length > 0 && (
          <ul className="mb-14 space-y-9">
            {reviews.map((r) => (
              <li key={r.id} className="border-b hairline pb-9">
                <div className="flex items-center justify-between">
                  <p className="font-body text-base2 text-ink">{r.author}</p>
                  <Stars rating={r.rating} className="text-base2" />
                </div>
                <p className="t-body mt-3">{r.body}</p>
              </li>
            ))}
          </ul>
        )}
        <ReviewForm productId={product.id} dict={dict} />
      </Reveal>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-28 md:mt-36">
          <Reveal className="mb-12 text-center">
            <h2 className="t-h2 text-ink">{dict.product.related}</h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
