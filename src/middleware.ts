import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Canonical domain enforcement ───────────────────────────────
  // Any *.vercel.app host 308-redirects to manatechbazar.in so the
  // preview/deploy domain never competes with the real domain in Google.
  const host = (request.headers.get("host") || "").toLowerCase();
  if (host.endsWith(".vercel.app")) {
    const target = request.nextUrl.clone();
    target.protocol = "https:";
    target.host = "manatechbazar.in";
    target.hostname = "manatechbazar.in";
    target.port = "";
    return NextResponse.redirect(target, 308);
  }

  // Admin routes require ADMIN role
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // Use next-auth's getToken which can decrypt JWE tokens
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: true,
      cookieName: "__Secure-authjs.session-token",
    });

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Everything else is open — no customer auth required
  return NextResponse.next();
}

export const config = {
  // Catch-all so the vercel.app → manatechbazar.in redirect applies to
  // every page, sitemap.xml, robots.txt and API route (Next.js internals
  // under /_next/ are excluded).
  matcher: ["/((?!_next/).*)"],
};
