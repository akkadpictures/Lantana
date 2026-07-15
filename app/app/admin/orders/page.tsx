import { Shell } from "@/components/admin/Shell";
import { getOrders } from "@/lib/db";
import { OrdersClient } from "@/components/admin/OrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrders() {
  const orders = await getOrders();
  return (
    <Shell title="Orders">
      <OrdersClient initial={orders} />
    </Shell>
  );
}
