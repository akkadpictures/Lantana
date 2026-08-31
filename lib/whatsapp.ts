/**
 * WhatsApp order confirmation.
 *
 * A Syrian order is never "placed" in the payment sense — it is placed in the
 * database and then confirmed by a human on WhatsApp. This module builds the
 * pre-filled message the customer sends us, in their own language.
 *
 * Note: wa.me can pre-fill a message but cannot send it. The order is therefore
 * written to the database *before* the link is handed out, so an order still
 * exists even if the customer never presses send.
 */
import { formatPrice } from "./currency";
import type { Locale, Order } from "@/types";

/** Fallback maison number. Override per-environment with NEXT_PUBLIC_WHATSAPP_NUMBER. */
const DEFAULT_NUMBER = "963984179484";

export function whatsappNumber(): string {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_NUMBER;
  return raw.replace(/\D/g, "");
}

/** The message body the customer will send us. Plain text — WhatsApp has no markup. */
export function whatsappOrderMessage(order: Order, locale: Locale): string {
  const money = (v: number) => formatPrice(v, order.currency, locale);
  const c = order.customer;
  const L: string[] = [];

  if (locale === "ar") {
    L.push("مرحباً لانتانا 🌿");
    L.push(`أودّ تأكيد طلبي رقم: ${order.number}`);
    L.push("");
    L.push("— الطلب —");
    for (const i of order.items) L.push(`• ${i.name} × ${i.qty} — ${money(i.unitPrice * i.qty)}`);
    if (order.discount > 0) L.push(`الخصم: −${money(order.discount)}`);
    L.push(`الشحن: ${order.shipping > 0 ? money(order.shipping) : "مجاني"}`);
    L.push(`الإجمالي: ${money(order.total)}`);
    L.push("");
    L.push("— بيانات التوصيل —");
    L.push(`الاسم: ${c.name}`);
    L.push(`الهاتف: ${c.phone}`);
    L.push(`العنوان: ${c.address}، ${c.city}`);
    if (c.notes) L.push(`ملاحظات: ${c.notes}`);
    L.push("");
    L.push("📍 سأرسل موقعي (Location) في الرسالة التالية.");
  } else {
    L.push("Hello LANTANA 🌿");
    L.push(`I would like to confirm my order: ${order.number}`);
    L.push("");
    L.push("— Order —");
    for (const i of order.items) L.push(`• ${i.name} × ${i.qty} — ${money(i.unitPrice * i.qty)}`);
    if (order.discount > 0) L.push(`Discount: −${money(order.discount)}`);
    L.push(`Shipping: ${order.shipping > 0 ? money(order.shipping) : "Complimentary"}`);
    L.push(`Total: ${money(order.total)}`);
    L.push("");
    L.push("— Delivery —");
    L.push(`Name: ${c.name}`);
    L.push(`Phone: ${c.phone}`);
    L.push(`Address: ${c.address}, ${c.city}`);
    if (c.notes) L.push(`Notes: ${c.notes}`);
    L.push("");
    L.push("📍 I will send my location pin in the next message.");
  }

  return L.join("\n");
}

/** Full wa.me deep link, ready for an anchor href. */
export function whatsappOrderLink(order: Order, locale: Locale): string {
  return `https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(whatsappOrderMessage(order, locale))}`;
}

/**
 * Minimal link used when the rich message is unavailable — e.g. the customer
 * reopened the success page in a new tab, so sessionStorage is empty.
 */
export function whatsappFallbackLink(orderNumber: string, locale: Locale): string {
  const text =
    locale === "ar"
      ? `مرحباً لانتانا 🌿\nأودّ تأكيد طلبي رقم: ${orderNumber}`
      : `Hello LANTANA 🌿\nI would like to confirm my order: ${orderNumber}`;
  return `https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(text)}`;
}
