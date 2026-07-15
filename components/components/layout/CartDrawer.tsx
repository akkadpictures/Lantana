"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCart, cartSubtotalUSD } from "@/store/cart";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useMarket } from "@/components/market/MarketProvider";
import { t } from "@/lib/utils";
import type { Currency, Locale } from "@/types";
import type { Dictionary } from "@/lib/i18n";

export function CartDrawer({ locale, dict }: { locale: Locale; currency?: Currency; dict: Dictionary }) {
  const { items, isOpen, close, setQty, remove } = useCart();
  const { amount, format } = useMarket();
  const subtotalUSD = cartSubtotalUSD(items);
  const isRTL = locale === "ar";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            aria-label={dict.misc.close}
            className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            role="dialog" aria-modal="true" aria-label={dict.cart.title}
            className="fixed bottom-0 top-0 z-[70] flex w-full max-w-md flex-col bg-ivory shadow-2xl ltr:right-0 rtl:left-0"
            initial={{ x: isRTL ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? "-100%" : "100%" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b hairline px-6 py-5">
              <h2 className="t-h4">{dict.cart.title}</h2>
              <button onClick={close} aria-label={dict.misc.close} className="text-d4 leading-none text-ink/60 hover:text-ink">×</button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
                <p className="t-body">{dict.cart.empty}</p>
                <ButtonLink href={`/${locale}/shop`} variant="outline">{dict.cart.emptyCta}</ButtonLink>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
                  {items.map((item) => (
                    <li key={item.productId} className="flex gap-4">
                      <Link href={`/${locale}/product/${item.slug}`} onClick={close} className="relative block h-24 w-24 shrink-0 bg-ivory-soft">
                        <Image src={item.image} alt={t(item.name, locale)} fill sizes="96px" className="object-cover" />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <p className="font-display text-d5 font-light">{t(item.name, locale)}</p>
                        <p className="font-body text-sm2 text-ink/50">{item.size}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center border border-ink/15 text-base2">
                            <button aria-label="−" className="px-2.5 py-1 text-ink/60" onClick={() => setQty(item.productId, item.qty - 1)}>−</button>
                            <span className="w-6 text-center font-body">{item.qty}</span>
                            <button aria-label="+" className="px-2.5 py-1 text-ink/60" onClick={() => setQty(item.productId, item.qty + 1)}>+</button>
                          </div>
                          <p className="font-body text-base2 text-olive-deep">
                            {format(amount(item.unitPriceUSD * item.qty))}
                          </p>
                        </div>
                        <button className="mt-1 self-start font-body text-micro uppercase tracking-wide2 text-ink/40 hover:text-ink" onClick={() => remove(item.productId)}>
                          {dict.cart.remove}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t hairline px-6 py-5">
                  <div className="mb-1 flex justify-between font-body text-base2">
                    <span className="text-ink/60">{dict.cart.subtotal}</span>
                    <span className="tabular-nums">{format(amount(subtotalUSD))}</span>
                  </div>
                  <p className="mb-4 font-body text-sm2 text-ink/40">{dict.cart.shipping}: {dict.cart.shippingAtCheckout}</p>
                  <Link href={`/${locale}/checkout`} onClick={close} className="block">
                    <Button className="w-full">{dict.cart.checkout}</Button>
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
