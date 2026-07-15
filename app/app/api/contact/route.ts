import { NextResponse, type NextRequest } from "next/server";
import { contactSchema } from "@/lib/validation";
import { subscribeNewsletter } from "@/lib/db";

export async function POST(req: NextRequest) {
  let input;
  try { input = contactSchema.parse(await req.json()); } catch { return NextResponse.json({ error: "invalid_input" }, { status: 400 }); }
  await subscribeNewsletter(input.email.toLowerCase());
  console.info("[lantana] contact:", input.name, input.email);
  return NextResponse.json({ ok: true });
}
