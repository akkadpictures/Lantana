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

  const otherLocale = locale === "en" ? "ar" : "en";
  const switchHref = pathname.replace(`/${locale}`, `/${otherLocale}`) || `/${otherLocale}`;

  const nav = [
    { href: `/${locale}/shop`, label: dict.nav.shop },
    { href: `/${locale}/collections`, label: dict.nav.collections },
    { href: `/${locale}/about`, label: dict.nav.maison },
    { href: `/${locale}/journal`, label: dict.nav.journal },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-700 ease-luxe",
        scrolled ? "bg-ivory/90 shadow-[0_1px_0_rgba(35,38,28,0.08)] backdrop-blur-md" : "bg-ivory"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        {/* Mobile menu button */}
        <button
          className="flex h-10 w-10 items-center justify-center lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? dict.misc.close : dict.misc.menu}
          aria-expanded={menuOpen}
        >
          <span className="relative block h-3 w-6">
            <span className={cn("absolute inset-x-0 top-0 h-px bg-ink transition-all duration-500", menuOpen && "top-1.5 rotate-45")} />
            <span className={cn("absolute inset-x-0 bottom-0 h-px bg-ink transition-all duration-500", menuOpen && "bottom-1.5 -rotate-45")} />
          </span>
        </button>

        {/* Left nav (desktop) */}
        <nav className="hidden flex-1 items-center gap-7 lg:flex" aria-label="Primary">
          {nav.slice(0, 3).map((n) => (
            <Link key={n.href} href={n.href} className="link-reveal font-body text-[12px] uppercase tracking-wide2 text-ink/80 hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Center wordmark */}
        <Link href={`/${locale}`} className="group flex flex-col items-center gap-1" aria-label="LANTANA — home">
          <LantanaMark className="h-6 w-6 text-olive transition-transform duration-700 ease-luxe group-hover:rotate-[24deg]" />
          <span className="font-display text-xl font-light tracking-luxe text-ink ltr:pl-1">LANTANA</span>
        </Link>

        {/* Right controls */}
        <div className="flex flex-1 items-center justify-end gap-5">
          <Link href={switchHref} className="link-reveal hidden font-body text-[12px] uppercase tracking-wide2 text-ink/80 sm:block" aria-label="Switch language">
            {dict.misc.language}
          </Link>
          <Link href={`/${locale}/search`} aria-label={dict.nav.search} className="text-ink/80 hover:text-ink">
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          </Link>
          <Link href={`/${locale}/wishlist`} aria-label={dict.nav.wishlist} className="hidden text-ink/80 hover:text-ink sm:block">
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 21s-7.5-4.7-9.5-9C1 8.5 3 5 6.5 5c2 0 3.5 1 4.5 2.5C12 6 13.5 5 15.5 5 19 5 21 8.5 20.5 12c-1 4.3-8.5 9-8.5 9Z" /></svg>
          </Link>
          <button onClick={openCart} aria-label={`${dict.nav.cart} (${count})`} className="relative text-ink/80 hover:text-ink">
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 8h12l-1 12H7L6 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
            {count > 0 && (
              <span className="absolute -end-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-olive px-1 font-body text-[10px] text-ivory">
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
          <div className="flex flex-col gap-1 px-6 py-6">
            {nav.map((n, i) => (
              <Link key={n.href} href={n.href} className="py-2.5 font-display text-2xl font-light text-ink" style={{ transitionDelay: `${i * 40}ms` }}>
                {n.label}
              </Link>
            ))}
            <Link href={switchHref} className="mt-4 font-body text-[12px] uppercase tracking-wide2 text-olive-deep">
              {dict.misc.language}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
