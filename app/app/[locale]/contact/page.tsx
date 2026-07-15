import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { ContactForm } from "@/components/contact/ContactForm";
import { Reveal } from "@/components/motion/Reveal";
import { LantanaMark } from "@/components/brand/LantanaMark";
import type { Locale } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "تواصل معنا" : "Contact" };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const dict = await getDictionary(locale);
  const ar = locale === "ar";

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 md:px-8">
      <Reveal className="mb-14 text-center">
        <LantanaMark className="mx-auto mb-6 h-8 w-8 text-olive" />
        <h1 className="h-display text-d2 text-ink sm:text-d2">{dict.contactPage.title}</h1>
        <p className="mt-3 font-body text-base2 text-ink/55">{dict.contactPage.body}</p>
      </Reveal>

      <div className="grid gap-14 md:grid-cols-2">
        <Reveal>
          <ContactForm dict={dict} />
        </Reveal>
        <Reveal delay={0.1} className="space-y-8">
          <div>
            <p className="eyebrow mb-2">{ar ? "الدار" : "Maison"}</p>
            <p className="font-body text-base2 leading-relaxed text-ink/70">{ar ? "دمشق، سوريا" : "Damascus, Syria"}<br />{ar ? "الإنتاج: دبي، الإمارات" : "Production: Dubai, UAE"}</p>
          </div>
          <div>
            <p className="eyebrow mb-2">{ar ? "البريد" : "Email"}</p>
            <a href="mailto:hello@lantana.com" dir="ltr" className="link-reveal font-body text-base2 text-ink/70">hello@lantana.com</a>
          </div>
          <div>
            <p className="eyebrow mb-2">{ar ? "واتساب" : "WhatsApp"}</p>
            <a href="https://wa.me/9710000000" dir="ltr" target="_blank" rel="noopener noreferrer" className="link-reveal font-body text-base2 text-ink/70">+971 00 000 0000</a>
          </div>
          <div>
            <p className="eyebrow mb-2">Instagram</p>
            <a href="https://instagram.com/lantana" target="_blank" rel="noopener noreferrer" className="link-reveal font-body text-base2 text-ink/70">@lantana</a>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
