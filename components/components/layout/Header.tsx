"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart, cartCount } from "@/store/cart";
import { LantanaMark } from "@/components/brand/LantanaMark";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";
import type { Dictionary } from "@/lib/i18n";

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const pathname = usePathname();
  const count = cartCount(items);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  /* English lives at the bare path; Arabic keeps its /ar prefix. */
  const stripped = pathname.replace(/^\/(en|ar)(?=\/|$)/, "") || "";
  const switchHref = locale === "en" ? `/ar${stripped}` : stripped || "/";

  const nav = [
    { href: `/${locale}/shop`, label: dict.nav.shop },
    { href: `/${locale}/collections`, label: dict.nav.collections },
    { href: `/${locale}/gallery`, label: dict.nav.gallery },
    { href: `/${locale}/about`, label: dict.nav.maison },
    { href: `/${locale}/journal`, label: dict.nav.journal },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];

  const iconCls = "h-5 w-5";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-700 ease-luxe",
        scrolled ? "bg-ivory/92 shadow-[0_1px_0_rgba(35,38,28,0.08)] backdrop-blur-md" : "bg-ivory"
      )}
    >
      <div className="shell flex items-center justify-between py-5">
        {/* Mobile menu button */}
        <button
          className="flex h-11 w-11 items-center justify-center -ms-3 lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? dict.misc.close : dict.misc.menu}
          aria-expanded={menuOpen}
        >
          <span className="relative block h-3.5 w-7">
            <span className={cn("absolute inset-x-0 top-0 h-px bg-ink transition-all duration-500", menuOpen && "top-1.5 rotate-45")} />
            <span className={cn("absolute inset-x-0 bottom-0 h-px bg-ink transition-all duration-500", menuOpen && "bottom-2 -rotate-45")} />
          </span>
        </button>

        {/* Left nav (desktop) */}
        <nav className="hidden flex-1 items-center gap-9 lg:flex" aria-label="Primary">
          {nav.slice(0, 3).map((n) => (
            <Link key={n.href} href={n.href} className="link-reveal t-nav tracking-wide2 text-ink/75 hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Centre lockup */}
        <Link href={`/${locale}`} className="group flex flex-col items-center gap-2" aria-label="LANTANA — home">
          <LantanaMark className="h-8 w-8 text-olive transition-transform duration-700 ease-luxe group-hover:rotate-[24deg]" />
          <span className="font-display text-d5 font-light tracking-luxe text-ink ltr:pl-1">LANTANA</span>
        </Link>

        {/* Right controls */}
        <div className="flex flex-1 items-center justify-end gap-6">
          <Link href={switchHref} className="link-reveal t-nav hidden tracking-wide2 text-ink/75 hover:text-ink sm:block" aria-label="Switch language">
            {dict.misc.language}
          </Link>
          <Link href={`/${locale}/search`} aria-label={dict.nav.search} className="text-ink/80 transition-colors hover:text-ink">
            <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          </Link>
          <Link href={`/${locale}/wishlist`} aria-label={dict.nav.wishlist} className="hidden text-ink/80 transition-colors hover:text-ink sm:block">
            <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 21s-7.5-4.7-9.5-9C1 8.5 3 5 6.5 5c2 0 3.5 1 4.5 2.5C12 6 13.5 5 15.5 5 19 5 21 8.5 20.5 12c-1 4.3-8.5 9-8.5 9Z" /></svg>
          </Link>
          <button onClick={openCart} aria-label={`${dict.nav.cart} (${count})`} className="relative text-ink/80 transition-colors hover:text-ink">
            <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 8h12l-1 12H7L6 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
            {count > 0 && (
              <span className="absolute -end-2 -top-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-olive px-1 font-body text-micro leading-none text-ivory">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "grid overflow-hidden bg-ivory transition-all duration-700 ease-luxe lg:hidden",
          menuOpen ? "grid-rows-[1fr] border-t hairline" : "grid-rows-[0fr]"
        )}
      >
        <nav className="min-h-0 overflow-hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1 px-6 py-8">
            <LantanaMark className="mb-4 h-8 w-8 text-olive" />
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="border-b hairline py-4 font-display text-d4 font-light text-ink">
                {n.label}
              </Link>
            ))}
            <Link href={switchHref} className="t-nav mt-6 tracking-wide2 text-olive-deep">
              {dict.misc.language}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
