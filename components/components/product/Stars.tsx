export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={className} role="img" aria-label={`${rating} / 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden="true" className={i < rating ? "text-olive" : "text-ink/20"}>✦</span>
      ))}
    </span>
  );
}
