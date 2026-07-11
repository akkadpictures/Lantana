import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { Reveal } from "@/components/motion/Reveal";
import type { Locale } from "@/types";

const PAGES = ["privacy", "terms", "shipping-returns"] as const;
type LegalSlug = (typeof PAGES)[number];

export function generateStaticParams() {
  return PAGES.flatMap((page) => [{ locale: "en", page }, { locale: "ar", page }]);
}

function content(slug: LegalSlug, locale: Locale) {
  const ar = locale === "ar";
  const map: Record<LegalSlug, { title: string; body: string[] }> = {
    privacy: {
      title: ar ? "سياسة الخصوصية" : "Privacy policy",
      body: ar
        ? [
            "نحترم خصوصيتك. نجمع فقط المعلومات اللازمة لإتمام طلبك وتحسين تجربتك: الاسم، البريد الإلكتروني، الهاتف، وعنوان الشحن.",
            "لا نبيع بياناتك ولا نشاركها مع أطراف ثالثة إلا لأغراض تنفيذ الطلب (الشحن والدفع).",
            "تُعالَج المدفوعات عبر مزوّدين آمنين معتمدين. لا نخزّن بيانات بطاقتك على خوادمنا.",
            "يمكنك طلب تعديل بياناتك أو حذفها في أي وقت عبر hello@lantana.com.",
          ]
        : [
            "We respect your privacy. We collect only what we need to fulfil your order and improve your experience: name, email, phone and shipping address.",
            "We never sell your data, and we share it only where required to fulfil an order (shipping and payment).",
            "Payments are processed by certified, secure providers. We do not store card details on our servers.",
            "You may request correction or deletion of your data at any time via hello@lantana.com.",
          ],
    },
    terms: {
      title: ar ? "شروط الاستخدام" : "Terms of service",
      body: ar
        ? [
            "باستخدامك لهذا الموقع، فإنك توافق على هذه الشروط. جميع الأسعار قابلة للتغيير دون إشعار مسبق.",
            "تبقى جميع حقوق العلامة التجارية والمحتوى والصور ملكاً لدار لانتانا.",
            "نبذل قصارى جهدنا لعرض ألوان وتفاصيل المنتجات بدقة، لكن قد تختلف قليلاً حسب شاشتك.",
            "يخضع أي نزاع للقوانين المعمول بها في مقرّ الدار.",
          ]
        : [
            "By using this site you agree to these terms. All prices are subject to change without prior notice.",
            "All trademarks, content and imagery remain the property of the LANTANA maison.",
            "We take care to display product colours and details accurately, though they may vary slightly by screen.",
            "Any dispute is governed by the applicable law at the maison's place of business.",
          ],
    },
    "shipping-returns": {
      title: ar ? "الشحن والإرجاع" : "Shipping & returns",
      body: ar
        ? [
            "يُشحن كل طلب خلال ٤٨ ساعة من دمشق ودبي، مع تغليف هدايا مجاني.",
            "سوريا: ١–٣ أيام عمل · الخليج: ٢–٥ أيام · دولي: ٥–١٠ أيام.",
            "يُقبل الإرجاع خلال ١٤ يوماً على المنتجات غير المفتوحة وبحالتها الأصلية.",
            "لبدء عملية إرجاع، تواصل مع hello@lantana.com مع رقم طلبك.",
          ]
        : [
            "Every order ships within 48 hours from Damascus and Dubai, with complimentary gift wrapping.",
            "Syria: 1–3 business days · GCC: 2–5 days · International: 5–10 days.",
            "Returns are accepted within 14 days on unopened items in their original condition.",
            "To start a return, contact hello@lantana.com with your order number.",
          ],
    },
  };
  return map[slug];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; page: string }> }): Promise<Metadata> {
  const { locale: raw, page } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  if (!PAGES.includes(page as LegalSlug)) return {};
  return { title: content(page as LegalSlug, locale).title };
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string; page: string }> }) {
  const { locale: raw, page } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  await getDictionary(locale);
  if (!PAGES.includes(page as LegalSlug)) notFound();
  const c = content(page as LegalSlug, locale);

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 md:px-8 lg:py-24">
      <Reveal>
        <h1 className="h-display mb-10 text-4xl text-ink">{c.title}</h1>
        <div className="space-y-6">
          {c.body.map((p, i) => (
            <p key={i} className="font-body text-[15px] leading-loose text-ink/70">{p}</p>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
