"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { amountOf, formatPrice, priceOf, type Rates } from "@/lib/currency";
import type { Currency, Locale, Product } from "@/types";
import type { Market } from "@/lib/market";

const CURRENCY_COOKIE = "lantana_currency";

interface MarketContextValue extends Market {
  locale: Locale;
  setCurrency: (c: Currency) => void;
  /** Shelf price of a product, formatted for the active currency. */
  price: (p: Pick<Product, "basePriceUSD" | "prices">) => string;
  /** Raw shelf figure — for totals that must be summed before formatting. */
  priceValue: (p: Pick<Product, "basePriceUSD" | "prices">) => number;
  /** Any USD figure (cart line, shipping, discount) lifted to the active tier. */
  amount: (usd: number) => number;
  format: (value: number) => string;
}

const MarketContext = createContext<MarketContextValue | null>(null);

/**
 * Holds the market client-side so switching currency repaints every price on
 * the page immediately — no server round-trip, no flash of stale figures. The
 * cookie is written at the same time so the next server render agrees.
 */
export function MarketProvider({
  market,
  locale,
  children,
}: {
  market: Market;
  locale: Locale;
  children: ReactNode;
}) {
  const [currency, setCurrencyState] = useState<Currency>(market.currency);

  const setCurrency = useCallback((c: Currency) => {
    document.cookie = `${CURRENCY_COOKIE}=${c};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    setCurrencyState(c);
  }, []);

  const value = useMemo<MarketContextValue>(() => {
    const rates: Rates = market.rates;
    const m = market.multiplier;
    return {
      country: market.country,
      currency,
      multiplier: m,
      rates,
      locale,
      setCurrency,
      price: (p) => formatPrice(priceOf(p, currency, m, rates), currency, locale),
      priceValue: (p) => priceOf(p, currency, m, rates),
      amount: (usd) => amountOf(usd, currency, m, rates),
      format: (v) => formatPrice(v, currency, locale),
    };
  }, [market, currency, locale, setCurrency]);

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket(): MarketContextValue {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be used inside <MarketProvider>");
  return ctx;
}
