import { NextResponse, type NextRequest } from "next/server";
import { newsletterSchema } from "@/lib/validation";
import { subscribeNewsletter } from "@/lib/db";

export async function POST(req: NextRequest) {
  let input;
  try { input = newsletterSchema.parse(await req.json()); } catch { return NextResponse.json({ error: "invalid_email" }, { status: 400 }); }
  await subscribeNewsletter(input.email.toLowerCase());
  return NextResponse.json({ ok: true });
}
