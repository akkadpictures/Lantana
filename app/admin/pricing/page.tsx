import { Shell } from "@/components/admin/Shell";
import { getProducts } from "@/lib/db";
import { PricingClient } from "@/components/admin/PricingClient";

export const dynamic = "force-dynamic";

export default async function AdminPricing() {
  const products = await getProducts({ includeDrafts: true });
  return (
    <Shell title="Country pricing">
      <p className="mb-5 max-w-2xl font-body text-sm text-ink/60">
        Set an explicit price per currency for each product. Blank cells auto-convert from the USD base price
        (with psychological rounding for SYP). Syria → SYP · UAE → AED · Saudi → SAR · Qatar → QAR · Kuwait → KWD · Worldwide → USD.
      </p>
      <PricingClient initial={products} />
    </Shell>
  );
}
