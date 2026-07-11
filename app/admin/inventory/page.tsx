import { Shell } from "@/components/admin/Shell";
import { getProducts } from "@/lib/db";
import { InventoryClient } from "@/components/admin/InventoryClient";

export const dynamic = "force-dynamic";

export default async function AdminInventory() {
  const products = await getProducts({ includeDrafts: true });
  return (
    <Shell title="Inventory">
      <InventoryClient initial={products} />
    </Shell>
  );
}
