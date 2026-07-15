import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

const tones = {
  ink: "text-ink",
  ivory: "text-ivory",
  olive: "text-olive",
} as const;

/**
 * The full official lockup — floret, LANTANA wordmark, Arabic calligraphy —
 * rendered as a CSS mask over `currentColor` from the corrected master artwork,
 * so it tints to ink, ivory or olive and stays razor-sharp at any size.
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
    <span
      role="img"
      aria-label="LANTANA — لانتانا"
      className={cn("inline-block h-28 bg-current align-middle", tones[tone], className)}
      style={{
        aspectRatio: "1000 / 702",
        WebkitMaskImage: "url(/images/brand/logo-mask-v2.png)",
        maskImage: "url(/images/brand/logo-mask-v2.png)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}
