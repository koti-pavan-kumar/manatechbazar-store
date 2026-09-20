import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Use next-auth's getToken which can decrypt JWE tokens
  // On HTTPS (Vercel), cookies are prefixed with __Secure-
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: true,
    cookieName: "__Secure-authjs.session-token",
  });

  // Admin routes require ADMIN role
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Checkout requires auth — send to register (new users) or login (existing)
  if (pathname === "/checkout") {
    if (!token) {
      const registerUrl = new URL("/register", request.url);
      registerUrl.searchParams.set("callbackUrl", "/checkout");
      return NextResponse.redirect(registerUrl);
    }
  }

  // Account and orders require auth — send to register
  if (pathname === "/account" || pathname.startsWith("/orders")) {
    if (!token) {
      const registerUrl = new URL("/register", request.url);
      registerUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(registerUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/checkout", "/account", "/orders/:path*", "/api/admin/:path*"],
};
