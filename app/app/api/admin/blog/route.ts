import { NextResponse, type NextRequest } from "next/server";
import { getBlogPosts, upsertBlogPost, deleteBlogPost } from "@/lib/db";
import { z } from "zod";

const localizedText = z.object({ en: z.string(), ar: z.string() });
const schema = z.object({
  id: z.string().min(1), slug: z.string().min(1).max(120),
  title: localizedText, excerpt: localizedText, body: localizedText,
  image: z.string().min(1), publishedAt: z.string(),
});

export async function GET() {
  return NextResponse.json({ posts: await getBlogPosts() });
}
export async function POST(req: NextRequest) {
  let input;
  try { input = schema.parse(await req.json()); } catch { return NextResponse.json({ error: "invalid_input" }, { status: 400 }); }
  await upsertBlogPost(input);
  return NextResponse.json({ ok: true });
}
export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  await deleteBlogPost(id);
  return NextResponse.json({ ok: true });
}
