"use client";

import { useEffect, useState } from "react";
import { whatsappFallbackLink } from "@/lib/whatsapp";
import type { Locale } from "@/types";

/**
 * The confirmation step for unpaid orders.
 *
 * The rich, itemised message is written to sessionStorage by the checkout, so no
 * customer detail ever travels in a URL. If the page is reopened in a new tab the
 * message is gone — we fall back to a short one carrying the order number, which
 * is all we actually need to find the record.
 *
 * The link is never opened automatically: browsers block unprompted navigation to
 * an app scheme, and losing this page would cost the customer their order number.
 */
export function WhatsAppConfirm({
  orderNumber,
  locale,
  cta,
  note,
}: {
  orderNumber: string;
  locale: Locale;
  cta: string;
  note: string;
}) {
  const [href, setHref] = useState(() => whatsappFallbackLink(orderNumber, locale));

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`lantana_wa_${orderNumber}`);
      if (stored) setHref(stored);
    } catch {
      /* private mode — the fallback link stands */
    }
  }, [orderNumber, locale]);

  return (
    <div className="mt-2 flex w-full flex-col items-center gap-3">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full max-w-sm items-center justify-center gap-3 bg-[#25D366] px-10 py-5 font-body text-nav uppercase tracking-luxe text-white transition-all duration-500 ease-luxe hover:brightness-95"
      >
        <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-current">
          <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.25-4.35c0-4.53 3.69-8.22 8.23-8.22 2.2 0 4.26.86 5.82 2.41a8.16 8.16 0 0 1 2.4 5.82c0 4.54-3.69 8.2-8.23 8.2z" />
        </svg>
        {cta}
      </a>
      <p className="max-w-sm font-body text-sm2 leading-relaxed text-ink/55">{note}</p>
    </div>
  );
}
