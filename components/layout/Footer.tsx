import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { LantanaMark } from "@/components/brand/LantanaMark";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import type { Locale } from "@/types";
import type { Dictionary } from "@/lib/i18n";

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t hairline bg-ivory-deep/60">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr_1.4fr]">
          <div>
            <Wordmark tone="olive" className="w-32" />
            <p className="mt-4 max-w-xs font-body text-sm leading-relaxed text-ink/60">{dict.footer.madeIn}</p>
          </div>
          <nav aria-label={dict.footer.maison}>
            <p className="eyebrow mb-4">{dict.footer.maison}</p>
            <ul className="space-y-2.5 font-body text-sm text-ink/70">
              <li><Link className="link-reveal" href={`/${locale}/about`}>{dict.footer.about}</Link></li>
              <li><Link className="link-reveal" href={`/${locale}/journal`}>{dict.footer.journal}</Link></li>
              <li><Link className="link-reveal" href={`/${locale}/contact`}>{dict.footer.contact}</Link></li>
            </ul>
          </nav>
          <nav aria-label={dict.footer.care}>
            <p className="eyebrow mb-4">{dict.footer.care}</p>
            <ul className="space-y-2.5 font-body text-sm text-ink/70">
              <li><Link className="link-reveal" href={`/${locale}/legal/shipping-returns`}>{dict.footer.shipping}</Link></li>
              <li><Link className="link-reveal" href={`/${locale}/legal/privacy`}>{dict.footer.privacy}</Link></li>
              <li><Link className="link-reveal" href={`/${locale}/legal/terms`}>{dict.footer.terms}</Link></li>
            </ul>
          </nav>
          <div>
            <p className="eyebrow mb-4">{dict.home.newsletter}</p>
            <p className="mb-4 font-body text-sm text-ink/60">{dict.home.newsletterSub}</p>
            <NewsletterForm dict={dict} />
          </div>
        </div>
        <div className="mt-14 flex flex-col items-center gap-4 border-t hairline pt-8 sm:flex-row sm:justify-between">
          <p className="font-body text-xs text-ink/50">© {year} LANTANA. {dict.footer.rights}</p>
          <LantanaMark className="h-5 w-5 text-olive/60" />
          <a href="https://instagram.com/lantana" target="_blank" rel="noopener noreferrer" className="link-reveal font-body text-xs uppercase tracking-wide2 text-ink/50">
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
