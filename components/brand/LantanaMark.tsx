import { cn } from "@/lib/utils";

/**
 * The Lantana emblem — the maison's real symbol: a stylised lantana floret whose
 * central petal doubles as an "l", finished with a calligraphic base flourish.
 *
 * Rendered as a CSS mask over `currentColor`, so the single master artwork tints
 * to olive, ink, ivory or silver purely from the surrounding text colour — the
 * same emblem stays razor-sharp from a 16px favicon to a full-bleed hero.
 *
 * The emblem's natural proportion is ~1.37:1 (wider than tall); callers set a
 * width via className and the height follows through aspect-ratio.
 */
export function LantanaMark({ className, animated = false }: { className?: string; animated?: boolean }) {
  return (
    <span
      role="img"
      aria-label="LANTANA"
      className={cn("inline-block bg-current align-middle", animated && "animate-bloom", className)}
      style={{
        aspectRatio: "1 / 1",
        WebkitMaskImage: "url(/images/brand/emblem-mask-v3.png)",
        maskImage: "url(/images/brand/emblem-mask-v3.png)",
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
