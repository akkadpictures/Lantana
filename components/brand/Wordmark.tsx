import Image from "next/image";
import { cn } from "@/lib/utils";

/** Official LANTANA lockup (wordmark + Arabic calligraphy), transparent masters. */
export function Wordmark({ tone = "ink", className, priority = false }: { tone?: "ink" | "ivory" | "olive"; className?: string; priority?: boolean }) {
  return (
    <Image
      src={`/images/brand/logo-${tone}.png`}
      alt="LANTANA لانتانا"
      width={332}
      height={334}
      priority={priority}
      className={cn("h-auto w-auto", className)}
    />
  );
}
