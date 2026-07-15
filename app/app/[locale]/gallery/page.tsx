import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { getProducts } from "@/lib/db";
import { ImmersiveGallery, type Slide } from "@/components/gallery/ImmersiveGallery";
import { Reveal } from "@/components/motion/Reveal";
import { t } from "@/lib/utils";
import type { Locale } from "@/types";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : "en";
  return {
    title: l === "ar" ? "المعرض" : "Gallery",
    description:
      l === "ar"
        ? "لوحة عطرية — تنقّل داخل دار لانتانا عبر مشاهد من العطر والضوء والمادة."
        : "An olfactive portrait — move through the house of Lantana in scent, light and material.",
  };
}

/** Mood backdrop tuned to each scent; falls back to a warm olive stage. */
const MOODS: Record<string, [string, string]> = {
  moon: ["#4a3d63", "#191225"],
  yasmeen: ["#6d7a52", "#232a17"],
  lunea: ["#7c4a55", "#2a151b"],
  "lunea-100": ["#8a5560", "#2a151b"],
  misk: ["#8f8a7d", "#2b2a24"],
  asrar: ["#6a5236", "#241a10"],
  layal: ["#3f4a63", "#161b25"],
  barq: ["#6d5a3a", "#241d10"],
  waqaar: ["#55603f", "#1c2013"],
  coffret: ["#7a6f5c", "#26221a"],
};
const DEFAULT_MOOD: [string, string] = ["#5c6242", "#20241a"];

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const dict = await getDictionary(locale);
  const products = await getProducts();

  const order = ["moon", "yasmeen", "lunea", "asrar", "layal", "misk", "barq", "waqaar"];
  const ranked = [...products].sort(
    (a, b) => (order.indexOf(a.slug) + 100) % 108 - ((order.indexOf(b.slug) + 100) % 108)
  );

  const slides: Slide[] = ranked.slice(0, 8).map((p) => ({
    src: p.image,
    title: t(p.name, locale),
    caption: t(p.tagline, locale),
    href: `/${locale}/product/${p.slug}`,
    mood: MOODS[p.slug] ?? DEFAULT_MOOD,
  }));

  return (
    <div className="pb-24">
      <Reveal className="shell pt-16 py-14 text-center md:py-20">
        <p className="eyebrow mb-4">{dict.gallery.eyebrow}</p>
        <h1 className="t-display mx-auto max-w-4xl text-ink">{dict.gallery.title}</h1>
        <p className="mx-auto mt-6 max-w-2xl font-body text-lead text-ink/70">{dict.gallery.sub}</p>
      </Reveal>

      <ImmersiveGallery
        slides={slides}
        locale={locale}
        labels={{ swipe: dict.gallery.swipe, cta: dict.gallery.cta }}
      />
    </div>
  );
}
