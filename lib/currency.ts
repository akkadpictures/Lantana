import type { Currency, CountryCode } from "@/types";

export const COUNTRY_CURRENCY: Record<CountryCode, Currency> = {
  SY: "SYP", AE: "AED", SA: "SAR", QA: "QAR", KW: "KWD", WW: "USD",
};

export const SUPPORTED_COUNTRIES: { code: CountryCode; currency: Currency; en: string; ar: string }[] = [
  { code: "SY", currency: "SYP", en: "Syria", ar: "سوريا" },
  { code: "AE", currency: "AED", en: "United Arab Emirates", ar: "الإمارات" },
  { code: "SA", currency: "SAR", en: "Saudi Arabia", ar: "السعودية" },
  { code: "QA", currency: "QAR", en: "Qatar", ar: "قطر" },
  { code: "KW", currency: "KWD", en: "Kuwait", ar: "الكويت" },
  { code: "WW", currency: "USD", en: "International", ar: "دولي" },
];

/** Fallback conversion used only when a product has no explicit per-currency price set in the admin. */
export const USD_RATES: Record<Currency, number> = {
  USD: 1, SYP: 15000, AED: 3.67, SAR: 3.75, QAR: 3.64, KWD: 0.31,
};

const FRACTIONS: Record<Currency, number> = { USD: 2, SYP: 0, AED: 2, SAR: 2, QAR: 2, KWD: 3 };

export function toCountryCode(raw: string | undefined | null): CountryCode {
  const c = (raw || "").toUpperCase();
  return (["SY", "AE", "SA", "QA", "KW"] as const).includes(c as never) ? (c as CountryCode) : "WW";
}

export function convertUSD(amountUSD: number, currency: Currency): number {
  const v = amountUSD * USD_RATES[currency];
  const f = FRACTIONS[currency];
  if (f === 0) return Math.round(v / 500) * 500; // psychological rounding for SYP
  return Math.round(v * 10 ** f) / 10 ** f;
}

export function resolvePrice(
  basePriceUSD: number,
  overrides: Partial<Record<Currency, number>> | undefined,
  currency: Currency
): number {
  if (overrides && typeof overrides[currency] === "number") return overrides[currency] as number;
  return convertUSD(basePriceUSD, currency);
}

export function formatPrice(amount: number, currency: Currency, locale: "en" | "ar"): string {
  const intlLocale = locale === "ar" ? "ar-SY" : "en-US";
  try {
    return new Intl.NumberFormat(intlLocale, {
      style: "currency", currency, maximumFractionDigits: FRACTIONS[currency],
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(intlLocale)} ${currency}`;
  }
}
