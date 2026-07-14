import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { getCollections, getProducts } from "@/lib/db";
import { COUNTRY_CURRENCY, toCountryCode } from "@/lib/currency";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { t } from "@/lib/utils";
import type { Locale } from "@/types";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const c = (await getCollections()).find((x) => x.slug === slug);
  return c ? { title: t(c.name, locale), description: t(c.description, locale) } : {};
}

export default async function CollectionPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const dict = await getDictionary(locale);
  const collection = (await getCollections()).find((c) => c.slug === slug);
  if (!collection) notFound();

  const cookieStore = await cookies();
  const currency = COUNTRY_CURRENCY[toCountryCode(cookieStore.get("lantana_country")?.value)];
  const products = (await getProducts()).filter((p) => p.collection === slug);

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
      <Reveal className="mb-14 text-center">
        <h1 className="h-display text-d2 text-ink sm:text-d2">{t(collection.name, locale)}</h1>
        <p className="mx-auto mt-4 max-w-xl font-body text-base2 leading-relaxed text-ink/60">{t(collection.description, locale)}</p>
      </Reveal>
      {products.length === 0 ? (
        <p className="py-20 text-center font-body text-base2 text-ink/50">{dict.shop.empty}</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i, 4) * 0.06}>
              <ProductCard product={p} locale={locale} currency={currency} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
