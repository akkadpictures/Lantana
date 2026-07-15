"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { Button } from "@/components/ui/Button";
import { cn, t } from "@/lib/utils";
import type { Locale, Product } from "@/types";
import type { Dictionary } from "@/lib/i18n";

export function AddToCart({ product, locale, dict }: { product: Product; locale: Locale; dict: Dictionary }) {
  const add = useCart((s) => s.add);
  const wishlist = useWishlist();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const out = product.inventory <= 0;
  const saved = wishlist.slugs.includes(product.slug);

  function toCartItem() {
    return {
      productId: product.id, slug: product.slug, name: product.name,
      image: product.image, size: product.size, unitPriceUSD: product.basePriceUSD,
    };
  }

  return (
    <div className="space-y-4">
      <div className="flex items-stretch gap-3">
        <div className="flex items-center border border-ink/20">
          <button aria-label="−" className="px-4 py-3 text-ink/60 hover:text-ink" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
          <span className="w-8 text-center font-body text-base2" aria-live="polite">{qty}</span>
          <button aria-label="+" className="px-4 py-3 text-ink/60 hover:text-ink" onClick={() => setQty(Math.min(20, qty + 1))}>+</button>
        </div>
        <Button
          className="flex-1"
          disabled={out}
          onClick={() => { add(toCartItem(), qty); setAdded(true); setTimeout(() => setAdded(false), 2200); }}
        >
          {out ? dict.product.outOfStock : added ? dict.product.added : dict.product.addToCart}
        </Button>
      </div>
      <div className="flex gap-3">
        <Button variant="olive" className="flex-1" disabled={out} onClick={() => { add(toCartItem(), qty); router.push(`/${locale}/checkout`); }}>
          {dict.product.buyNow}
        </Button>
        <button
          onClick={() => wishlist.toggle(product.slug)}
          aria-pressed={saved}
          aria-label={saved ? dict.product.wishlisted : dict.product.wishlist}
          className={cn("grid w-14 place-items-center border transition-colors duration-500", saved ? "border-olive bg-olive text-ivory" : "border-ink/20 text-ink/60 hover:border-ink hover:text-ink")}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"><path d="M12 21s-7.5-4.7-9.5-9C1 8.5 3 5 6.5 5c2 0 3.5 1 4.5 2.5C12 6 13.5 5 15.5 5 19 5 21 8.5 20.5 12c-1 4.3-8.5 9-8.5 9Z" /></svg>
        </button>
      </div>
      {!out && product.inventory <= 10 && (
        <p className="font-body text-sm2 uppercase tracking-wide2 text-olive-deep">{dict.product.lowStock}</p>
      )}
      <span className="sr-only" aria-live="polite">{added ? t(product.name, locale) + " — " + dict.product.added : ""}</span>
    </div>
  );
}
