import { NextResponse, type NextRequest } from "next/server";
import { detectCountry, COUNTRY_COOKIE } from "@/lib/geo";
import { verifySession, sessionCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const LOCALE_COOKIE = "lantana_locale";
const YEAR = 60 * 60 * 24 * 365;
const MONTH = 60 * 60 * 24 * 30;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /* ── API: rate limiting ────────────────────────────────────── */
  if (pathname.startsWith("/api/")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
    const limit = pathname.startsWith("/api/checkout") ? 12 : pathname.startsWith("/api/admin") ? 60 : 40;
    const { ok } = rateLimit(`${ip}:${pathname}`, limit);
    if (!ok) {
      return new NextResponse(JSON.stringify({ error: "rate_limited" }), {
        status: 429,
        headers: { "content-type": "application/json" },
      });
    }

    // Guard admin APIs (login route excepted).
    if (pathname.startsWith("/api/admin") && pathname !== "/api/admin/login") {
      const authed = await verifySession(req.cookies.get(sessionCookie.name)?.value);
      if (!authed) {
        return new NextResponse(JSON.stringify({ error: "unauthorized" }), {
          status: 401,
          headers: { "content-type": "application/json" },
        });
      }
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

  /* ── Storefront ────────────────────────────────────────────────
   * English is the DEFAULT locale and is served at bare paths:
   *   lantanaperfume.com            → English home
   *   lantanaperfume.com/shop       → English shop
   * Arabic keeps its explicit prefix:
   *   lantanaperfume.com/ar         → Arabic home
   *   lantanaperfume.com/ar/shop    → Arabic shop
   *
   * Any /en/* URL (including the 27 internal links that still build
   * `/${locale}/...`) is permanently folded back to the bare path, so
   * "/en" never survives in the address bar.
   * ──────────────────────────────────────────────────────────── */
  const country = detectCountry(req);

  const setCommon = (res: NextResponse, locale: "en" | "ar") => {
    res.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: YEAR });
    /* Refreshed on every request, never merely seeded: the tier a customer pays
       must track where they are now, not where they were a month ago. */
    res.cookies.set(COUNTRY_COOKIE, country, { path: "/", maxAge: MONTH });
    return res;
  };

  /* 1 — Strip the "/en" prefix: /en → /, /en/shop → /shop */
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return setCommon(NextResponse.redirect(url), "en");
  }

  /* 2 — Arabic: serve as-is under its /ar prefix */
  if (pathname === "/ar" || pathname.startsWith("/ar/")) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-lantana-locale", "ar");
    return setCommon(NextResponse.next({ request: { headers: requestHeaders } }), "ar");
  }

  /* 3 — Bare path: ALWAYS English, everywhere in the world.
   *
   * English is the universal default: the bare domain opens in English for
   * every visitor regardless of country, browser language, or any locale they
   * chose on a previous visit. Arabic is entered only by deliberate choice —
   * the visitor taps «العربية», which routes to /ar and is held there by its
   * own prefix. We no longer honour a stored `ar` preference on bare paths, so
   * switching back to English never silently bounces to Arabic. */
  const url = req.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-lantana-locale", "en");
  return setCommon(NextResponse.rewrite(url, { request: { headers: requestHeaders } }), "en");
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|images|fonts|icon.svg|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest).*)",
  ],
};
