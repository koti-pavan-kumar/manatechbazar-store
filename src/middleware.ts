import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Use next-auth's getToken which can decrypt JWE tokens
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
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

  // Checkout requires auth
  if (pathname === "/checkout") {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", "/checkout");
      return NextResponse.redirect(loginUrl);
    }
  }

  // Account and orders require auth
  if (pathname === "/account" || pathname.startsWith("/orders")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/checkout", "/account", "/orders/:path*", "/api/admin/:path*"],
};
