"use client";

import { useWishlist } from "@/store/wishlist";
import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import type { Currency, Locale, Product } from "@/types";
import type { Dictionary } from "@/lib/i18n";

export function WishlistClient({ products, locale, currency, dict }: { products: Product[]; locale: Locale; currency: Currency; dict: Dictionary }) {
  const slugs = useWishlist((s) => s.slugs);
  const saved = products.filter((p) => slugs.includes(p.slug));

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
      <h1 className="h-display mb-12 text-center text-d2 text-ink">{dict.wishlist.title}</h1>
      {saved.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <p className="font-body text-base2 text-ink/60">{dict.wishlist.empty}</p>
          <ButtonLink href={`/${locale}/shop`} variant="outline">{dict.cart.emptyCta}</ButtonLink>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {saved.map((p) => <ProductCard key={p.id} product={p} locale={locale} currency={currency} />)}
        </div>
      )}
    </div>
  );
}
