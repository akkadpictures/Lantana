import { Shell } from "@/components/admin/Shell";
import { getShippingRates } from "@/lib/db";
import { ShippingClient } from "@/components/admin/ShippingClient";

export const dynamic = "force-dynamic";

export default async function AdminShipping() {
  const rates = await getShippingRates();
  return (
    <Shell title="Shipping">
      <ShippingClient initial={rates} />
    </Shell>
  );
}
