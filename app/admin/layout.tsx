import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Jost } from "next/font/google";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-display",
  display: "swap",
});

const body = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LANTANA — Admin",
  robots: { index: false, follow: false },
  // تطبيق على الشاشة الرئيسية — أيقونة خاصة بالإدارة، منفصلة عن المتجر
  manifest: "/images/app/admin.webmanifest",
  icons: { apple: [{ url: "/images/app/admin-touch-180.png?v=1", sizes: "180x180" }] },
  appleWebApp: { capable: true, title: "LANTANA", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#565B3F", viewportFit: "cover" };

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-ivory font-body text-ink">{children}</body>
    </html>
  );
}
