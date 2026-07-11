import { Shell } from "@/components/admin/Shell";
import { getAllReviews, getProducts } from "@/lib/db";
import { ReviewsClient } from "@/components/admin/ReviewsClient";

export const dynamic = "force-dynamic";

export default async function AdminReviews() {
  const [reviews, products] = await Promise.all([getAllReviews(), getProducts({ includeDrafts: true })]);
  const names = Object.fromEntries(products.map((p) => [p.id, p.name.en]));
  return (
    <Shell title="Reviews">
      <ReviewsClient initial={reviews} names={names} />
    </Shell>
  );
}
