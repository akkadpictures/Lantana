import { Shell } from "@/components/admin/Shell";
import { getCoupons } from "@/lib/db";
import { CouponsClient } from "@/components/admin/CouponsClient";

export const dynamic = "force-dynamic";

export default async function AdminCoupons() {
  const coupons = await getCoupons();
  return (
    <Shell title="Coupons">
      <CouponsClient initial={coupons} />
    </Shell>
  );
}
