import type { ReactNode } from "react";
import "./globals.css";

/* Root layout only wraps; html/body live in app/[locale]/layout.tsx and admin layout. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
