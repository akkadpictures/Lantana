"use client";

import { useEffect, useRef, useState } from "react";
import { useMarket } from "@/components/market/MarketProvider";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { Currency } from "@/types";

export function CurrencySelect({ className }: { className?: string }) {
  const { currency, setCurrency, locale } = useMarket();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(c: Currency) {
    setCurrency(c);
    setOpen(false);
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex items-center gap-2 font-body text-label uppercase tracking-wide2 transition-opacity duration-300 hover:opacity-70"
      >
        {currency}
        <svg
          className={cn("h-4 w-4 transition-transform duration-300", open && "rotate-180")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute end-0 top-full z-[70] mt-2 min-w-[13rem] border border-ink/10 bg-ivory py-1.5 shadow-[0_18px_50px_-18px_rgba(35,38,28,0.35)]"
        >
          {SUPPORTED_CURRENCIES.map((c) => (
            <li key={c.code}>
              <button
                role="option"
                aria-selected={c.code === currency}
                onClick={() => choose(c.code)}
                className={cn(
                  "flex w-full items-center justify-between gap-6 px-4 py-2.5 text-start font-body text-sm2 transition-colors duration-200",
                  c.code === currency ? "bg-olive/10 text-ink" : "text-ink/70 hover:bg-olive/5 hover:text-ink"
                )}
              >
                <span>{locale === "ar" ? c.ar : c.en}</span>
                <span className="text-micro tracking-wide2 text-olive-deep">{c.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
