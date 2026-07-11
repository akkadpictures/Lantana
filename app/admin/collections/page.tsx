import { Shell } from "@/components/admin/Shell";
import { getCollections } from "@/lib/db";
import { CollectionsClient } from "@/components/admin/CollectionsClient";

export const dynamic = "force-dynamic";

export default async function AdminCollections() {
  const collections = await getCollections();
  return (
    <Shell title="Collections">
      <CollectionsClient initial={collections} />
    </Shell>
  );
}
