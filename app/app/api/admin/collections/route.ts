import { NextResponse, type NextRequest } from "next/server";
import { getCollections, upsertCollection, deleteCollection } from "@/lib/db";
import { z } from "zod";

const localizedText = z.object({ en: z.string(), ar: z.string() });
const schema = z.object({
  id: z.string().min(1), slug: z.string().min(1).max(80),
  name: localizedText, description: localizedText, image: z.string().min(1),
});

export async function GET() {
  return NextResponse.json({ collections: await getCollections() });
}
export async function POST(req: NextRequest) {
  let input;
  try { input = schema.parse(await req.json()); } catch { return NextResponse.json({ error: "invalid_input" }, { status: 400 }); }
  await upsertCollection(input);
  return NextResponse.json({ ok: true });
}
export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  await deleteCollection(id);
  return NextResponse.json({ ok: true });
}
