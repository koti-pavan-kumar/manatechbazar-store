import { NextResponse } from "next/server";
import { verifyCode } from "@/lib/verification";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Rate limit by IP AND by email — a 6-digit code must never be
  // brute-forceable. 10 attempts per identifier per 10 minutes makes
  // guessing statistically impossible within the 10-minute code window.
  const ip = getClientIp(req);
  const byIp = rateLimit(ip, {
    key: "verify-email",
    maxRequests: 10,
    windowMs: 10 * 60 * 1000,
  });
  if (!byIp.allowed) {
    return rateLimitResponse(byIp);
  }

  try {
    const { email, code, type = "REGISTER" } = await req.json();

    if (!email || !code || typeof email !== "string" || typeof code !== "string") {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    const byEmail = rateLimit(`verify-email:${email}`, {
      key: "verify-code",
      maxRequests: 10,
      windowMs: 10 * 60 * 1000,
    });
    if (!byEmail.allowed) {
      return rateLimitResponse(byEmail);
    }

    const result = await verifyCode(email, code, type);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
