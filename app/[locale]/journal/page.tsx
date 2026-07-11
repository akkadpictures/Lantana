import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { getBlogPosts } from "@/lib/db";
import { Reveal } from "@/components/motion/Reveal";
import { t } from "@/lib/utils";
import type { Locale } from "@/types";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "المدوّنة" : "Journal" };
}

export default async function JournalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const dict = await getDictionary(locale);
  const posts = await getBlogPosts();

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 md:px-8">
      <Reveal className="mb-14 text-center">
        <h1 className="h-display text-4xl text-ink sm:text-5xl">{dict.journal.title}</h1>
      </Reveal>
      <div className="grid gap-12 sm:grid-cols-2">
        {posts.map((post, i) => (
          <Reveal key={post.id} delay={i * 0.08}>
            <Link href={`/${locale}/journal/${post.slug}`} className="group block">
              <div className="frame-zoom relative aspect-[4/3] bg-ivory-soft">
                <Image src={post.image} alt={t(post.title, locale)} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
              </div>
              <p className="mt-5 font-body text-[11px] uppercase tracking-wide2 text-olive">
                {new Date(post.publishedAt).toLocaleDateString(locale === "ar" ? "ar-SY" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <h2 className="mt-2 font-display text-2xl font-light text-ink group-hover:text-olive-deep">{t(post.title, locale)}</h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-ink/55">{t(post.excerpt, locale)}</p>
              <span className="mt-3 inline-block font-body text-[11px] uppercase tracking-wide2 text-ink/70 group-hover:text-ink">{dict.journal.read} →</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
