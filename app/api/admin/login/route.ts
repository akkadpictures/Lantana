import { NextResponse, type NextRequest } from "next/server";
import { loginSchema } from "@/lib/validation";
import { verifyCredentials, createSession, sessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let input;
  try {
    input = loginSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const ok = await verifyCredentials(input.email, input.password);
  if (!ok) return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  const token = await createSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie.name, token, sessionCookie.options);
  return res;
}
