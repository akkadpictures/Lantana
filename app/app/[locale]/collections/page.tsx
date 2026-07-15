import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { getCollections } from "@/lib/db";
import { Reveal } from "@/components/motion/Reveal";
import { t } from "@/lib/utils";
import type { Locale } from "@/types";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "المجموعات" : "Collections" };
}

export default async function CollectionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const dict = await getDictionary(locale);
  const collections = await getCollections();

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
      <Reveal className="mb-14 text-center">
        <h1 className="h-display text-d2 text-ink sm:text-d2">{dict.nav.collections}</h1>
      </Reveal>
      <div className="space-y-16">
        {collections.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.08}>
            <Link href={`/${locale}/collections/${c.slug}`} className="group grid items-center gap-8 md:grid-cols-2">
              <div className={`frame-zoom relative aspect-[16/10] bg-ivory-soft ${i % 2 === 1 ? "md:order-2" : ""}`}>
                <Image src={c.image} alt={t(c.name, locale)} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              </div>
              <div className={i % 2 === 1 ? "md:order-1 md:text-end" : ""}>
                <h2 className="h-display text-d3 text-ink group-hover:text-olive-deep sm:text-d2">{t(c.name, locale)}</h2>
                <p className="mt-4 max-w-md font-body text-base2 leading-relaxed text-ink/60 md:inline-block">{t(c.description, locale)}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
