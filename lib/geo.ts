import type { NextRequest } from "next/server";
import { toCountryCode } from "./currency";
import type { CountryCode } from "@/types";

export const COUNTRY_COOKIE = "lantana_country";

/**
 * Where the visitor is.
 *
 * Vercel injects x-vercel-ip-country at the edge; Cloudflare uses cf-ipcountry.
 * The header wins over the cookie — the cookie is only a cache for the rare
 * request that arrives without geo, and the price tier hangs off this value, so
 * a value the visitor can edit must never outrank one the network asserts.
 */
export function detectCountry(req: NextRequest): CountryCode {
  const header = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "";
  if (header) return toCountryCode(header);
  return toCountryCode(req.cookies.get(COUNTRY_COOKIE)?.value);
}
