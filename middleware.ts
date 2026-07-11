import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n/config";
import { detectCountry, COUNTRY_COOKIE } from "@/lib/geo";
import { verifySession, sessionCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /* ── API: rate limiting ────────────────────────────────────── */
  if (pathname.startsWith("/api/")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
    const limit = pathname.startsWith("/api/checkout") ? 12 : pathname.startsWith("/api/admin") ? 60 : 40;
    const { ok } = rateLimit(`${ip}:${pathname}`, limit);
    if (!ok) return new NextResponse(JSON.stringify({ error: "rate_limited" }), { status: 429, headers: { "content-type": "application/json" } });

    // Guard admin APIs (login route excepted).
    if (pathname.startsWith("/api/admin") && pathname !== "/api/admin/login") {
      const authed = await verifySession(req.cookies.get(sessionCookie.name)?.value);
      if (!authed) return new NextResponse(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "content-type": "application/json" } });
    }
    return NextResponse.next();
  }

  /* ── Admin pages: session guard ────────────────────────────── */
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const authed = await verifySession(req.cookies.get(sessionCookie.name)?.value);
    if (!authed) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  /* ── Storefront: locale routing + country detection ────────── */
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  const country = detectCountry(req);

  if (!hasLocale) {
    const preferred =
      req.cookies.get("lantana_locale")?.value ||
      (req.headers.get("accept-language")?.toLowerCase().startsWith("ar") ? "ar" : defaultLocale);
    const locale = locales.includes(preferred as never) ? preferred : defaultLocale;
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    const res = NextResponse.redirect(url);
    res.cookies.set(COUNTRY_COOKIE, country, { path: "/", maxAge: 60 * 60 * 24 * 30 });
    return res;
  }

  const activeLocale = pathname.split("/")[1];
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-lantana-locale", activeLocale);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  if (!req.cookies.get(COUNTRY_COOKIE)) res.cookies.set(COUNTRY_COOKIE, country, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  res.cookies.set("lantana_locale", activeLocale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|images|fonts|icon.svg|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest).*)"],
};
