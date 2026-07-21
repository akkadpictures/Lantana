"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart, cartCount } from "@/store/cart";
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

  const iconCls = "h-7 w-7 md:h-[30px] md:w-[30px]";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-700 ease-luxe",
        scrolled ? "bg-ivory/92 shadow-[0_1px_0_rgba(35,38,28,0.08)] backdrop-blur-md" : "bg-ivory"
      )}
    >
      <div className="shell flex items-center justify-between py-4 md:py-5">
        {/* Mobile menu button — flex-1 region so the centre logo is truly centred on mobile */}
        <div className="flex flex-1 items-center justify-start lg:hidden">
          <button
            className="flex h-12 w-12 items-center justify-center -ms-3"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? dict.misc.close : dict.misc.menu}
            aria-expanded={menuOpen}
          >
            <span className="relative block h-4 w-8">
              <span className={cn("absolute inset-x-0 top-0 h-px bg-ink transition-all duration-500", menuOpen && "top-2 rotate-45")} />
              <span className={cn("absolute inset-x-0 bottom-0 h-px bg-ink transition-all duration-500", menuOpen && "bottom-2 -rotate-45")} />
            </span>
          </button>
        </div>

        {/* Left nav (desktop) */}
        <nav className="hidden flex-1 items-center gap-8 lg:flex" aria-label="Primary">
          {nav.slice(0, 3).map((n) => (
            <Link key={n.href} href={n.href} className="link-reveal text-nav tracking-wide2 text-ink/80 hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Centre lockup — official logo */}
        <Link href={`/${locale}`} className="group flex items-center" aria-label="LANTANA — home">
          <Image
            src="/images/brand/logo-full-olive.png"
            alt="LANTANA — لانتانا"
            width={1000}
            height={702}
            priority
            className="h-16 w-auto transition-opacity duration-700 ease-luxe group-hover:opacity-80 md:h-20 lg:h-[5.5rem]"
          />
        </Link>

        {/* Right controls */}
        <div className="flex flex-1 items-center justify-end gap-6 md:gap-7">
          <Link href={switchHref} lang={locale === "en" ? "ar" : "en"} className="link-reveal hidden text-nav tracking-wide2 text-ink/80 hover:text-ink sm:block" aria-label="Switch language">
            {dict.misc.language}
          </Link>
          <Link href={`/${locale}/search`} aria-label={dict.nav.search} className="text-ink/80 transition-colors hover:text-ink">
            <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m20.5 20.5-4-4" /></svg>
          </Link>
          <Link href={`/${locale}/wishlist`} aria-label={dict.nav.wishlist} className="hidden text-ink/80 transition-colors hover:text-ink sm:block">
            <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.5s-7.2-4.35-9.2-8.6C1.4 8.6 3 5.3 6.3 5.3c2 0 3.6 1.15 4.7 2.9 1.1-1.75 2.7-2.9 4.7-2.9 3.3 0 4.9 3.3 3.5 6.6-2 4.25-9.2 8.6-9.2 8.6Z" /></svg>
          </Link>
          <button onClick={openCart} aria-label={`${dict.nav.cart} (${count})`} className="relative text-ink/80 transition-colors hover:text-ink">
            <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"><path d="M6.4 8.5h11.2l-.7 11a2 2 0 0 1-2 1.9H9.1a2 2 0 0 1-2-1.9l-.7-11Z" /><path d="M9.2 8.5V6.6a2.8 2.8 0 0 1 5.6 0v1.9" /></svg>
            {count > 0 && (
              <span className="absolute -end-2 -top-2 grid h-[20px] min-w-[20px] place-items-center rounded-full bg-olive px-1 font-body text-label leading-none text-ivory">
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
            <Image src="/images/brand/logo-full-olive.png" alt="LANTANA — لانتانا" width={1000} height={702} className="mb-4 h-16 w-auto self-start" />
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="border-b hairline py-4 font-display text-d3 font-light text-ink">
                {n.label}
              </Link>
            ))}
            <Link href={switchHref} lang={locale === "en" ? "ar" : "en"} className="text-nav mt-6 tracking-wide2 text-olive-deep">
              {dict.misc.language}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
