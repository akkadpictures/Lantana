import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { Social } from "@/components/layout/Social";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import type { Locale } from "@/types";
import type { Dictionary } from "@/lib/i18n";

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t hairline bg-ivory-deep/50">
      <div className="shell py-20 md:py-24">
        <div className="grid gap-14 md:grid-cols-[1.3fr_1fr_1fr_1.5fr]">
          <div>
            <Wordmark tone="olive" locale={locale} />
            <p className="t-small mt-6 max-w-xs">{dict.footer.madeIn}</p>
          </div>

          <nav aria-label={dict.footer.maison}>
            <p className="eyebrow mb-5">{dict.footer.maison}</p>
            <ul className="space-y-3.5">
              <li><Link className="link-reveal t-body" href={`/${locale}/about`}>{dict.footer.about}</Link></li>
              <li><Link className="link-reveal t-body" href={`/${locale}/journal`}>{dict.footer.journal}</Link></li>
              <li><Link className="link-reveal t-body" href={`/${locale}/contact`}>{dict.footer.contact}</Link></li>
            </ul>
          </nav>

          <nav aria-label={dict.footer.care}>
            <p className="eyebrow mb-5">{dict.footer.care}</p>
            <ul className="space-y-3.5">
              <li><Link className="link-reveal t-body" href={`/${locale}/legal/shipping-returns`}>{dict.footer.shipping}</Link></li>
              <li><Link className="link-reveal t-body" href={`/${locale}/legal/privacy`}>{dict.footer.privacy}</Link></li>
              <li><Link className="link-reveal t-body" href={`/${locale}/legal/terms`}>{dict.footer.terms}</Link></li>
            </ul>
          </nav>

          <div>
            <p className="eyebrow mb-5">{dict.home.newsletter}</p>
            <p className="t-small mb-5">{dict.home.newsletterSub}</p>
            <NewsletterForm dict={dict} />

            <p className="eyebrow mb-4 mt-10">{dict.footer.follow}</p>
            <Social size="md" labelled className="flex-col !items-start gap-3 text-ink/75" />
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-6 border-t hairline pt-10 sm:flex-row sm:justify-between">
          <p className="font-body text-micro tracking-wide2 text-ink/45">
            © {year} LANTANA. {dict.footer.rights}
          </p>
          <Social className="text-ink/55" />
        </div>
      </div>
    </footer>
  );
}
