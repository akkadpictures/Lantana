import { LantanaMark } from "@/components/brand/LantanaMark";
import { arDigits, t } from "@/lib/utils";
import type { FragranceNotes, Locale } from "@/types";
import type { Dictionary } from "@/lib/i18n";

/**
 * The olfactive pyramid, read as tone.
 *
 * A fragrance descends: the top notes are volatile and light, the base is
 * dense and dark. So the three tiers are three steps of one colour ramp,
 * lightest to deepest — the palette IS the pyramid, and the eye understands
 * the structure before it reads a single word.
 *
 * Each composition carries its own ramp, pulled from what it actually smells
 * of: Asrar burns down to oud smoke, Barq stays in wet green, Lunéa fades to
 * powdered rose. The bands step inward as they deepen, so the block leans
 * into the page rather than sitting in a grid.
 */

type Ramp = readonly [string, string, string];

const RAMPS: Record<string, Ramp> = {
  // Powdery rose — blush into a bruised mauve.
  lunea: ["#EBD9D3", "#C29A9B", "#5E3A46"],
  "lunea-100": ["#EBD9D3", "#C29A9B", "#5E3A46"],
  // Solar white floral — first light on jasmine.
  yasmeen: ["#F3ECDB", "#DFC583", "#7E6A33"],
  // Ambery night floral in plum glass.
  moon: ["#DCCEDB", "#A589A3", "#38223E"],
  // White musk, skin, morning linen.
  misk: ["#F1ECE4", "#D3C7B7", "#736656"],
  // Smoky rose oud — the maison's darkest hour.
  asrar: ["#DCC0AE", "#BA8576", "#38201D"],
  // Velvet amber — plum, tonka, benzoin.
  layal: ["#E2C6A9", "#C3835D", "#3A1E1B"],
  // Regal incense oud — cypress, Taif rose, labdanum.
  waqaar: ["#DACFB9", "#AE8D5A", "#2C2517"],
  // Electric vetiver — the second before rain.
  barq: ["#DEE6DC", "#8CA689", "#2B3D33"],
  // The house itself.
  "discovery-coffret": ["#D5D8C9", "#8F966A", "#373A29"],
};

/** House olive ramp — used for anything without its own palette yet. */
const FALLBACK: Ramp = ["#D5D8C9", "#8F966A", "#373A29"];

/**
 * Pick ink or ivory by actual contrast ratio, not a luminance threshold.
 * A fixed cutoff sends mid-tones to the wrong side: a band can be "dark
 * enough" by luminance and still read at 2:1 against ivory.
 */
const INK = "#23261C";
const IVORY = "#F1EEE8";

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function readableOn(bg: string): { fg: string; muted: string } {
  const onInk = contrast(bg, INK);
  const onIvory = contrast(bg, IVORY);
  return onInk >= onIvory
    ? { fg: INK, muted: "rgba(35,38,28,0.58)" }
    : { fg: IVORY, muted: "rgba(241,238,232,0.64)" };
}

export function NotesPyramid({
  notes,
  locale,
  dict,
  slug,
}: {
  notes: FragranceNotes;
  locale: Locale;
  dict: Dictionary;
  slug?: string;
}) {
  const ramp = (slug && RAMPS[slug]) || FALLBACK;
  const ar = locale === "ar";

  const tiers = [
    { label: dict.product.top, items: notes.top },
    { label: dict.product.heart, items: notes.heart },
    { label: dict.product.base, items: notes.base },
  ];

  return (
    <section aria-label={dict.product.notes}>
      <div className="mb-10 flex items-center gap-4">
        <span className="h-px flex-1 bg-ink/10" />
        <LantanaMark className="h-5 w-5 text-olive" />
        <h2 className="eyebrow !text-ink">{dict.product.notes}</h2>
        <LantanaMark className="h-5 w-5 text-olive" />
        <span className="h-px flex-1 bg-ink/10" />
      </div>

      {/* The descent. Each band steps inward as the composition deepens. */}
      <div className="flex flex-col">
        {tiers.map((tier, i) => {
          const bg = ramp[i];
          const { fg, muted } = readableOn(bg);
          const ordinal = ar ? arDigits(i + 1) : String(i + 1).padStart(2, "0");

          return (
            <div
              key={tier.label}
              style={{
                backgroundColor: bg,
                color: fg,
                marginInlineStart: `${i * 5}%`,
                marginInlineEnd: `${(2 - i) * 2}%`,
              }}
              className="relative px-6 py-7 transition-[margin] duration-700 ease-luxe sm:px-10 sm:py-9"
            >
              <div className="flex flex-col gap-x-10 gap-y-4 sm:flex-row sm:items-baseline sm:justify-between">
                <div className="flex items-baseline gap-4">
                  <span
                    className="font-body text-micro tabular-nums"
                    style={{ color: muted, letterSpacing: ar ? "0" : "0.18em" }}
                  >
                    {ordinal}
                  </span>
                  <p
                    className="font-body text-micro uppercase"
                    style={{ color: muted, letterSpacing: ar ? "0" : "0.28em" }}
                  >
                    {tier.label}
                  </p>
                </div>

                <p
                  className="font-display text-d4 font-light leading-tight sm:max-w-[62%] sm:text-end"
                  style={{ color: fg }}
                >
                  {tier.items.map((note, k) => (
                    <span key={k}>
                      {t(note, locale)}
                      {k < tier.items.length - 1 && (
                        <span style={{ color: muted }}> · </span>
                      )}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
