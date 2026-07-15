import { Shell } from "@/components/admin/Shell";
import { getProducts, getCollections } from "@/lib/db";
import { ProductsClient } from "@/components/admin/ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const [products, collections] = await Promise.all([getProducts({ includeDrafts: true }), getCollections()]);
  return (
    <Shell title="Products">
      <ProductsClient initial={products} collections={collections} />
    </Shell>
  );
}
