import { NextResponse, type NextRequest } from "next/server";
import { detectCountry } from "@/lib/geo";
import { COUNTRY_CURRENCY } from "@/lib/currency";

export async function GET(req: NextRequest) {
  const country = detectCountry(req);
  return NextResponse.json({ country, currency: COUNTRY_CURRENCY[country] });
}
