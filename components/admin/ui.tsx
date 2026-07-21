"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/* Premium surface — soft card with hairline border and gentle lift. */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-ink/8 bg-ivory p-6 shadow-[0_1px_2px_rgba(35,38,28,0.04),0_12px_30px_-24px_rgba(35,38,28,0.25)]", className)}>
      {children}
    </div>
  );
}

/* KPI tile — quiet label, confident figure, optional context line. */
export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-ink/8 bg-ivory p-6 shadow-[0_1px_2px_rgba(35,38,28,0.04),0_12px_30px_-24px_rgba(35,38,28,0.25)] transition-shadow duration-300 hover:shadow-[0_2px_4px_rgba(35,38,28,0.05),0_20px_40px_-24px_rgba(35,38,28,0.35)]">
      <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-olive to-olive/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <p className="font-body text-[10px] font-medium uppercase tracking-[0.2em] text-ink/45">{label}</p>
      <p className="mt-3 font-display text-[2.4rem] font-light leading-none text-ink">{value}</p>
      {sub && <p className="mt-2 font-body text-[0.8rem] text-ink/50">{sub}</p>}
    </div>
  );
}

/* Data table — rounded frame, muted header, quiet row hover. */
export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/8 bg-ivory shadow-[0_1px_2px_rgba(35,38,28,0.04),0_12px_30px_-24px_rgba(35,38,28,0.25)]">
      <table className="w-full border-collapse text-start font-body text-[0.9rem] [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-olive/[0.04] [&_tbody_tr:last-child]:border-0">
        <thead>
          <tr className="border-b border-ink/8 bg-[#f6f4ee]">
            {head.map((h) => (
              <th key={h} className="whitespace-nowrap px-5 py-3.5 text-start font-medium uppercase tracking-[0.14em] text-[11px] text-ink/50">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/* Status pill — soft tonal chip with a leading dot. */
export function Badge({ children, tone = "olive" }: { children: ReactNode; tone?: "olive" | "amber" | "green" | "red" | "grey" }) {
  const tones = {
    olive: "bg-olive/12 text-olive-deep ring-olive/20",
    amber: "bg-amber-100/70 text-amber-800 ring-amber-300/40",
    green: "bg-emerald-100/70 text-emerald-800 ring-emerald-300/40",
    red: "bg-red-100/70 text-red-800 ring-red-300/40",
    grey: "bg-ink/8 text-ink/55 ring-ink/10",
  };
  const dot = {
    olive: "bg-olive", amber: "bg-amber-500", green: "bg-emerald-500", red: "bg-red-500", grey: "bg-ink/40",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.1em] ring-1 ring-inset", tones[tone])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dot[tone])} />
      {children}
    </span>
  );
}
