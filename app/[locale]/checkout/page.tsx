import { cookies } from "next/headers";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { getShippingRates } from "@/lib/db";
import { COUNTRY_CURRENCY, toCountryCode } from "@/lib/currency";
import { hasStripe } from "@/lib/stripe";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import type { Locale } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "إتمام الطلب" : "Checkout", robots: { index: false } };
}

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const dict = await getDictionary(locale);
  const cookieStore = await cookies();
  const country = toCountryCode(cookieStore.get("lantana_country")?.value);
  const currency = COUNTRY_CURRENCY[country];
  const rates = await getShippingRates();
  // Which online gateways are configured (server-side). COD + bank transfer are always available.
  const gateways = { stripe: hasStripe, myfatoorah: Boolean(process.env.MYFATOORAH_API_KEY) };
  return <CheckoutClient locale={locale} country={country} currency={currency} rates={rates} dict={dict} gateways={gateways} />;
}
