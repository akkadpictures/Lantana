"use client";

import { useMarket } from "@/components/market/MarketProvider";
import { cn } from "@/lib/utils";
import type { Currency, Locale, Product } from "@/types";

/**
 * The price of one product, in whatever currency the visitor has chosen.
 *
 * `currency` and `locale` are still accepted so that the dozens of existing
 * server call sites keep compiling, but they are ignored: the live market —
 * tier, currency and rates — is read from context so a currency switch repaints
 * every figure on the page at once.
 */
export function Price({
  product,
  className,
}: {
  product: Pick<Product, "basePriceUSD" | "prices">;
  currency?: Currency;
  locale?: Locale;
  className?: string;
}) {
  const { price } = useMarket();
  return <span className={cn("tabular-nums", className)}>{price(product)}</span>;
}
