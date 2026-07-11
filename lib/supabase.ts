import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when Supabase is configured. When false, lib/db.ts uses its in-memory catalog store. */
export const hasDB = Boolean(url && (serviceKey || anonKey));

let _client: SupabaseClient | null = null;

/** Service-role client for server-side reads/writes. Never import into client components. */
export function supa(): SupabaseClient {
  if (!hasDB) throw new Error("Supabase is not configured.");
  if (!_client) {
    _client = createClient(url as string, (serviceKey || anonKey) as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}
