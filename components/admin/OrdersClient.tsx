"use client";

import { useState } from "react";
import { Table, Badge, Card } from "@/components/admin/ui";
import { formatPrice } from "@/lib/currency";
import type { Order, OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = [
  "awaiting_confirmation", "pending", "paid", "processing", "shipped", "delivered", "cancelled",
];

const tone: Record<OrderStatus, "amber" | "green" | "olive" | "red" | "grey"> = {
  awaiting_confirmation: "grey",
  pending: "amber",
  paid: "green",
  processing: "olive",
  shipped: "olive",
  delivered: "green",
  cancelled: "red",
};

const LABEL: Record<OrderStatus, string> = {
  awaiting_confirmation: "awaiting WhatsApp",
  pending: "pending",
  paid: "paid",
  processing: "processing",
  shipped: "shipped",
  delivered: "delivered",
  cancelled: "cancelled",
};

/** Opens WhatsApp on the customer's number so the maison can start the conversation. */
function waLink(phone: string, orderNo: string) {
  const d = phone.replace(/\D/g, "");
  const intl = d.startsWith("963") ? d : d.replace(/^0/, "963");
  return `https://wa.me/${intl}?text=${encodeURIComponent(`LANTANA — ${orderNo}`)}`;
}

export function OrdersClient({ initial }: { initial: Order[] }) {
  const [orders, setOrders] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  async function setStatus(id: string, status: OrderStatus) {
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
    await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
  }

  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const awaiting = orders.filter((o) => o.status === "awaiting_confirmation").length;

  if (orders.length === 0) return <Card><p className="font-body text-base2 text-ink/50">No orders yet.</p></Card>;

  return (
    <>
      {awaiting > 0 && (
        <div className="mb-5 border-s-2 border-amber-500 bg-amber-50/60 px-4 py-3 font-body text-sm2 text-ink/70">
          {awaiting} order{awaiting === 1 ? "" : "s"} awaiting WhatsApp confirmation. No stock is reserved for these until you confirm them.
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {(["all", ...STATUSES] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 font-body text-micro uppercase tracking-wide2 ${filter === s ? "bg-ink text-ivory" : "bg-ink/5 text-ink/60"}`}>
            {s === "all" ? "all" : LABEL[s]}
          </button>
        ))}
      </div>

      <Table head={["Order", "Customer", "Country", "Payment", "Total", "Status", "Date", ""]}>
        {shown.map((o) => (
          <>
            <tr key={o.id} className="border-b hairline">
              <td className="px-4 py-3 font-medium">{o.number}</td>
              <td className="px-4 py-3 text-ink/70">{o.customer.name}</td>
              <td className="px-4 py-3">{o.country}</td>
              <td className="px-4 py-3 text-ink/60">{o.paymentMethod}</td>
              <td className="px-4 py-3">{formatPrice(o.total, o.currency, "en")}</td>
              <td className="px-4 py-3"><Badge tone={tone[o.status]}>{LABEL[o.status]}</Badge></td>
              <td className="px-4 py-3 text-ink/50">{new Date(o.createdAt).toLocaleDateString("en-GB")}</td>
              <td className="px-4 py-3"><button className="text-olive-deep underline" onClick={() => setOpen(open === o.id ? null : o.id)}>{open === o.id ? "Hide" : "View"}</button></td>
            </tr>
            {open === o.id && (
              <tr key={o.id + "-d"} className="border-b hairline bg-ink/[0.02]">
                <td colSpan={8} className="px-4 py-5">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-2 font-body text-micro uppercase tracking-wide2 text-ink/50">Customer</p>
                      <p className="font-body text-base2">{o.customer.name}</p>
                      <p className="font-body text-base2 text-ink/60">
                        {o.customer.email} ·{" "}
                        <a href={waLink(o.customer.phone, o.number)} target="_blank" rel="noopener noreferrer" className="text-olive-deep underline" dir="ltr">
                          {o.customer.phone}
                        </a>
                      </p>
                      <p className="font-body text-base2 text-ink/60">{o.customer.address}, {o.customer.city}, {o.country}</p>
                      {o.customer.notes && <p className="mt-2 font-body text-base2 italic text-ink/50">“{o.customer.notes}”</p>}
                      {o.ip && <p className="mt-2 font-body text-sm2 text-ink/35" dir="ltr">IP {o.ip}</p>}
                    </div>
                    <div>
                      <p className="mb-2 font-body text-micro uppercase tracking-wide2 text-ink/50">Items</p>
                      {o.items.map((i, k) => (
                        <div key={k} className="flex justify-between font-body text-base2">
                          <span>{i.name} × {i.qty}</span>
                          <span>{formatPrice(i.unitPrice * i.qty, o.currency, "en")}</span>
                        </div>
                      ))}
                      <div className="mt-2 border-t hairline pt-2 font-body text-base2">
                        <div className="flex justify-between text-ink/60">
                          <span>Shipping</span>
                          <span>{o.shipping > 0 ? formatPrice(o.shipping, o.currency, "en") : "Complimentary"}</span>
                        </div>
                        {o.discount > 0 && <div className="flex justify-between text-olive-deep"><span>Discount {o.couponCode ? `(${o.couponCode})` : ""}</span><span>−{formatPrice(o.discount, o.currency, "en")}</span></div>}
                        <div className="flex justify-between font-medium"><span>Total</span><span>{formatPrice(o.total, o.currency, "en")}</span></div>
                      </div>

                      {o.status === "awaiting_confirmation" && (
                        <div className="mt-4 border border-amber-300/60 bg-amber-50/60 p-3">
                          <p className="mb-2 font-body text-sm2 text-ink/65">
                            Not yet confirmed — stock is untouched. Confirming deducts inventory.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => setStatus(o.id, "processing")}
                              className="rounded bg-olive px-3 py-1.5 font-body text-sm2 text-ivory hover:bg-olive-deep">
                              Confirm &amp; reserve stock
                            </button>
                            <button onClick={() => setStatus(o.id, "cancelled")}
                              className="rounded bg-ink/5 px-3 py-1.5 font-body text-sm2 text-ink/60 hover:bg-ink/10">
                              Discard
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="mt-4">
                        <p className="mb-1.5 font-body text-micro uppercase tracking-wide2 text-ink/50">Update status</p>
                        <div className="flex flex-wrap gap-2">
                          {STATUSES.map((s) => (
                            <button key={s} onClick={() => setStatus(o.id, s)}
                              className={`rounded px-2.5 py-1 font-body text-sm2 ${o.status === s ? "bg-olive text-ivory" : "bg-ink/5 text-ink/60 hover:bg-ink/10"}`}>{LABEL[s]}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </>
        ))}
      </Table>
    </>
  );
}
