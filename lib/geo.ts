import type { NextRequest } from "next/server";
import { toCountryCode } from "./currency";
import type { CountryCode } from "@/types";

export const COUNTRY_COOKIE = "lantana_country";

/** Vercel injects x-vercel-ip-country at the edge; Cloudflare uses cf-ipcountry. */
export function detectCountry(req: NextRequest): CountryCode {
  const cookie = req.cookies.get(COUNTRY_COOKIE)?.value;
  if (cookie) return toCountryCode(cookie);
  const header =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    "";
  return toCountryCode(header);
}
