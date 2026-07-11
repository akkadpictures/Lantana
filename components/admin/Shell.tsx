"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LantanaMark } from "@/components/brand/LantanaMark";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/pricing", label: "Country pricing" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/shipping", label: "Shipping" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/blog", label: "Journal" },
  { href: "/admin/settings", label: "Settings" },
];

export function Shell({ children, title }: { children: React.ReactNode; title: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={cn("fixed inset-y-0 left-0 z-40 w-60 -translate-x-full border-r hairline bg-ivory-soft transition-transform duration-300 lg:static lg:translate-x-0", open && "translate-x-0")}>
        <div className="flex items-center gap-2 border-b hairline px-6 py-5">
          <LantanaMark className="h-6 w-6 text-olive" />
          <span className="font-display text-lg tracking-wide2">LANTANA</span>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {NAV.map((n) => {
            const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                className={cn("rounded px-3 py-2 font-body text-sm transition-colors", active ? "bg-olive text-ivory" : "text-ink/70 hover:bg-ink/5")}>
                {n.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={logout} className="mx-3 mt-2 rounded px-3 py-2 text-start font-body text-sm text-ink/60 hover:bg-ink/5">Sign out</button>
      </aside>

      {open && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-ink/20 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b hairline bg-ivory/90 px-5 py-4 backdrop-blur md:px-8">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="font-display text-2xl font-light">{title}</h1>
          <Link href="/en" target="_blank" className="font-body text-[11px] uppercase tracking-wide2 text-ink/50 hover:text-ink">View site ↗</Link>
        </header>
        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
