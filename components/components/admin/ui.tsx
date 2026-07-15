"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("border hairline bg-ivory-soft/60 p-5", className)}>{children}</div>;
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <p className="font-body text-micro uppercase tracking-wide2 text-ink/50">{label}</p>
      <p className="mt-2 font-display text-d3 font-light text-ink">{value}</p>
      {sub && <p className="mt-1 font-body text-sm2 text-ink/50">{sub}</p>}
    </Card>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto border hairline">
      <table className="w-full border-collapse text-start font-body text-base2">
        <thead>
          <tr className="border-b hairline bg-ink/[0.03]">
            {head.map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 text-start font-medium uppercase tracking-wide2 text-micro text-ink/60">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Badge({ children, tone = "olive" }: { children: ReactNode; tone?: "olive" | "amber" | "green" | "red" | "grey" }) {
  const tones = {
    olive: "bg-olive/15 text-olive-deep",
    amber: "bg-amber-100 text-amber-800",
    green: "bg-emerald-100 text-emerald-800",
    red: "bg-red-100 text-red-800",
    grey: "bg-ink/10 text-ink/60",
  };
  return <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-micro uppercase tracking-wide2", tones[tone])}>{children}</span>;
}
