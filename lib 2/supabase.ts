import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Sanitises the Supabase URL so a mis-pasted value can never break the build.
 * Handles: duplicated pastes ("...supabase.cohttps://..."), missing scheme,
 * trailing slashes, and stray whitespace/quotes.
 */
function cleanUrl(raw: string | undefined): string {
  if (!raw) return "";
  let v = raw.trim().replace(/^["']|["']$/g, "");
  // If the value was pasted twice, keep only the first occurrence.
  const dup = v.indexOf("https://", 8);
  if (dup > 0) v = v.slice(0, dup);
  // Repair a value that lost its separator, e.g. "...supabase.cohttps"
  v = v.replace(/(\.supabase\.co).*$/i, "$1");
  v = v.replace(/\/+$/, "");
  if (v && !/^https?:\/\//i.test(v)) v = `https://${v}`;
  // Only accept a well-formed URL.
  try {
    return new URL(v).origin;
  } catch {
    return "";
  }
}

function cleanKey(raw: string | undefined): string {
  if (!raw) return "";
  return raw.trim().replace(/^["']|["']$/g, "").replace(/\s+/g, "");
}

const url = cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const serviceKey = cleanKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
const anonKey = cleanKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** True only when Supabase is configured with a valid URL and key. */
export const hasDB = Boolean(url && (serviceKey || anonKey));

let _client: SupabaseClient | null = null;

/** Service-role client for server-side reads/writes. Never import into client components. */
export function supa(): SupabaseClient {
  if (!hasDB) throw new Error("Supabase is not configured.");
  if (!_client) {
    _client = createClient(url, serviceKey || anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}
