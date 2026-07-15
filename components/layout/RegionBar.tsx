"use client";

import { CurrencySelect } from "@/components/layout/CurrencySelect";
import { Social } from "@/components/layout/Social";
import { useMarket } from "@/components/market/MarketProvider";
import type { CountryCode, Currency, Locale } from "@/types";
import type { Dictionary } from "@/lib/i18n";

/**
 * The announcement bar.
 *
 * Three jobs, one line: say something worth saying, offer the two direct
 * channels, and let the visitor set the currency they think in. Country is
 * deliberately *not* selectable — the price tier follows where you are, not
 * what you claim.
 *
 * `country` and `currency` are still accepted for call-site compatibility; the
 * live values come from market context.
 */
export function RegionBar({
  locale,
  dict,
}: {
  country?: CountryCode;
  currency?: Currency;
  locale: Locale;
  dict: Dictionary;
}) {
  const { country } = useMarket();

  return (
    <div className="bg-olive text-ivory">
      <div className="shell flex items-center justify-between gap-4 py-3">
        <Social size="md" className="text-ivory/90" />

        <p className="hidden font-body text-label uppercase tracking-luxe text-ivory/90 md:block">
          {country === "SY" ? dict.footer.madeIn : dict.hero.eyebrow}
        </p>

        <CurrencySelect className="text-ivory/90" />
      </div>
    </div>
  );
}
