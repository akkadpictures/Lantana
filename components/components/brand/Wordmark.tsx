import { cn } from "@/lib/utils";
import { LantanaMark } from "./LantanaMark";
import type { Locale } from "@/types";

const tones = {
  ink: "text-ink",
  ivory: "text-ivory",
  olive: "text-olive",
} as const;

/**
 * The full lockup: floret, wordmark, Arabic calligraphy.
 *
 * Drawn rather than imported as a bitmap — the mark stays razor-sharp at every
 * size, inherits the brand palette through `currentColor`, and cannot rot the
 * way the old PNG masters did.
 */
export function Wordmark({
  tone = "ink",
  locale = "en",
  className,
}: {
  tone?: keyof typeof tones;
  locale?: Locale;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-3", tones[tone], className)}>
      <LantanaMark className="h-9 w-9" />
      <div className="leading-none">
        <span className="block font-display text-d4 font-light tracking-luxe">LANTANA</span>
        <span
          className="mt-1.5 block text-lead opacity-70"
          style={{ fontFamily: "var(--font-display-ar), serif" }}
          lang="ar"
          dir="rtl"
        >
          لانتانا
        </span>
      </div>
    </div>
  );
}
