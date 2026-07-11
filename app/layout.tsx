import type { ReactNode } from "react";
import { headers } from "next/headers";
import { Cormorant_Garamond, Jost, Amiri, IBM_Plex_Sans_Arabic } from "next/font/google";
import { baseMetadata } from "@/lib/seo";
import { isLocale, dir } from "@/lib/i18n/config";
import type { Locale } from "@/types";
import "./globals.css";

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-display", display: "swap" });
const body = Jost({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-body", display: "swap" });
const displayAr = Amiri({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-display-ar", display: "swap" });
const bodyAr = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["300", "400", "500"], variable: "--font-body-ar", display: "swap" });

export const metadata = baseMetadata("en");

export default async function RootLayout({ children }: { children: ReactNode }) {
  const h = await headers();
  const raw = h.get("x-lantana-locale") || "en";
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return (
    <html lang={locale} dir={dir(locale)} className={`${display.variable} ${body.variable} ${displayAr.variable} ${bodyAr.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}
