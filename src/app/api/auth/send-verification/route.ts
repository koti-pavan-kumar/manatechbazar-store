import { NextResponse } from "next/server";
import { sendVerificationCode } from "@/lib/verification";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Rate limit: 5 requests per IP per 10 minutes
  const ip = getClientIp(req as any);
  const rl = rateLimit(ip, {
    key: "send-verification",
    maxRequests: 10,
    windowMs: 10 * 60 * 1000,
  });

  if (!rl.allowed) {
    return rateLimitResponse(rl);
  }

  try {
    const { email, type = "REGISTER" } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const result = await sendVerificationCode(email, type);

    return NextResponse.json(result, {
      status: result.success ? 200 : 429,
    });
  } catch (error) {
    console.error("Send verification error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
