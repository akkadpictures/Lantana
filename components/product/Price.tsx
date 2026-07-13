import { formatPrice, resolvePrice } from "@/lib/currency";
import type { Currency, Locale, Product } from "@/types";

export function Price({ product, currency, locale, className }: { product: Pick<Product, "basePriceUSD" | "prices">; currency: Currency; locale: Locale; className?: string }) {
  const amount = resolvePrice(product.basePriceUSD, product.prices, currency);
  return <span className={className}>{formatPrice(amount, currency, locale)}</span>;
}
