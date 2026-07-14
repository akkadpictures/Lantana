import type { Currency } from "@/types";

/**
 * Units of each currency per 1 USD.
 *
 * These are the safety net: they are used when the live feed is unreachable, is
 * slow, or omits a currency. They are deliberately close to real market levels
 * so that a feed outage degrades the price by a few percent rather than by an
 * order of magnitude.
 */
export const FALLBACK_RATES: Record<Currency, number> = {
  USD: 1,
  SYP: 13000,
  TRY: 42,
  SAR: 3.75,
  QAR: 3.64,
  AED: 3.6725,
  KWD: 0.307,
};

/**
 * The Syrian pound is the one rate a public feed cannot be trusted on: feeds
 * publish the official peg, while the market trades far away from it. Setting
 * SYP_PER_USD in the environment (or in the admin) always wins.
 */
function sypOverride(): number | null {
  const raw = process.env.SYP_PER_USD || process.env.NEXT_PUBLIC_SYP_PER_USD;
  const n = raw ? Number(String(raw).trim()) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

const CURRENCIES: Currency[] = ["USD", "SYP", "TRY", "SAR", "QAR", "AED", "KWD"];

/**
 * Fetches live USD-based rates. Cached by Next's data cache for six hours, so a
 * page render never blocks on the network more than four times a day, and every
 * visitor in that window sees an identical price.
 */
export async function getRates(): Promise<Record<Currency, number>> {
  const rates: Record<Currency, number> = { ...FALLBACK_RATES };

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 21600 },
    });
    if (res.ok) {
      const data = (await res.json()) as { result?: string; rates?: Record<string, number> };
      if (data.result === "success" && data.rates) {
        for (const c of CURRENCIES) {
          const v = data.rates[c];
          if (typeof v === "number" && Number.isFinite(v) && v > 0) rates[c] = v;
        }
      }
    }
  } catch {
    /* Offline or rate-limited — the fallback table stands in. */
  }

  const syp = sypOverride();
  if (syp) rates.SYP = syp;

  rates.USD = 1;
  return rates;
}
