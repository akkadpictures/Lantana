import type { Locale } from "@/types";
export const locales: Locale[] = ["en", "ar"];
export const defaultLocale: Locale = "en";
export const isLocale = (v: string): v is Locale => (locales as string[]).includes(v);
export const dir = (l: Locale) => (l === "ar" ? "rtl" : "ltr");
