import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { getBlogPost, getBlogPosts } from "@/lib/db";
import { Reveal } from "@/components/motion/Reveal";
import { LantanaMark } from "@/components/brand/LantanaMark";
import { t } from "@/lib/utils";
import type { Locale } from "@/types";

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.flatMap((p) => [{ locale: "en", slug: p.slug }, { locale: "ar", slug: p.slug }]);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const post = await getBlogPost(slug);
  if (!post) return {};
  return { title: t(post.title, locale), description: t(post.excerpt, locale), openGraph: { images: [{ url: post.image }] } };
}

export default async function JournalPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const dict = await getDictionary(locale);
  const post = await getBlogPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 py-14 md:px-8">
      <Reveal className="text-center">
        <Link href={`/${locale}/journal`} className="link-reveal font-body text-[11px] uppercase tracking-wide2 text-ink/50">← {dict.journal.title}</Link>
        <p className="mt-6 font-body text-[11px] uppercase tracking-wide2 text-olive">
          {new Date(post.publishedAt).toLocaleDateString(locale === "ar" ? "ar-SY" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <h1 className="mt-3 h-display text-4xl leading-tight text-ink sm:text-5xl">{t(post.title, locale)}</h1>
      </Reveal>

      <Reveal delay={0.1} className="frame-zoom relative mt-10 aspect-[16/9] bg-ivory-soft">
        <Image src={post.image} alt={t(post.title, locale)} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
      </Reveal>

      <Reveal delay={0.15}>
        <div className="mx-auto mt-12 max-w-2xl">
          {t(post.body, locale).split("\n").filter(Boolean).map((para, i) => (
            <p key={i} className="mb-6 font-body text-[16px] leading-loose text-ink/75">{para}</p>
          ))}
        </div>
        <div className="mt-14 flex justify-center"><LantanaMark className="h-6 w-6 text-olive/50" /></div>
      </Reveal>
    </article>
  );
}
