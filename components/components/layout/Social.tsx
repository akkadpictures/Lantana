import { cn } from "@/lib/utils";

export const SOCIAL = {
  instagram: { handle: "Lantana.perfume", url: "https://instagram.com/Lantana.perfume" },
  whatsapp: { number: "+963 984 179 484", url: "https://wa.me/963984179484" },
} as const;

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path
        d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3Z"
        strokeLinejoin="round"
      />
      <path
        d="M8.8 8.3c.2-.5.4-.5.6-.5h.5c.2 0 .4 0 .6.4l.7 1.7c.1.2 0 .4-.1.5l-.4.5c-.1.2-.2.3-.1.5.5 1 1.5 1.9 2.6 2.4.2.1.4.1.5-.1l.5-.6c.1-.2.3-.2.5-.1l1.6.8c.2.1.3.3.3.5 0 .8-.6 1.5-1.4 1.6-.4 0-.8 0-1.2-.1-2.5-.8-4.5-2.8-5.3-5.3-.2-.7-.1-1.4.1-2.2Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

/**
 * The maison's two direct lines. WhatsApp is not decoration here — in Damascus
 * it is how an order is actually placed, so it gets equal weight to Instagram
 * and opens straight into a chat.
 */
export function Social({
  size = "sm",
  labelled = false,
  className,
}: {
  size?: "sm" | "md";
  labelled?: boolean;
  className?: string;
}) {
  const icon = size === "md" ? "h-5 w-5" : "h-[17px] w-[17px]";
  return (
    <div className={cn("flex items-center gap-5", className)}>
      <a
        href={SOCIAL.instagram.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Instagram — ${SOCIAL.instagram.handle}`}
        className="inline-flex items-center gap-2 transition-opacity duration-300 hover:opacity-70"
      >
        <InstagramIcon className={icon} />
        {labelled && <span className="font-body text-sm2">{SOCIAL.instagram.handle}</span>}
      </a>
      <a
        href={SOCIAL.whatsapp.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`WhatsApp — ${SOCIAL.whatsapp.number}`}
        className="inline-flex items-center gap-2 transition-opacity duration-300 hover:opacity-70"
      >
        <WhatsAppIcon className={icon} />
        {labelled && <span dir="ltr" className="font-body text-sm2 tabular-nums">{SOCIAL.whatsapp.number}</span>}
      </a>
    </div>
  );
}
