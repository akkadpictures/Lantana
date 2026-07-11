"use client";

import { useState } from "react";
import { Table, Badge, Card } from "@/components/admin/ui";
import { formatPrice } from "@/lib/currency";
import type { Order, OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];
const tone: Record<OrderStatus, "amber" | "green" | "olive" | "red" | "grey"> = {
  pending: "amber", paid: "green", processing: "olive", shipped: "olive", delivered: "green", cancelled: "red",
};

export function OrdersClient({ initial }: { initial: Order[] }) {
  const [orders, setOrders] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  async function setStatus(id: string, status: OrderStatus) {
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
    await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
  }

  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (orders.length === 0) return <Card><p className="font-body text-sm text-ink/50">No orders yet.</p></Card>;

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2">
        {(["all", ...STATUSES] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 font-body text-[11px] uppercase tracking-wide2 ${filter === s ? "bg-ink text-ivory" : "bg-ink/5 text-ink/60"}`}>
            {s}
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
              <td className="px-4 py-3"><Badge tone={tone[o.status]}>{o.status}</Badge></td>
              <td className="px-4 py-3 text-ink/50">{new Date(o.createdAt).toLocaleDateString("en-GB")}</td>
              <td className="px-4 py-3"><button className="text-olive-deep underline" onClick={() => setOpen(open === o.id ? null : o.id)}>{open === o.id ? "Hide" : "View"}</button></td>
            </tr>
            {open === o.id && (
              <tr key={o.id + "-d"} className="border-b hairline bg-ink/[0.02]">
                <td colSpan={8} className="px-4 py-5">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-2 font-body text-[11px] uppercase tracking-wide2 text-ink/50">Customer</p>
                      <p className="font-body text-sm">{o.customer.name}</p>
                      <p className="font-body text-sm text-ink/60">{o.customer.email} · {o.customer.phone}</p>
                      <p className="font-body text-sm text-ink/60">{o.customer.address}, {o.customer.city}, {o.country}</p>
                      {o.customer.notes && <p className="mt-2 font-body text-sm italic text-ink/50">“{o.customer.notes}”</p>}
                    </div>
                    <div>
                      <p className="mb-2 font-body text-[11px] uppercase tracking-wide2 text-ink/50">Items</p>
                      {o.items.map((i, k) => (
                        <div key={k} className="flex justify-between font-body text-sm">
                          <span>{i.name} × {i.qty}</span>
                          <span>{formatPrice(i.unitPrice * i.qty, o.currency, "en")}</span>
                        </div>
                      ))}
                      <div className="mt-2 border-t hairline pt-2 font-body text-sm">
                        <div className="flex justify-between text-ink/60"><span>Shipping</span><span>{formatPrice(o.shipping, o.currency, "en")}</span></div>
                        {o.discount > 0 && <div className="flex justify-between text-olive-deep"><span>Discount {o.couponCode ? `(${o.couponCode})` : ""}</span><span>−{formatPrice(o.discount, o.currency, "en")}</span></div>}
                        <div className="flex justify-between font-medium"><span>Total</span><span>{formatPrice(o.total, o.currency, "en")}</span></div>
                      </div>
                      <div className="mt-4">
                        <p className="mb-1.5 font-body text-[11px] uppercase tracking-wide2 text-ink/50">Update status</p>
                        <div className="flex flex-wrap gap-2">
                          {STATUSES.map((s) => (
                            <button key={s} onClick={() => setStatus(o.id, s)}
                              className={`rounded px-2.5 py-1 font-body text-xs ${o.status === s ? "bg-olive text-ivory" : "bg-ink/5 text-ink/60 hover:bg-ink/10"}`}>{s}</button>
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
