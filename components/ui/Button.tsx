import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const styles = {
  primary: "bg-ink text-ivory hover:bg-olive-deep",
  olive: "bg-olive text-ivory hover:bg-olive-deep",
  outline: "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-ivory",
  ghost: "text-ink hover:text-olive-deep underline-offset-4 hover:underline",
} as const;

const sizes = {
  /* Generous by default — a luxury button should feel like an object, not a link. */
  md: "px-10 py-4 text-label",
  lg: "px-12 py-5 text-nav",
  sm: "px-7 py-3 text-micro",
} as const;

const base =
  "inline-flex items-center justify-center gap-2.5 font-body uppercase tracking-luxe " +
  "transition-all duration-500 ease-luxe disabled:opacity-40 disabled:pointer-events-none";

type Variant = keyof typeof styles;
type Size = keyof typeof sizes;

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={cn(base, styles[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, styles[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}
