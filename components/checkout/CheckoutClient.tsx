"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, cartSubtotalUSD } from "@/store/cart";
import { Input, Textarea, Select, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SUPPORTED_COUNTRIES, toCountryCode } from "@/lib/currency";
import { useMarket } from "@/components/market/MarketProvider";
import { cn, daysRange, t } from "@/lib/utils";
import type { CountryCode, Currency, Locale, PaymentMethod, ShippingRate } from "@/types";
import type { Dictionary } from "@/lib/i18n";

/** Syrian mobiles: 09XXXXXXXX / +9639XXXXXXXX / 9639XXXXXXXX. Mirrors the API. */
function isSyrianMobile(phone: string): boolean {
  const d = phone.replace(/\D/g, "");
  return /^(963)?0?9\d{8}$/.test(d);
}

export function CheckoutClient({ locale, country: initialCountry, rates, dict }: {
  locale: Locale; country: CountryCode; currency: Currency; rates: ShippingRate[]; dict: Dictionary;
}) {
  const { items, clear } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", notes: "" });
  const [company, setCompany] = useState(""); // honeypot — humans never see it
  const [country, setCountry] = useState<CountryCode>(initialCountry);
  const [payment, setPayment] = useState<PaymentMethod>(initialCountry === "SY" ? "whatsapp" : "stripe");
  const [coupon, setCoupon] = useState("");
  const [couponState, setCouponState] = useState<{ code: string; discountUSD: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState<"" | "ok" | "bad">("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");

  /* Price tier and display currency come from the market, never from the
     delivery-country field — that field says where a parcel goes, not where the
     customer is standing. */
  const { format, amount } = useMarket();
  const subtotalUSD = cartSubtotalUSD(items);
  const rate = rates.find((r) => r.country === country) ?? rates.find((r) => r.country === "WW")!;
  const shippingUSD = rate?.priceUSD ?? 0;
  const discountUSD = couponState?.discountUSD ?? 0;
  const totalUSD = Math.max(0, subtotalUSD + shippingUSD - discountUSD);

  const fmt = (usd: number) => format(amount(usd));
  /* A zero shipping line reads as a gift, not as a price of nothing. */
  const shippingLabel = shippingUSD > 0 ? fmt(shippingUSD) : dict.checkout.freeShipping;

  const paymentOptions = useMemo(() => {
    const opts: { key: PaymentMethod; label: string; sub: string }[] = [];
    if (country === "SY") {
      opts.push({ key: "whatsapp", label: dict.checkout.payWhatsapp, sub: dict.checkout.payWhatsappSub });
    } else {
      opts.push({ key: "stripe", label: dict.checkout.payCard, sub: dict.checkout.payCardSub });
      if (["AE", "SA", "QA", "KW"].includes(country)) {
        opts.push({ key: "myfatoorah", label: dict.checkout.payMyFatoorah, sub: dict.checkout.payMyFatoorahSub });
      }
    }
    opts.push({ key: "bank_transfer", label: dict.checkout.payBank, sub: dict.checkout.payBankSub });
    return opts;
  }, [country, dict]);

  function applyCoupon() {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    // Front-end coupon table (mirrors the catalog). The server always re-validates.
    const table: Record<string, { type: "percent" | "fixed"; value: number; min: number }> = {
      DAMASCUS10: { type: "percent", value: 10, min: 0 },
      MAISON25: { type: "fixed", value: 25, min: 200 },
    };
    const c = table[code];
    if (c && subtotalUSD >= c.min) {
      const d = c.type === "percent" ? Math.round(subtotalUSD * (c.value / 100) * 100) / 100 : c.value;
      setCouponState({ code, discountUSD: d });
      setCouponMsg("ok");
    } else {
      setCouponState(null);
      setCouponMsg("bad");
    }
  }

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm({ ...form, [field]: e.target.value });
      setErrors({ ...errors, [field]: false });
    };
  }

  function messageFor(code: string): string {
    const e = dict.checkout.errors;
    switch (code) {
      case "invalid_phone": return e.phoneSy;
      case "too_many_orders": return e.tooMany;
      case "duplicate_order": return e.duplicate;
      case "insufficient_stock": return e.stock;
      case "product_unavailable": return e.stock;
      default: return e.network;
    }
  }

  async function placeOrder() {
    const errs: Record<string, boolean> = {};
    if (form.name.trim().length < 2) errs.name = true;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = true;
    if (form.phone.trim().length < 6) errs.phone = true;
    if (country === "SY" && !isSyrianMobile(form.phone)) errs.phone = true;
    if (form.address.trim().length < 4) errs.address = true;
    if (form.city.trim().length < 2) errs.city = true;
    setErrors(errs);
    if (Object.keys(errs).length) {
      setServerError(errs.phone && country === "SY" ? dict.checkout.errors.phoneSy : dict.checkout.errors.generic);
      return;
    }

    setBusy(true);
    setServerError("");

    /* No silent fallback. If the order cannot be written, the customer is told —
       a success screen without a stored order is worse than an honest error. */
    try {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form, company, country, paymentMethod: payment, locale,
          couponCode: couponState?.code ?? "",
          items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        }),
      });

      if (!res.ok) {
        let code = "network";
        try { code = (await res.json())?.error ?? "network"; } catch { /* keep default */ }
        setServerError(messageFor(code));
        setBusy(false);
        return;
      }

      const data = await res.json();
      if (data.redirectUrl) { window.location.href = data.redirectUrl; return; }

      /* Hand the pre-filled WhatsApp message to the success page without putting
         customer details in the URL. sessionStorage is same-tab and short-lived. */
      if (data.whatsappUrl) {
        try { sessionStorage.setItem(`lantana_wa_${data.orderNumber}`, data.whatsappUrl); } catch { /* private mode */ }
      }

      clear();
      router.push(`/${locale}/checkout/success?order=${encodeURIComponent(data.orderNumber)}&method=${payment}`);
    } catch {
      setServerError(dict.checkout.errors.network);
      setBusy(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-32 text-center">
        <h1 className="h-display text-d2 text-ink">{dict.checkout.title}</h1>
        <p className="mt-6 font-body text-base2 text-ink/60">{dict.cart.empty}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">
      <h1 className="h-display mb-12 text-center text-d2 text-ink">{dict.checkout.title}</h1>
      <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr]">
        {/* Form */}
        <div className="space-y-10">
          <section>
            <p className="eyebrow mb-5">01 — {dict.checkout.contact}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="co-name">{dict.checkout.name}</Label>
                <Input id="co-name" autoComplete="name" value={form.name} onChange={set("name")} className={cn(errors.name && "border-red-700")} />
                {errors.name && <p className="mt-1 font-body text-sm2 text-red-800">{dict.checkout.errors.required}</p>}
              </div>
              <div>
                <Label htmlFor="co-email">{dict.checkout.email}</Label>
                <Input id="co-email" type="email" autoComplete="email" dir="ltr" value={form.email} onChange={set("email")} className={cn(errors.email && "border-red-700")} />
                {errors.email && <p className="mt-1 font-body text-sm2 text-red-800">{dict.checkout.errors.email}</p>}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="co-phone">{dict.checkout.phone}</Label>
                <Input
                  id="co-phone" type="tel" autoComplete="tel" dir="ltr"
                  placeholder={country === "SY" ? "09XX XXX XXX" : undefined}
                  value={form.phone} onChange={set("phone")}
                  className={cn(errors.phone && "border-red-700")}
                />
                {errors.phone && (
                  <p className="mt-1 font-body text-sm2 text-red-800">
                    {country === "SY" ? dict.checkout.errors.phoneSy : dict.checkout.errors.required}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section>
            <p className="eyebrow mb-5">02 — {dict.checkout.delivery}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="co-address">{dict.checkout.address}</Label>
                <Input id="co-address" autoComplete="street-address" value={form.address} onChange={set("address")} className={cn(errors.address && "border-red-700")} />
              </div>
              <div>
                <Label htmlFor="co-city">{dict.checkout.city}</Label>
                <Input id="co-city" autoComplete="address-level2" value={form.city} onChange={set("city")} className={cn(errors.city && "border-red-700")} />
              </div>
              <div>
                <Label htmlFor="co-country">{dict.checkout.country}</Label>
                <Select id="co-country" value={country} onChange={(e) => {
                  const c = toCountryCode(e.target.value);
                  setCountry(c);
                  setPayment(c === "SY" ? "whatsapp" : "stripe");
                  setServerError("");
                }}>
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{locale === "ar" ? c.ar : c.en}</option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="co-notes">{dict.checkout.notes}</Label>
                <Textarea id="co-notes" value={form.notes} onChange={set("notes")} className="min-h-20" />
              </div>
            </div>

            {/* Honeypot. Off-screen rather than display:none — some bots skip hidden inputs. */}
            <div aria-hidden className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="co-company">Company</label>
              <input id="co-company" name="company" type="text" tabIndex={-1} autoComplete="off"
                value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>

            <p className="mt-3 font-body text-sm2 text-ink/50">
              {dict.checkout.eta}: {daysRange(rate.etaDays[0], rate.etaDays[1], locale, {
                one: dict.checkout.dayOne,
                two: dict.checkout.dayTwo,
                few: dict.checkout.dayFew,
                many: dict.checkout.days,
              })} · {t(rate.label, locale)}
            </p>
          </section>

          <section>
            <p className="eyebrow mb-5">03 — {dict.checkout.payment}</p>
            <div className="space-y-3" role="radiogroup" aria-label={dict.checkout.payment}>
              {paymentOptions.map((opt) => (
                <button
                  key={opt.key} role="radio" aria-checked={payment === opt.key}
                  onClick={() => setPayment(opt.key)}
                  className={cn(
                    "flex w-full items-start gap-4 border p-4 text-start transition-colors duration-300",
                    payment === opt.key ? "border-olive bg-olive/5" : "border-ink/15 hover:border-ink/40"
                  )}
                >
                  <span className={cn("mt-1 block h-3.5 w-3.5 shrink-0 rounded-full border", payment === opt.key ? "border-olive bg-olive" : "border-ink/30")} />
                  <span>
                    <span className="block font-body text-base2 text-ink">{opt.label}</span>
                    <span className="block font-body text-sm2 text-ink/50">{opt.sub}</span>
                  </span>
                </button>
              ))}
            </div>
            {payment === "whatsapp" && (
              <p className="mt-4 border-s-2 border-olive/40 ps-4 font-body text-sm2 leading-relaxed text-ink/55">
                {dict.checkout.whatsappNotice}
              </p>
            )}
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit border hairline bg-ivory-soft/60 p-6 lg:sticky lg:top-28">
          <ul className="space-y-4 border-b hairline pb-5">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3 font-body text-base2">
                <span className="text-ink/70">{t(i.name, locale)} × {i.qty}</span>
                <span>{fmt(i.unitPriceUSD * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 border-b hairline py-5">
            <Input placeholder={dict.checkout.coupon} value={coupon} onChange={(e) => { setCoupon(e.target.value); setCouponMsg(""); }} className="py-2.5" />
            <Button variant="outline" onClick={applyCoupon} className="shrink-0 px-4 py-2.5">{dict.checkout.apply}</Button>
          </div>
          {couponMsg === "ok" && <p className="pt-2 font-body text-sm2 text-olive-deep">{dict.checkout.couponApplied}</p>}
          {couponMsg === "bad" && <p className="pt-2 font-body text-sm2 text-red-800">{dict.checkout.couponInvalid}</p>}
          <div className="space-y-2 py-5 font-body text-base2">
            <div className="flex justify-between"><span className="text-ink/60">{dict.cart.subtotal}</span><span>{fmt(subtotalUSD)}</span></div>
            <div className="flex justify-between">
              <span className="text-ink/60">{dict.cart.shipping}</span>
              <span className={cn(shippingUSD === 0 && "text-olive-deep")}>{shippingLabel}</span>
            </div>
            {discountUSD > 0 && <div className="flex justify-between text-olive-deep"><span>{dict.cart.discount}</span><span>−{fmt(discountUSD)}</span></div>}
            <div className="flex justify-between border-t hairline pt-3 text-base2"><span>{dict.cart.total}</span><span className="text-olive-deep">{fmt(totalUSD)}</span></div>
          </div>
          {serverError && <p className="mb-3 font-body text-sm2 text-red-800" role="alert">{serverError}</p>}
          <Button className="w-full" onClick={placeOrder} disabled={busy}>
            {busy ? dict.checkout.processing : payment === "whatsapp" ? dict.checkout.placeOrderWhatsapp : dict.checkout.placeOrder}
          </Button>
        </aside>
      </div>
    </div>
  );
}
