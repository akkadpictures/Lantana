import { cookies, headers } from "next/headers";
import { getRates } from "./rates";
import { COUNTRY_CURRENCY, multiplierFor, toCountryCode, toCurrency, type Rates } from "./currency";
import type { CountryCode, Currency } from "@/types";

export const COUNTRY_COOKIE = "lantana_country";
export const CURRENCY_COOKIE = "lantana_currency";

export interface Market {
  /** Where the visitor actually is. Decides the price tier. Not user-selectable. */
  country: CountryCode;
  /** What the visitor reads prices in. Freely selectable, defaults to USD. */
  currency: Currency;
  /** 1 inside Syria, 3 everywhere else. */
  multiplier: number;
  rates: Rates;
}

/**
 * Resolves the market for the current request.
 *
 * Country comes from the edge geo header first and the cookie only as a
 * fallback: the tier a customer pays must not be something they can flip by
 * editing a cookie. Currency is the opposite — it is purely presentational, so
 * the cookie is authoritative there.
 */
export async function getMarket(): Promise<Market> {
  const [h, c] = await Promise.all([headers(), cookies()]);

  const geo = h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || "";
  const country = toCountryCode(geo || c.get(COUNTRY_COOKIE)?.value);

  const chosen = toCurrency(c.get(CURRENCY_COOKIE)?.value);
  const currency: Currency = chosen ?? (country === "SY" ? COUNTRY_CURRENCY.SY : "USD");

  return {
    country,
    currency,
    multiplier: multiplierFor(country),
    rates: await getRates(),
  };
}
