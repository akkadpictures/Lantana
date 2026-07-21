import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { getProducts } from "@/lib/db";
import { supa, hasDB } from "@/lib/supabase";
import { ImmersiveGallery, type Slide } from "@/components/gallery/ImmersiveGallery";
import { Reveal } from "@/components/motion/Reveal";
import { t } from "@/lib/utils";
import type { Locale } from "@/types";

export const revalidate = 60;

/** Curated gallery, edited from the admin. Falls back to product shots if empty. */
async function getGallerySlides(locale: Locale): Promise<Slide[]> {
  if (!hasDB) return [];
  try {
    const { data } = await supa()
      .from("gallery")
      .select("*")
      .eq("active", true)
      .order("sort", { ascending: true });
    return (data ?? [])
      .filter((g) => g.image)
      .map((g) => ({
        src: g.image as string,
        title: (locale === "ar" ? g.title_ar || g.title_en : g.title_en) as string,
        caption: ((locale === "ar" ? g.caption_ar || g.caption_en : g.caption_en) || undefined) as string | undefined,
        href: g.href ? `/${locale}/${g.href}` : undefined,
      }));
  } catch {
    return [];
  }
}

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

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const dict = await getDictionary(locale);

  // Curated gallery from the admin takes precedence; fall back to product shots.
  let slides: Slide[] = await getGallerySlides(locale);
  if (!slides.length) {
    const products = await getProducts();
    const order = ["moon", "yasmeen", "lunea", "misk", "asrar", "layal", "barq", "waqaar"];
    const ranked = [...products].sort(
      (a, b) => (order.indexOf(a.slug) + 100) % 108 - ((order.indexOf(b.slug) + 100) % 108)
    );
    slides = ranked.slice(0, 8).map((p) => ({
      src: p.image,
      title: t(p.name, locale),
      caption: t(p.tagline, locale),
      href: `/${locale}/product/${p.slug}`,
    }));
  }

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
