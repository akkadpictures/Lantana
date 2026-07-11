import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { getProducts, getBlogPosts } from "@/lib/db";
import { COUNTRY_CURRENCY, toCountryCode } from "@/lib/currency";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { LantanaMark } from "@/components/brand/LantanaMark";
import { t } from "@/lib/utils";
import type { Locale } from "@/types";

export const revalidate = 300;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const dict = await getDictionary(locale);
  const cookieStore = await cookies();
  const currency = COUNTRY_CURRENCY[toCountryCode(cookieStore.get("lantana_country")?.value)];

  const [products, posts] = await Promise.all([getProducts(), getBlogPosts()]);
  const hero = products.find((p) => p.hero) ?? products[0];
  const featured = products.filter((p) => p.featured && p.id !== hero?.id).slice(0, 4);
  const coffret = products.find((p) => p.slug === "discovery-coffret");

  return (
    <>
      {/* ── Hero: the Damascus flower ─────────────────────────── */}
      <section className="relative overflow-hidden bg-ivory">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:px-8 lg:py-24">
          <Reveal>
            <p className="eyebrow mb-5">{dict.hero.eyebrow}</p>
            <h1 className="h-display text-5xl leading-[1.05] text-ink sm:text-6xl lg:text-7xl">
              {dict.hero.title}
            </h1>
            <p className="mt-6 max-w-md font-body text-base leading-relaxed text-ink/60">{dict.hero.sub}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <ButtonLink href={`/${locale}/shop`}>{dict.hero.cta}</ButtonLink>
              <ButtonLink href={`/${locale}/about`} variant="outline">{dict.hero.cta2}</ButtonLink>
            </div>
          </Reveal>
          {hero && (
            <Reveal delay={0.15} className="relative">
              <Link href={`/${locale}/product/${hero.slug}`} className="frame-zoom relative block aspect-[4/5] bg-ivory-soft">
                <Image
                  src={hero.image}
                  alt={t(hero.name, locale)}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </Link>
              <p className="mt-4 text-center font-body text-xs uppercase tracking-luxe text-ink/50">
                {t(hero.name, locale)} — {dict.home.hero_product}
              </p>
            </Reveal>
          )}
        </div>
        <LantanaMark className="pointer-events-none absolute -bottom-16 -end-16 h-64 w-64 text-olive/[0.07]" />
      </section>

      {/* ── Featured collection ───────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <Reveal className="mb-12 text-center">
          <h2 className="h-display text-4xl text-ink">{dict.home.featured}</h2>
          <p className="mt-2 font-body text-sm text-ink/50">{dict.home.featuredSub}</p>
        </Reveal>
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <ProductCard product={p} locale={locale} currency={currency} />
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12 text-center">
          <ButtonLink href={`/${locale}/shop`} variant="outline">{dict.misc.viewAll}</ButtonLink>
        </Reveal>
      </section>

      {/* ── The ritual (dark olive interlude) ──────────────────── */}
      <section className="bg-ink text-ivory">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 md:grid-cols-2 md:px-8">
          <Reveal>
            <LantanaMark className="mb-6 h-8 w-8 text-olive-mist" />
            <h2 className="h-display text-4xl text-ivory">{dict.home.ritual}</h2>
            <p className="mt-6 max-w-md font-body text-base leading-loose text-ivory/70">{dict.home.ritualBody}</p>
          </Reveal>
          {coffret && (
            <Reveal delay={0.15}>
              <Link href={`/${locale}/product/${coffret.slug}`} className="frame-zoom relative block aspect-[16/10]">
                <Image src={coffret.image} alt={t(coffret.name, locale)} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              </Link>
              <p className="mt-4 font-body text-xs uppercase tracking-luxe text-ivory/50">{t(coffret.name, locale)}</p>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── Journal ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <Reveal className="mb-10 text-center">
          <h2 className="h-display text-3xl text-ink">{dict.home.journal}</h2>
        </Reveal>
        <div className="grid gap-10 md:grid-cols-2">
          {posts.slice(0, 2).map((post, i) => (
            <Reveal key={post.id} delay={i * 0.1}>
              <Link href={`/${locale}/journal/${post.slug}`} className="group block">
                <div className="frame-zoom relative aspect-[16/9] bg-ivory-soft">
                  <Image src={post.image} alt={t(post.title, locale)} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-light text-ink group-hover:text-olive-deep">{t(post.title, locale)}</h3>
                <p className="mt-2 font-body text-sm text-ink/55">{t(post.excerpt, locale)}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
