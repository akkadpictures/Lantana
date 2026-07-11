import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "LANTANA — Admin", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-ivory font-body text-ink">{children}</div>;
}
