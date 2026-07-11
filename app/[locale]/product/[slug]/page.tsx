import Image from "next/image";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { getProducts, getProductBySlug, getReviews, getShippingRates } from "@/lib/db";
import { COUNTRY_CURRENCY, toCountryCode, resolvePrice } from "@/lib/currency";
import { productJsonLd } from "@/lib/seo";
import { NotesPyramid } from "@/components/product/NotesPyramid";
import { AddToCart } from "@/components/product/AddToCart";
import { ProductCard } from "@/components/product/ProductCard";
import { TrackRecent } from "@/components/product/TrackRecent";
import { Stars } from "@/components/product/Stars";
import { ReviewForm } from "@/components/product/ReviewForm";
import { Price } from "@/components/product/Price";
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

  const cookieStore = await cookies();
  const country = toCountryCode(cookieStore.get("lantana_country")?.value);
  const currency = COUNTRY_CURRENCY[country];
  const price = resolvePrice(product.basePriceUSD, product.prices, currency);

  const [allProducts, reviews, rates] = await Promise.all([getProducts(), getReviews(product.id), getShippingRates()]);
  const related = allProducts.filter((p) => p.id !== product.id && (p.collection === product.collection || p.featured)).slice(0, 4);
  const rate = rates.find((r) => r.country === country) ?? rates.find((r) => r.country === "WW");

  return (
    <article className="mx-auto max-w-7xl px-5 py-12 md:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product, locale, price, currency)) }} />
      <TrackRecent slug={product.slug} />

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Gallery */}
        <Reveal className="space-y-4">
          <div className="frame-zoom relative aspect-square bg-ivory-soft">
            <Image src={product.image} alt={t(product.name, locale)} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          {product.gallery.length > 1 && (
            <div className="grid grid-cols-2 gap-4">
              {product.gallery.slice(1).map((src, i) => (
                <div key={i} className="frame-zoom relative aspect-square bg-ivory-soft">
                  <Image src={src} alt={`${t(product.name, locale)} — ${i + 2}`} fill sizes="25vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </Reveal>

        {/* Details */}
        <Reveal delay={0.1} className="lg:py-6">
          <p className="eyebrow mb-3">{product.concentration} · {product.size}</p>
          <h1 className="h-display text-5xl text-ink">{t(product.name, locale)}</h1>
          <p className="mt-3 font-display text-xl font-light italic text-olive-deep">{t(product.tagline, locale)}</p>
          <p className="mt-6 font-body text-2xl text-ink">
            <Price product={product} currency={currency} locale={locale} />
          </p>
          <p className="mt-6 max-w-lg font-body text-[15px] leading-loose text-ink/70">{t(product.description, locale)}</p>
          <p className="mt-4 font-body text-xs uppercase tracking-wide2 text-ink/50">{dict.product.accord}: {t(product.accord, locale)}</p>

          <div className="mt-9 max-w-md">
            <AddToCart product={product} locale={locale} dict={dict} />
          </div>

          <details className="mt-10 border-t hairline pt-5">
            <summary className="cursor-pointer font-body text-[12px] uppercase tracking-wide2 text-ink/70">{dict.product.shippingReturns}</summary>
            <p className="mt-3 font-body text-sm leading-relaxed text-ink/60">
              {dict.product.shippingBody}
              {rate && <> {dict.checkout.eta}: {rate.etaDays[0]}–{rate.etaDays[1]} {dict.checkout.days}.</>}
            </p>
          </details>
        </Reveal>
      </div>

      {/* Olfactive pyramid */}
      <Reveal className="mx-auto mt-24 max-w-4xl">
        <NotesPyramid notes={product.notes} locale={locale} dict={dict} />
      </Reveal>

      {/* Reviews */}
      <Reveal className="mx-auto mt-24 max-w-3xl">
        <h2 className="h-display mb-8 text-center text-3xl text-ink">{dict.product.reviews}</h2>
        {reviews.length > 0 && (
          <ul className="mb-12 space-y-8">
            {reviews.map((r) => (
              <li key={r.id} className="border-b hairline pb-8">
                <div className="flex items-center justify-between">
                  <p className="font-body text-sm font-medium text-ink">{r.author}</p>
                  <Stars rating={r.rating} className="text-sm" />
                </div>
                <p className="mt-2 font-body text-sm leading-relaxed text-ink/65">{r.body}</p>
              </li>
            ))}
          </ul>
        )}
        <ReviewForm productId={product.id} dict={dict} />
      </Reveal>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-24">
          <Reveal className="mb-10 text-center">
            <h2 className="h-display text-3xl text-ink">{dict.product.related}</h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} currency={currency} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
