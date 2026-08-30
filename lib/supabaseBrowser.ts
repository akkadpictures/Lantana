import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client (anon key only).
 *
 * This exists so the admin panel can upload files straight from the browser to
 * Supabase Storage. Uploads that go through a Next.js API route are capped at
 * 4.5MB by Vercel's serverless request-body limit; going direct removes that
 * ceiling entirely.
 *
 * Never import `lib/supabase.ts` (service-role) into a client component.
 */

function clean(raw: string | undefined): string {
  if (!raw) return "";
  return raw.trim().replace(/^["']|["']$/g, "").replace(/\s+/g, "");
}

function cleanUrl(raw: string | undefined): string {
  const v = clean(raw).replace(/(\.supabase\.co).*$/i, "$1").replace(/\/+$/, "");
  if (!v) return "";
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return "";
  }
}

const url = cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** True when the browser has everything it needs to upload directly. */
export const hasBrowserDB = Boolean(url && anonKey);

let _client: SupabaseClient | null = null;

/**
 * Returns the browser client, or null when the public env vars are missing.
 * Callers should fall back to the API route when this returns null.
 */
export function supaBrowser(): SupabaseClient | null {
  if (!hasBrowserDB) return null;
  if (!_client) {
    _client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}
