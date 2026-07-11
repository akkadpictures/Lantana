"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SUPPORTED_COUNTRIES } from "@/lib/currency";
import type { CountryCode, Currency, Locale } from "@/types";
import type { Dictionary } from "@/lib/i18n";

export function RegionBar({ country, currency, locale, dict }: { country: CountryCode; currency: Currency; locale: Locale; dict: Dictionary }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function select(code: CountryCode) {
    document.cookie = `lantana_country=${code};path=/;max-age=${60 * 60 * 24 * 30}`;
    setOpen(false);
    router.refresh();
  }

  const current = SUPPORTED_COUNTRIES.find((c) => c.code === country);

  return (
    <div className="relative bg-olive text-ivory">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 font-body text-[11px] uppercase tracking-wide2">
        <span className="opacity-80">{dict.currency.detected} {currency}</span>
        <span aria-hidden="true" className="opacity-40">·</span>
        <button className="underline underline-offset-2 hover:opacity-80" onClick={() => setOpen(!open)} aria-expanded={open}>
          {current ? (locale === "ar" ? current.ar : current.en) : dict.currency.change}
        </button>
      </div>
      {open && (
        <div className="absolute inset-x-0 top-full z-40 border-b border-ivory/10 bg-olive-deep">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-6 gap-y-2 px-4 py-3">
            {SUPPORTED_COUNTRIES.map((c) => (
              <button
                key={c.code}
                onClick={() => select(c.code)}
                className={`font-body text-[11px] uppercase tracking-wide2 ${c.code === country ? "text-ivory underline" : "text-ivory/70 hover:text-ivory"}`}
              >
                {locale === "ar" ? c.ar : c.en} · {c.currency}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
