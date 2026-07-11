import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const styles = {
  primary: "bg-ink text-ivory hover:bg-olive-deep",
  olive: "bg-olive text-ivory hover:bg-olive-deep",
  outline: "border border-ink/30 text-ink hover:border-ink hover:bg-ink hover:text-ivory",
  ghost: "text-ink hover:text-olive-deep underline-offset-4 hover:underline",
};

const base =
  "inline-flex items-center justify-center gap-2 px-8 py-3.5 font-body text-[12px] uppercase tracking-luxe transition-all duration-500 ease-luxe disabled:opacity-40 disabled:pointer-events-none";

type Variant = keyof typeof styles;

export function Button({ variant = "primary", className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={cn(base, styles[variant], className)} {...props} />;
}

export function ButtonLink({ href, variant = "primary", className, children }: { href: string; variant?: Variant; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={cn(base, styles[variant], className)}>
      {children}
    </Link>
  );
}
