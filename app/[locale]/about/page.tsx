import Image from "next/image";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { Reveal } from "@/components/motion/Reveal";
import { LantanaMark } from "@/components/brand/LantanaMark";
import { ButtonLink } from "@/components/ui/Button";
import type { Locale } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "الدار" : "The Maison" };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const dict = await getDictionary(locale);
  const ar = locale === "ar";

  return (
    <div>
      <section className="relative flex min-h-[62vh] items-center justify-center overflow-hidden bg-ink text-ivory">
        <Image src="/images/products/yasmeen.jpg" alt="" fill sizes="100vw" className="object-cover opacity-25" priority />
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <Reveal>
            <LantanaMark className="mx-auto mb-8 h-10 w-10 text-olive-mist" />
            <h1 className="h-display text-4xl leading-tight text-ivory sm:text-5xl lg:text-6xl">{dict.about.title}</h1>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-10 px-5 py-20 md:px-8 lg:py-24">
        {[dict.about.body1, dict.about.body2, dict.about.body3].map((p, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <p className="font-display text-2xl font-light leading-relaxed text-ink sm:text-[27px]">{p}</p>
          </Reveal>
        ))}
      </section>

      <section className="border-y hairline bg-ivory-deep/50">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 text-center md:grid-cols-3 md:px-8 lg:py-20">
          {[
            { t: ar ? "خلاصات نادرة" : "Rare essences", d: ar ? "زيوت فرنسية وسويسرية، تُنقَع لأسابيع." : "French & Swiss oils, macerated for weeks." },
            { t: ar ? "صناعة يدوية" : "Hand-finished", d: ar ? "تُجمَّع وتُختَم يدوياً في دبي." : "Assembled and sealed by hand in Dubai." },
            { t: ar ? "روح دمشق" : "The soul of Damascus", d: ar ? "ورد وياسمين وعود من قلب الشام." : "Rose, jasmine and oud from the heart of Sham." },
          ].map((v, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <LantanaMark className="mx-auto mb-4 h-6 w-6 text-olive" />
              <h3 className="font-display text-xl font-light text-ink">{v.t}</h3>
              <p className="mt-2 font-body text-sm text-ink/55">{v.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-20 text-center md:px-8 lg:py-24">
        <Reveal><ButtonLink href={`/${locale}/shop`}>{dict.hero.cta}</ButtonLink></Reveal>
      </section>
    </div>
  );
}
