import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE = "lantana_admin";

/**
 * Signing secret for the admin session cookie.
 * Priority: explicit AUTH_SECRET → derived from the Supabase service-role key
 * (high entropy, already secret) → local development fallback.
 */
function secret(): Uint8Array {
  const source =
    clean(process.env.AUTH_SECRET) ||
    (clean(process.env.SUPABASE_SERVICE_ROLE_KEY)
      ? `lantana::${clean(process.env.SUPABASE_SERVICE_ROLE_KEY)}`
      : "") ||
    "lantana-development-secret-change-in-production";
  return new TextEncoder().encode(source);
}

/**
 * Environment values pasted through a dashboard very often carry an invisible
 * trailing newline, a stray space, or wrapping quotes. Any one of those makes a
 * byte-for-byte credential comparison fail while the value *looks* correct in
 * the UI — so every env value is normalised before it is ever compared.
 */
function clean(v: string | undefined | null): string {
  if (!v) return "";
  return v.trim().replace(/^["']|["']$/g, "").trim();
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

/**
 * Verifies admin credentials against ADMIN_EMAIL / ADMIN_PASSWORD env vars.
 * Both sides are normalised, so a stray space in Vercel no longer locks you out.
 */
export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = (clean(process.env.ADMIN_EMAIL) || "admin@lantana.com").toLowerCase();
  const adminPassword = clean(process.env.ADMIN_PASSWORD) || "lantana2026";

  const emailOk = timingSafeEqual(clean(email).toLowerCase(), adminEmail);
  const passwordOk = timingSafeEqual(clean(password), adminPassword);
  return emailOk && passwordOk;
}

export async function createSession(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret());
}

export async function verifySession(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export const sessionCookie = {
  name: SESSION_COOKIE,
  options: {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  },
};
