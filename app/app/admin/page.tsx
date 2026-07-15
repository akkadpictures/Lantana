import { Shell } from "@/components/admin/Shell";
import { Stat, Card, Table, Badge } from "@/components/admin/ui";
import { getOrders, getProducts, getAllReviews, getCustomers } from "@/lib/db";
import { formatPrice } from "@/lib/currency";
import type { Currency, OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

const statusTone: Record<OrderStatus, "amber" | "green" | "olive" | "red" | "grey"> = {
  pending: "amber", paid: "green", processing: "olive", shipped: "olive", delivered: "green", cancelled: "red",
};

export default async function AdminOverview() {
  const [orders, products, reviews, customers] = await Promise.all([getOrders(), getProducts({ includeDrafts: true }), getAllReviews(), getCustomers()]);
  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((n, o) => n + o.total, 0);
  const pendingReviews = reviews.filter((r) => !r.approved).length;
  const lowStock = products.filter((p) => p.status === "active" && p.inventory <= 10);
  const recent = orders.slice(0, 8);
  const mainCurrency: Currency = orders[0]?.currency ?? "USD";

  return (
    <Shell title="Overview">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Orders" value={String(orders.length)} sub={`${orders.filter((o) => o.status === "pending").length} awaiting action`} />
        <Stat label="Revenue" value={orders.length ? formatPrice(revenue, mainCurrency, "en") : "—"} sub="Excludes cancelled" />
        <Stat label="Customers" value={String(customers.length)} />
        <Stat label="Products" value={String(products.filter((p) => p.status === "active").length)} sub={`${products.length} total`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <h2 className="mb-3 font-display text-xl">Recent orders</h2>
          {recent.length === 0 ? (
            <Card><p className="font-body text-sm text-ink/50">No orders yet. Orders placed on the storefront appear here in real time.</p></Card>
          ) : (
            <Table head={["Order", "Customer", "Total", "Status", "Date"]}>
              {recent.map((o) => (
                <tr key={o.id} className="border-b hairline last:border-0">
                  <td className="px-4 py-3 font-medium">{o.number}</td>
                  <td className="px-4 py-3 text-ink/70">{o.customer.name}</td>
                  <td className="px-4 py-3">{formatPrice(o.total, o.currency, "en")}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone[o.status]}>{o.status}</Badge></td>
                  <td className="px-4 py-3 text-ink/50">{new Date(o.createdAt).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </Table>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="mb-3 font-display text-xl">Needs attention</h2>
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-ink/70">Reviews to moderate</span>
                <Badge tone={pendingReviews ? "amber" : "grey"}>{pendingReviews}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-ink/70">Low-stock products</span>
                <Badge tone={lowStock.length ? "red" : "grey"}>{lowStock.length}</Badge>
              </div>
            </Card>
          </div>
          {lowStock.length > 0 && (
            <div>
              <h3 className="mb-2 font-body text-[11px] uppercase tracking-wide2 text-ink/50">Restock soon</h3>
              <Card className="space-y-2">
                {lowStock.map((p) => (
                  <div key={p.id} className="flex justify-between font-body text-sm">
                    <span>{p.name.en}</span>
                    <span className="text-red-800">{p.inventory} left</span>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
