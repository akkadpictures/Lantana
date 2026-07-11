import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE = "lantana_admin";

/**
 * Signing secret for the admin session cookie.
 * Priority: explicit AUTH_SECRET → derived from the Supabase service-role key
 * (high entropy, already secret) → local development fallback.
 * This means NO manual secret generation is required for deployment: paste the
 * Supabase keys and a strong, stable secret is derived automatically.
 */
function secret(): Uint8Array {
  const source =
    process.env.AUTH_SECRET ||
    (process.env.SUPABASE_SERVICE_ROLE_KEY ? `lantana::${process.env.SUPABASE_SERVICE_ROLE_KEY}` : "") ||
    "lantana-development-secret-change-in-production";
  return new TextEncoder().encode(source);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

/**
 * Verifies admin credentials against plain env vars.
 * ADMIN_EMAIL / ADMIN_PASSWORD are set directly in Vercel (encrypted at rest) —
 * no password hashing step required. Defaults allow immediate local sign-in.
 */
export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@lantana.com").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "lantana2026";
  return timingSafeEqual(email.trim().toLowerCase(), adminEmail) && timingSafeEqual(password, adminPassword);
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
