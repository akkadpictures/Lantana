import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getDictionary } from "@/lib/i18n";
import { isLocale, locales } from "@/lib/i18n/config";
import { baseMetadata, organizationJsonLd } from "@/lib/seo";
import { COUNTRY_CURRENCY, toCountryCode } from "@/lib/currency";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RegionBar } from "@/components/layout/RegionBar";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Preloader } from "@/components/brand/Preloader";
import type { Locale } from "@/types";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return baseMetadata(isLocale(locale) ? (locale as Locale) : "en");
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const cookieStore = await cookies();
  const country = toCountryCode(cookieStore.get("lantana_country")?.value);
  const currency = COUNTRY_CURRENCY[country];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <Preloader />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-[110] focus:bg-olive focus:px-4 focus:py-2 focus:text-ivory">
        Skip to content
      </a>
      <RegionBar country={country} currency={currency} locale={locale} dict={dict} />
      <Header locale={locale} dict={dict} />
      <main id="main" className="min-h-screen">{children}</main>
      <Footer locale={locale} dict={dict} />
      <CartDrawer locale={locale} currency={currency} dict={dict} />
    </>
  );
}
