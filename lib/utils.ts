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

/* ------------------------------------------------------------------ *
 * Arabic typography helpers
 * The maison writes numerals in Arabic-Indic digits inside Arabic copy,
 * and Arabic counted nouns follow real agreement rules — not "10 نتيجة".
 * ------------------------------------------------------------------ */

const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/** 100 → ١٠٠ (Arabic-Indic digits). Leaves non-digits untouched. */
export function arDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => AR_DIGITS[Number(d)]);
}

/** "50 ml" → "٥٠ مل" in Arabic, unchanged in English. Handles "4 × 30 ml". */
export function formatSize(size: string, locale: Locale): string {
  if (locale !== "ar") return size;
  return arDigits(size).replace(/\bml\b/gi, "مل");
}

/**
 * Arabic counted-noun agreement.
 * 1 → مفرد · 2 → مثنى · 3–10 → جمع · 11+ → مفرد منصوب
 * English simply pluralises past one.
 */
export function countLabel(
  n: number,
  locale: Locale,
  forms: { one: string; two: string; few: string; many: string }
): string {
  if (locale !== "ar") return `${n} ${n === 1 ? forms.one : forms.many}`;
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;
  if (n >= 3 && n <= 10) return `${arDigits(n)} ${forms.few}`;
  return `${arDigits(n)} ${forms.many}`;
}

/** "٥–١٠ أيام عمل" / "5–10 business days" — respects the 3–10 plural rule. */
export function daysRange(
  min: number,
  max: number,
  locale: Locale,
  forms: { one: string; two: string; few: string; many: string }
): string {
  if (locale !== "ar") return `${min}–${max} ${forms.many}`;
  const noun = max >= 3 && max <= 10 ? forms.few : forms.many;
  return `${arDigits(min)}–${arDigits(max)} ${noun}`;
}
