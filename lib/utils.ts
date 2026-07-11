import type { Locale, LocalizedText } from "@/types";

export const t = (v: LocalizedText, locale: Locale) => v[locale] ?? v.en;

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function orderNumber(): string {
  const d = new Date();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LTN-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}-${rand}`;
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
