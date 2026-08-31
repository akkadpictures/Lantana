import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { LantanaMark } from "@/components/brand/LantanaMark";
import { ButtonLink } from "@/components/ui/Button";
import { BANK_TRANSFER_DETAILS } from "@/lib/catalog";
import { ClearCart } from "@/components/checkout/ClearCart";
import { WhatsAppConfirm } from "@/components/checkout/WhatsAppConfirm";
import type { Locale } from "@/types";

export const metadata: Metadata = { robots: { index: false } };

/* Rails where nothing has been paid yet: the order exists, but it is not ours to
   pack until a human has confirmed it. The copy must not claim otherwise. */
const UNPAID = new Set(["whatsapp", "cod", "bank_transfer"]);

export default async function SuccessPage({
  params, searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string; method?: string }>;
}) {
  const [{ locale: raw }, sp] = await Promise.all([params, searchParams]);
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const dict = await getDictionary(locale);
  const awaiting = Boolean(sp.order) && UNPAID.has(sp.method ?? "");

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-5 py-28 text-center">
      <ClearCart />
      <LantanaMark animated className="h-16 w-16 text-olive" />
      <h1 className="h-display text-d2 text-ink">
        {awaiting ? dict.checkout.awaitingTitle : dict.checkout.successTitle}
      </h1>
      <p className="font-body text-base2 leading-relaxed text-ink/60">
        {awaiting ? dict.checkout.awaitingBody : dict.checkout.successBody}
      </p>
      {sp.order && (
        <p className="border hairline bg-ivory-soft px-6 py-3 font-body text-base2 tracking-wide2">
          {dict.checkout.orderNumber}: <span className="text-olive-deep" dir="ltr">{sp.order}</span>
        </p>
      )}
      {awaiting && (
        <WhatsAppConfirm
          orderNumber={sp.order!}
          locale={locale}
          cta={dict.checkout.whatsappCta}
          note={dict.checkout.whatsappNote}
        />
      )}
      {sp.method === "bank_transfer" && (
        <p className="max-w-md font-body text-sm2 leading-relaxed text-ink/55">{BANK_TRANSFER_DETAILS[locale]}</p>
      )}
      <ButtonLink href={`/${locale}/shop`} variant="outline" className="mt-4">{dict.checkout.continue}</ButtonLink>
    </div>
  );
}
