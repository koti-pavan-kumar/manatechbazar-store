import type { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

/**
 * Login brute-force protection.
 * NextAuth's credentials POST (the actual login attempt) is rate limited
 * per IP: 15 attempts per 15 minutes. GETs (session polling, CSRF token)
 * are untouched so normal browsing is never blocked.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(ip, {
    key: "login",
    maxRequests: 15,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.allowed) {
    return rateLimitResponse(rl);
  }
  return handlers.POST(req);
}

export async function GET(req: NextRequest) {
  return handlers.GET(req);
}
