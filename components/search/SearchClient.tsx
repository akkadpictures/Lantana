"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { Input } from "@/components/ui/Input";
import { t } from "@/lib/utils";
import type { Currency, Locale, Product } from "@/types";
import type { Dictionary } from "@/lib/i18n";

export function SearchClient({ products, locale, currency, dict }: { products: Product[]; locale: Locale; currency: Currency; dict: Dictionary }) {
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return products;
    const hay = (p: Product) =>
      [
        p.name.en, p.name.ar, p.tagline.en, p.tagline.ar, p.accord.en, p.accord.ar,
        ...p.notes.top.flatMap((x) => [x.en, x.ar]),
        ...p.notes.heart.flatMap((x) => [x.en, x.ar]),
        ...p.notes.base.flatMap((x) => [x.en, x.ar]),
      ].join(" ").toLowerCase();
    return products.filter((p) => hay(p).includes(query));
  }, [q, products]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
      <h1 className="h-display mb-8 text-center text-4xl text-ink">{dict.search.title}</h1>
      <div className="mx-auto mb-14 max-w-xl">
        <Input
          autoFocus type="search" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder={dict.search.placeholder} aria-label={dict.search.placeholder}
          className="py-4 text-center font-display text-lg"
        />
      </div>
      {results.length === 0 ? (
        <p className="py-16 text-center font-body text-sm text-ink/50">{dict.search.empty} “{q}”</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {results.map((p) => <ProductCard key={p.id} product={p} locale={locale} currency={currency} />)}
        </div>
      )}
      <p className="sr-only" aria-live="polite">{results.length} {dict.shop.results}{q && ` — ${t(results[0]?.name ?? { en: "", ar: "" }, locale)}`}</p>
    </div>
  );
}
