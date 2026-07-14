import { FALLBACK_RATES } from "./rates";
import type { Currency, CountryCode, Locale, Product } from "@/types";

/* ── Currencies offered in the switcher ─────────────────────────────────── */

export const SUPPORTED_CURRENCIES: { code: Currency; en: string; ar: string }[] = [
  { code: "USD", en: "US Dollar", ar: "دولار أمريكي" },
  { code: "SYP", en: "Syrian Pound", ar: "ليرة سورية" },
  { code: "TRY", en: "Turkish Lira", ar: "ليرة تركية" },
  { code: "SAR", en: "Saudi Riyal", ar: "ريال سعودي" },
  { code: "QAR", en: "Qatari Riyal", ar: "ريال قطري" },
  { code: "AED", en: "UAE Dirham", ar: "درهم إماراتي" },
];

export const DEFAULT_CURRENCY: Currency = "USD";

/** Countries the maison ships to — used for the delivery selector at checkout. */
export const SUPPORTED_COUNTRIES: { code: CountryCode; currency: Currency; en: string; ar: string }[] = [
  { code: "SY", currency: "SYP", en: "Syria", ar: "سوريا" },
  { code: "TR", currency: "TRY", en: "Türkiye", ar: "تركيا" },
  { code: "SA", currency: "SAR", en: "Saudi Arabia", ar: "السعودية" },
  { code: "QA", currency: "QAR", en: "Qatar", ar: "قطر" },
  { code: "AE", currency: "AED", en: "United Arab Emirates", ar: "الإمارات" },
  { code: "KW", currency: "KWD", en: "Kuwait", ar: "الكويت" },
  { code: "WW", currency: "USD", en: "International", ar: "دولي" },
];

/** Home currency of each market — used only to pick a sensible default. */
export const COUNTRY_CURRENCY: Record<CountryCode, Currency> = {
  SY: "SYP", TR: "TRY", SA: "SAR", QA: "QAR", AE: "AED", KW: "KWD", WW: "USD",
};

const KNOWN_COUNTRIES = ["SY", "TR", "SA", "QA", "AE", "KW"] as const;

export function toCountryCode(raw: string | undefined | null): CountryCode {
  const c = (raw || "").trim().toUpperCase();
  return (KNOWN_COUNTRIES as readonly string[]).includes(c) ? (c as CountryCode) : "WW";
}

export function toCurrency(raw: string | undefined | null): Currency | null {
  const c = (raw || "").trim().toUpperCase();
  return SUPPORTED_CURRENCIES.some((x) => x.code === c) ? (c as Currency) : null;
}

/* ── The pricing rule ───────────────────────────────────────────────────── */

/**
 * Every price stored on a product is the Syrian home-market price.
 * Outside Syria the maison sells at the export tier — three times the home
 * price — and that multiple is a property of *where the customer is*, never of
 * which currency they happen to be reading in. A visitor in Dubai pays the
 * export price whether they view it in AED, USD or SYP.
 */
export const EXPORT_MULTIPLIER = 3;

export function multiplierFor(country: CountryCode): number {
  return country === "SY" ? 1 : EXPORT_MULTIPLIER;
}

/* ── Formatting ─────────────────────────────────────────────────────────── */

const FRACTIONS: Record<Currency, number> = {
  USD: 2, SYP: 0, TRY: 0, SAR: 2, QAR: 2, AED: 2, KWD: 3,
};

/** Round to a figure that looks considered rather than machine-generated. */
function tidy(value: number, currency: Currency): number {
  const f = FRACTIONS[currency];
  if (currency === "SYP") return Math.round(value / 500) * 500;
  if (currency === "TRY") return Math.round(value / 5) * 5;
  if (f === 0) return Math.round(value);
  return Math.round(value * 10 ** f) / 10 ** f;
}

export function formatPrice(amount: number, currency: Currency, locale: Locale): string {
  const intlLocale = locale === "ar" ? "ar-SY" : "en-US";
  try {
    return new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency,
      maximumFractionDigits: FRACTIONS[currency],
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(intlLocale)} ${currency}`;
  }
}

/* ── Conversion ─────────────────────────────────────────────────────────── */

export type Rates = Record<Currency, number>;

export function convertUSD(amountUSD: number, currency: Currency, rates: Rates = FALLBACK_RATES): number {
  return tidy(amountUSD * (rates[currency] ?? FALLBACK_RATES[currency]), currency);
}

/**
 * Resolves the shelf price of a product for one market.
 *
 * An admin-entered override in the target currency is treated as the *home*
 * price in that currency and is still lifted by the export multiplier, so the
 * two paths — override and conversion — can never disagree about which tier a
 * customer is on.
 */
export function priceOf(
  product: Pick<Product, "basePriceUSD" | "prices">,
  currency: Currency,
  multiplier: number,
  rates: Rates = FALLBACK_RATES
): number {
  const override = product.prices?.[currency];
  if (typeof override === "number" && Number.isFinite(override)) {
    return tidy(override * multiplier, currency);
  }
  return convertUSD(product.basePriceUSD * multiplier, currency, rates);
}

/** Same rule, for a bare USD figure (cart lines, shipping, coupons). */
export function amountOf(
  amountUSD: number,
  currency: Currency,
  multiplier: number,
  rates: Rates = FALLBACK_RATES
): number {
  return convertUSD(amountUSD * multiplier, currency, rates);
}

/* Legacy shim — older call sites still import resolvePrice. Home tier only. */
export function resolvePrice(
  basePriceUSD: number,
  overrides: Partial<Record<Currency, number>> | undefined,
  currency: Currency
): number {
  return priceOf({ basePriceUSD, prices: overrides ?? {} }, currency, 1);
}
