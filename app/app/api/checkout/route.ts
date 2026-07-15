import { NextResponse, type NextRequest } from "next/server";
import { checkoutSchema } from "@/lib/validation";
import { getProductById, getShippingRates, getCoupon, createOrder, adjustInventory } from "@/lib/db";
import { toCountryCode, priceOf, amountOf, multiplierFor, toCurrency } from "@/lib/currency";
import { getRates } from "@/lib/rates";
import { hasStripe, stripe, toStripeAmount, STRIPE_SUPPORTED } from "@/lib/stripe";
import { orderNumber, t } from "@/lib/utils";
import { SITE_URL } from "@/lib/seo";
import type { Currency, Order } from "@/types";

export async function POST(req: NextRequest) {
  let input;
  try {
    input = checkoutSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  /* The delivery country decides shipping and payment rails. The *price tier*
     is decided by where the customer actually is, read from the edge geo header,
     so a Damascus price cannot be claimed by typing "Syria" into a form. */
  const shipTo = toCountryCode(input.country);
  const geoCountry = toCountryCode(
    req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || ""
  );
  const multiplier = multiplierFor(geoCountry);
  const currency: Currency =
    toCurrency(req.cookies.get("lantana_currency")?.value) ?? (geoCountry === "SY" ? "SYP" : "USD");
  const rates = await getRates();
  const country = shipTo;

  /* Server-side pricing — the client total is never trusted. */
  const lines: Order["items"] = [];
  let subtotal = 0;
  let subtotalUSD = 0;
  for (const item of input.items) {
    const p = await getProductById(item.productId);
    if (!p || p.status !== "active") return NextResponse.json({ error: "product_unavailable" }, { status: 400 });
    if (p.inventory < item.qty) return NextResponse.json({ error: "insufficient_stock" }, { status: 409 });
    const unit = priceOf(p, currency, multiplier, rates);
    lines.push({ productId: p.id, name: t(p.name, input.locale), qty: item.qty, unitPrice: unit });
    subtotal += unit * item.qty;
    subtotalUSD += p.basePriceUSD * multiplier * item.qty;
  }

  const shippingRates = await getShippingRates();
  const rate = shippingRates.find((r) => r.country === country) ?? shippingRates.find((r) => r.country === "WW")!;
  const shipping = amountOf(rate.priceUSD, currency, multiplier, rates);
  const shippingUSD = rate.priceUSD * multiplier;

  let discount = 0;
  let discountUSD = 0;
  let couponCode: string | null = null;
  if (input.couponCode) {
    const c = await getCoupon(input.couponCode);
    if (c && subtotalUSD >= c.minSubtotalUSD) {
      discount = c.type === "percent" ? Math.round(subtotal * (c.value / 100) * 100) / 100 : amountOf(c.value, currency, multiplier, rates);
      discountUSD = c.type === "percent" ? Math.round(subtotalUSD * (c.value / 100) * 100) / 100 : c.value * multiplier;
      couponCode = c.code;
    }
  }

  const total = Math.max(0, Math.round((subtotal + shipping - discount) * 100) / 100);
  const totalUSD = Math.max(0, Math.round((subtotalUSD + shippingUSD - discountUSD) * 100) / 100);

  const order: Order = {
    id: crypto.randomUUID(),
    number: orderNumber(),
    status: "pending",
    paymentMethod: input.paymentMethod,
    currency, country, subtotal, shipping, discount, total, couponCode,
    customer: {
      name: input.name, email: input.email, phone: input.phone,
      address: input.address, city: input.city, country, notes: input.notes || "",
    },
    items: lines,
    createdAt: new Date().toISOString(),
  };

  /* ── Stripe: card / Apple Pay / Google Pay ─────────────────── */
  if (input.paymentMethod === "stripe") {
    if (!hasStripe) return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
    const stripeCurrency = STRIPE_SUPPORTED.includes(currency) ? currency : "USD";
    const amount = stripeCurrency === currency ? total : totalUSD;
    await createOrder(order);
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: input.email,
      line_items: [{
        price_data: {
          currency: stripeCurrency.toLowerCase(),
          unit_amount: toStripeAmount(Math.max(0.5, amount), stripeCurrency),
          product_data: { name: `LANTANA — Order ${order.number}` },
        },
        quantity: 1,
      }],
      metadata: { order_id: order.id, order_number: order.number },
      success_url: `${SITE_URL}/${input.locale}/checkout/success?order=${order.number}&method=stripe`,
      cancel_url: `${SITE_URL}/${input.locale}/checkout`,
    });
    return NextResponse.json({ orderNumber: order.number, redirectUrl: session.url });
  }

  /* ── MyFatoorah: GCC gateway ───────────────────────────────── */
  if (input.paymentMethod === "myfatoorah") {
    const key = process.env.MYFATOORAH_API_KEY;
    if (!key) return NextResponse.json({ error: "myfatoorah_not_configured" }, { status: 503 });
    await createOrder(order);
    try {
      const res = await fetch(`${process.env.MYFATOORAH_BASE_URL || "https://api.myfatoorah.com"}/v2/SendPayment`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          NotificationOption: "LNK",
          CustomerName: input.name,
          CustomerEmail: input.email,
          InvoiceValue: total,
          DisplayCurrencyIso: currency,
          CallBackUrl: `${SITE_URL}/${input.locale}/checkout/success?order=${order.number}&method=myfatoorah`,
          ErrorUrl: `${SITE_URL}/${input.locale}/checkout`,
          CustomerReference: order.number,
        }),
      });
      const data = await res.json();
      const url = data?.Data?.InvoiceURL;
      if (!url) return NextResponse.json({ error: "myfatoorah_failed" }, { status: 502 });
      return NextResponse.json({ orderNumber: order.number, redirectUrl: url });
    } catch {
      return NextResponse.json({ error: "myfatoorah_failed" }, { status: 502 });
    }
  }

  /* ── COD / bank transfer: confirm immediately, decrement stock ─ */
  await createOrder(order);
  for (const l of lines) await adjustInventory(l.productId, -l.qty);
  return NextResponse.json({ orderNumber: order.number });
}
