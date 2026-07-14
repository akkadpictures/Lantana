"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart, cartSubtotalUSD } from "@/store/cart";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useMarket } from "@/components/market/MarketProvider";
import { t } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { Currency, Locale } from "@/types";
import type { Dictionary } from "@/lib/i18n";

export function CartPageClient({ locale, dict }: { locale: Locale; currency?: Currency; dict: Dictionary }) {
  const { items, setQty, remove } = useCart();
  const { format, amount } = useMarket();
  const router = useRouter();
  const subtotalUSD = cartSubtotalUSD(items);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-5 py-32 text-center">
        <h1 className="t-h1 text-ink">{dict.cart.title}</h1>
        <p className="t-body">{dict.cart.empty}</p>
        <ButtonLink href={`/${locale}/shop`} variant="outline">{dict.cart.emptyCta}</ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 md:px-10">
      <h1 className="t-h1 mb-14 text-center text-ink">{dict.cart.title}</h1>
      <ul className="space-y-8">
        {items.map((item) => (
          <li key={item.productId} className="flex gap-6 border-b hairline pb-8">
            <Link href={`/${locale}/product/${item.slug}`} className="relative block h-32 w-32 shrink-0 bg-ivory-soft">
              <Image src={item.image} alt={t(item.name, locale)} fill sizes="128px" className="object-cover" />
            </Link>
            <div className="flex flex-1 flex-col">
              <p className="t-h4">{t(item.name, locale)}</p>
              <p className="t-small">{item.size}</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center border border-ink/15">
                  <button aria-label="−" className="px-3 py-1.5 text-ink/60" onClick={() => setQty(item.productId, item.qty - 1)}>−</button>
                  <span className="w-8 text-center font-body text-sm">{item.qty}</span>
                  <button aria-label="+" className="px-3 py-1.5 text-ink/60" onClick={() => setQty(item.productId, item.qty + 1)}>+</button>
                </div>
                <p className="t-price">{format(amount(item.unitPriceUSD * item.qty))}</p>
              </div>
              <button className="mt-2 self-start font-body text-[11px] uppercase tracking-wide2 text-ink/40 hover:text-ink" onClick={() => remove(item.productId)}>
                {dict.cart.remove}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-col items-end gap-4">
        <p className="font-body text-lead">
          {dict.cart.subtotal}: <span className="text-olive-deep tabular-nums">{format(amount(subtotalUSD))}</span>
        </p>
        <Button onClick={() => router.push(`/${locale}/checkout`)} className="w-full sm:w-auto">{dict.cart.checkout}</Button>
      </div>
    </div>
  );
}
