import { cookies } from "next/headers";
import Link from "next/link";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { getProducts, getCollections } from "@/lib/db";
import { COUNTRY_CURRENCY, toCountryCode, priceOf } from "@/lib/currency";
import { getMarket } from "@/lib/market";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { cn, t } from "@/lib/utils";
import type { Locale, Product } from "@/types";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "جميع العطور" : "All Fragrances" };
}

export default async function ShopPage({
  params, searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ collection?: string; sort?: string }>;
}) {
  const [{ locale: raw }, sp] = await Promise.all([params, searchParams]);
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const dict = await getDictionary(locale);
  const cookieStore = await cookies();
  const currency = COUNTRY_CURRENCY[toCountryCode(cookieStore.get("lantana_country")?.value)];
  const market = await getMarket();
  const shelf = (p: Product) => priceOf(p, market.currency, market.multiplier, market.rates);

  const [allProducts, collections] = await Promise.all([getProducts(), getCollections()]);

  let products = sp.collection ? allProducts.filter((p) => p.collection === sp.collection) : allProducts;
  if (sp.sort === "price-asc") products = [...products].sort((a, b) => shelf(a) - shelf(b));
  else if (sp.sort === "price-desc") products = [...products].sort((a, b) => shelf(b) - shelf(a));

  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { collection: sp.collection, sort: sp.sort, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return `/${locale}/shop${s ? `?${s}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
      <Reveal className="mb-10 text-center">
        <h1 className="h-display text-4xl text-ink sm:text-5xl">{dict.shop.title}</h1>
        <p className="mt-3 font-body text-sm text-ink/50">{products.length} {dict.shop.results}</p>
      </Reveal>

      <div className="mb-12 flex flex-col items-center justify-between gap-5 border-y hairline py-4 sm:flex-row">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label={dict.shop.filter}>
          <Link href={qs({ collection: undefined })} className={cn("font-body text-[12px] uppercase tracking-wide2", !sp.collection ? "text-ink underline underline-offset-4" : "text-ink/50 hover:text-ink")}>
            {dict.shop.all}
          </Link>
          {collections.map((c) => (
            <Link key={c.slug} href={qs({ collection: c.slug })} className={cn("font-body text-[12px] uppercase tracking-wide2", sp.collection === c.slug ? "text-ink underline underline-offset-4" : "text-ink/50 hover:text-ink")}>
              {t(c.name, locale)}
            </Link>
          ))}
        </nav>
        <nav className="flex gap-5" aria-label={dict.shop.sort}>
          {[
            { key: undefined, label: dict.shop.sortNew },
            { key: "price-asc", label: dict.shop.sortPriceAsc },
            { key: "price-desc", label: dict.shop.sortPriceDesc },
          ].map((s) => (
            <Link key={s.label} href={qs({ sort: s.key })} className={cn("font-body text-[12px] uppercase tracking-wide2", sp.sort === s.key || (!sp.sort && !s.key) ? "text-ink underline underline-offset-4" : "text-ink/50 hover:text-ink")}>
              {s.label}
            </Link>
          ))}
        </nav>
      </div>

      {products.length === 0 ? (
        <p className="py-20 text-center font-body text-sm text-ink/50">{dict.shop.empty}</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i, 4) * 0.06}>
              <ProductCard product={p} locale={locale} currency={currency} priority={i < 4} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
