import { LantanaMark } from "@/components/brand/LantanaMark";
import { t } from "@/lib/utils";
import type { FragranceNotes, Locale } from "@/types";
import type { Dictionary } from "@/lib/i18n";

export function NotesPyramid({ notes, locale, dict }: { notes: FragranceNotes; locale: Locale; dict: Dictionary }) {
  const tiers = [
    { label: dict.product.top, items: notes.top },
    { label: dict.product.heart, items: notes.heart },
    { label: dict.product.base, items: notes.base },
  ];
  return (
    <section aria-label={dict.product.notes}>
      <div className="mb-8 flex items-center gap-4">
        <span className="h-px flex-1 bg-ink/10" />
        <LantanaMark className="h-5 w-5 text-olive" />
        <h2 className="eyebrow !text-ink">{dict.product.notes}</h2>
        <LantanaMark className="h-5 w-5 text-olive" />
        <span className="h-px flex-1 bg-ink/10" />
      </div>
      <div className="grid gap-8 sm:grid-cols-3">
        {tiers.map((tier) => (
          <div key={tier.label} className="text-center">
            <p className="eyebrow mb-3">{tier.label}</p>
            <ul className="space-y-1.5">
              {tier.items.map((note, i) => (
                <li key={i} className="font-display text-lg font-light text-ink">{t(note, locale)}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
