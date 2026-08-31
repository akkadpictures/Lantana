import { cookies, headers } from "next/headers";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { getShippingRates } from "@/lib/db";
import { COUNTRY_CURRENCY, toCountryCode } from "@/lib/currency";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import type { CountryCode, Locale } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "إتمام الطلب" : "Checkout", robots: { index: false } };
}

/**
 * Where the parcel goes, best guess first.
 *
 * An explicit cookie wins — the customer chose it. Otherwise the edge geo header
 * decides, so a first-time visitor in Damascus opens the page on the Syrian rate
 * instead of the $28 DHL fallback. `WW` is the last resort, not the default.
 */
async function resolveCountry(): Promise<CountryCode> {
  const cookieStore = await cookies();
  const chosen = cookieStore.get("lantana_country")?.value;
  if (chosen) return toCountryCode(chosen);

  const h = await headers();
  const geo = h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || "";
  return toCountryCode(geo);
}

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const dict = await getDictionary(locale);
  const country = await resolveCountry();
  const currency = COUNTRY_CURRENCY[country];
  const rates = await getShippingRates();
  return <CheckoutClient locale={locale} country={country} currency={currency} rates={rates} dict={dict} />;
}
