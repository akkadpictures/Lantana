import { cn } from "@/lib/utils";

/**
 * The lantana floret — the maison's symbol.
 * A dome of small four-petal blossoms, drawn as a single line system.
 * Used as the preloader, favicon, section punctuation and button ornament.
 */
export function LantanaMark({ className, animated = false }: { className?: string; animated?: boolean }) {
  const florets: [number, number, number][] = [
    [50, 26, 9], [30, 40, 9], [70, 40, 9], [40, 60, 9], [60, 60, 9], [50, 78, 8],
  ];
  return (
    <svg viewBox="0 0 100 100" className={cn("block", className)} aria-hidden="true" role="img">
      {florets.map(([cx, cy, r], i) => (
        <g
          key={i}
          className={animated ? "animate-bloom opacity-0" : undefined}
          style={animated ? { animationDelay: `${i * 130}ms`, transformOrigin: `${cx}px ${cy}px` } : undefined}
        >
          {[0, 90, 180, 270].map((deg) => (
            <ellipse
              key={deg}
              cx={cx} cy={cy - r * 0.62} rx={r * 0.36} ry={r * 0.62}
              transform={`rotate(${deg} ${cx} ${cy})`}
              fill="none" stroke="currentColor" strokeWidth="1.6"
            />
          ))}
          <circle cx={cx} cy={cy} r={r * 0.18} fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}
