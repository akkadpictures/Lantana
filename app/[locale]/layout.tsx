import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Cormorant_Garamond, Jost, Amiri, IBM_Plex_Sans_Arabic } from "next/font/google";
import { getDictionary } from "@/lib/i18n";
import { isLocale, dir, locales } from "@/lib/i18n/config";
import { baseMetadata, organizationJsonLd } from "@/lib/seo";
import { COUNTRY_CURRENCY } from "@/lib/currency";
import { toCountryCode } from "@/lib/currency";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RegionBar } from "@/components/layout/RegionBar";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Preloader } from "@/components/brand/Preloader";
import type { Locale } from "@/types";

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-display", display: "swap" });
const body = Jost({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-body", display: "swap" });
const displayAr = Amiri({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-display-ar", display: "swap" });
const bodyAr = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["300", "400", "500"], variable: "--font-body-ar", display: "swap" });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return baseMetadata(isLocale(locale) ? locale : "en");
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
    <html lang={locale} dir={dir(locale)} className={`${display.variable} ${body.variable} ${displayAr.variable} ${bodyAr.variable}`}>
      <body className="font-body">
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
      </body>
    </html>
  );
}
