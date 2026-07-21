"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LantanaMark } from "@/components/brand/LantanaMark";
import { cn } from "@/lib/utils";

/* ── Icons (inline, stroke 1.6) ─────────────────────────────── */
function Icon({ name, className }: { name: string; className?: string }) {
  const p: Record<string, React.ReactNode> = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    orders: <><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7V5.5a3 3 0 0 1 6 0V7" /></>,
    customers: <><circle cx="9" cy="8" r="3" /><path d="M4 20a5 5 0 0 1 10 0" /><path d="M16 6.5a3 3 0 0 1 0 5.8" /><path d="M20 20a5 5 0 0 0-3.5-4.8" /></>,
    products: <><path d="m12 2 8 4.5v9L12 20l-8-4.5v-9L12 2Z" /><path d="m4 6.8 8 4.5 8-4.5" /><path d="M12 11.3V20" /></>,
    inventory: <><path d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5Z" /><path d="m3 12 9 4.5L21 12" /><path d="m3 16.5 9 4.5 9-4.5" /></>,
    pricing: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.5 3.8 5.7 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3Z" /></>,
    collections: <><rect x="3" y="4" width="8" height="8" rx="1.5" /><rect x="13" y="4" width="8" height="5" rx="1.5" /><rect x="3" y="14" width="8" height="6" rx="1.5" /><rect x="13" y="11" width="8" height="9" rx="1.5" /></>,
    shipping: <><path d="M3 6h11v9H3z" /><path d="M14 9h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></>,
    coupons: <><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" /><path d="M15 6v12" strokeDasharray="2 2.5" /></>,
    reviews: <><path d="M12 3.5l2.6 5.3 5.9.8-4.3 4.1 1 5.8L12 17l-5.2 2.5 1-5.8L3.5 9.6l5.9-.8L12 3.5Z" /></>,
    journal: <><path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Z" /><path d="M18 20a2 2 0 0 0 2-2V6" /><path d="M9 8h6M9 12h6" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></>,
    logout: <><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 12h9M16 8l4 4-4 4" /></>,
    external: <><path d="M14 4h6v6" /><path d="M20 4 10 14" /><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" /></>,
  };
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {p[name]}
    </svg>
  );
}

const GROUPS: { label: string; items: { href: string; label: string; icon: string }[] }[] = [
  { label: "Store", items: [
    { href: "/admin", label: "Overview", icon: "overview" },
    { href: "/admin/orders", label: "Orders", icon: "orders" },
    { href: "/admin/customers", label: "Customers", icon: "customers" },
  ] },
  { label: "Catalogue", items: [
    { href: "/admin/products", label: "Products", icon: "products" },
    { href: "/admin/inventory", label: "Inventory", icon: "inventory" },
    { href: "/admin/collections", label: "Collections", icon: "collections" },
    { href: "/admin/pricing", label: "Country pricing", icon: "pricing" },
  ] },
  { label: "Marketing", items: [
    { href: "/admin/coupons", label: "Coupons", icon: "coupons" },
    { href: "/admin/reviews", label: "Reviews", icon: "reviews" },
    { href: "/admin/blog", label: "Journal", icon: "journal" },
  ] },
  { label: "System", items: [
    { href: "/admin/shipping", label: "Shipping", icon: "shipping" },
    { href: "/admin/settings", label: "Settings", icon: "settings" },
  ] },
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
    <div className="flex min-h-screen bg-[#f6f4ee] text-ink">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-ink/8 bg-ivory transition-transform duration-300 lg:static lg:translate-x-0",
          open && "translate-x-0"
        )}
      >
        <div className="flex items-center gap-3 px-6 py-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-olive/10">
            <LantanaMark className="h-6 w-6 text-olive" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg tracking-[0.2em] text-ink">LANTANA</span>
            <span className="mt-1 font-body text-[10px] uppercase tracking-[0.28em] text-ink/40">Maison · Admin</span>
          </span>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
          {GROUPS.map((g) => (
            <div key={g.label}>
              <p className="px-3 pb-2 font-body text-[10px] font-medium uppercase tracking-[0.22em] text-ink/35">{g.label}</p>
              <div className="space-y-0.5">
                {g.items.map((n) => {
                  const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-[0.9rem] transition-all duration-200",
                        active ? "bg-olive text-ivory shadow-[0_8px_20px_-10px_rgba(120,126,89,0.7)]" : "text-ink/65 hover:bg-olive/8 hover:text-ink"
                      )}
                    >
                      <Icon name={n.icon} className={cn("h-[18px] w-[18px] shrink-0", active ? "text-ivory" : "text-ink/45 group-hover:text-olive")} />
                      {n.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-ink/8 p-3">
          <Link href="/en" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-[0.9rem] text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink">
            <Icon name="external" className="h-[18px] w-[18px] text-ink/45" /> View site
          </Link>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start font-body text-[0.9rem] text-ink/60 transition-colors hover:bg-red-50 hover:text-red-700">
            <Icon name="logout" className="h-[18px] w-[18px]" /> Sign out
          </button>
        </div>
      </aside>

      {open && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-ink/30 backdrop-blur-[2px] lg:hidden" onClick={() => setOpen(false)} />}

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink/8 bg-ivory/95 px-5 py-4 md:px-10">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
              <p className="font-body text-[10px] uppercase tracking-[0.24em] text-ink/40">Dashboard</p>
              <h1 className="font-display text-[1.7rem] font-light leading-tight text-ink">{title}</h1>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-ink/10 bg-ivory px-3.5 py-1.5 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-body text-[11px] uppercase tracking-[0.18em] text-ink/55">Live</span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] flex-1 p-5 md:p-10">{children}</main>
      </div>
    </div>
  );
}
