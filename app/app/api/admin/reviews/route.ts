import { NextResponse, type NextRequest } from "next/server";
import { getAllReviews, setReviewApproval, deleteReview } from "@/lib/db";
import { z } from "zod";

const patch = z.object({ id: z.string().min(1), approved: z.boolean() });

export async function GET() {
  return NextResponse.json({ reviews: await getAllReviews() });
}
export async function PATCH(req: NextRequest) {
  let input;
  try { input = patch.parse(await req.json()); } catch { return NextResponse.json({ error: "invalid_input" }, { status: 400 }); }
  await setReviewApproval(input.id, input.approved);
  return NextResponse.json({ ok: true });
}
export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  await deleteReview(id);
  return NextResponse.json({ ok: true });
}
