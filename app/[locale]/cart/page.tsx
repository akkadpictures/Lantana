import { cookies } from "next/headers";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { COUNTRY_CURRENCY, toCountryCode } from "@/lib/currency";
import { CartPageClient } from "@/components/cart/CartPageClient";
import type { Locale } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "السلة" : "Cart", robots: { index: false } };
}

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const dict = await getDictionary(locale);
  const cookieStore = await cookies();
  const currency = COUNTRY_CURRENCY[toCountryCode(cookieStore.get("lantana_country")?.value)];
  return <CartPageClient locale={locale} currency={currency} dict={dict} />;
}
