"use client";

import { useState } from "react";
import { Table, Badge, Card } from "@/components/admin/ui";
import { Stars } from "@/components/product/Stars";
import type { Review } from "@/types";

export function ReviewsClient({ initial, names }: { initial: Review[]; names: Record<string, string> }) {
  const [reviews, setReviews] = useState(initial);

  async function approve(id: string, approved: boolean) {
    setReviews((list) => list.map((r) => (r.id === id ? { ...r, approved } : r)));
    await fetch("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, approved }) });
  }
  async function remove(id: string) {
    await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    setReviews((list) => list.filter((r) => r.id !== id));
  }

  if (reviews.length === 0) return <Card><p className="font-body text-base2 text-ink/50">No reviews yet.</p></Card>;

  return (
    <Table head={["Product", "Author", "Rating", "Review", "Status", ""]}>
      {reviews.map((r) => (
        <tr key={r.id} className="border-b hairline last:border-0 align-top">
          <td className="px-4 py-3 font-medium">{names[r.productId] ?? r.productId}</td>
          <td className="px-4 py-3 text-ink/70">{r.author}</td>
          <td className="px-4 py-3"><Stars rating={r.rating} /></td>
          <td className="max-w-sm px-4 py-3 text-ink/70">{r.body}</td>
          <td className="px-4 py-3"><Badge tone={r.approved ? "green" : "amber"}>{r.approved ? "approved" : "pending"}</Badge></td>
          <td className="whitespace-nowrap px-4 py-3">
            {!r.approved && <button className="text-olive-deep underline" onClick={() => approve(r.id, true)}>Approve</button>}
            {r.approved && <button className="text-ink/60 underline" onClick={() => approve(r.id, false)}>Unpublish</button>}
            <button className="ms-3 text-red-800 underline" onClick={() => remove(r.id)}>Delete</button>
          </td>
        </tr>
      ))}
    </Table>
  );
}
