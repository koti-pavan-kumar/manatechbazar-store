import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: 5 verify attempts per IP per 10 minutes
  const ip = getClientIp(req);
  const rl = rateLimit(ip, {
    key: "verify-otp",
    maxRequests: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!rl.allowed) {
    return rateLimitResponse(rl);
  }

  try {
    const { phone, code, type = "REGISTER" } = await req.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Phone number and OTP code are required" },
        { status: 400 }
      );
    }

    // Normalize phone
    let normalizedPhone = phone.replace(/[\s\-]/g, "");
    if (normalizedPhone.startsWith("+91")) normalizedPhone = normalizedPhone.slice(3);
    if (normalizedPhone.startsWith("91") && normalizedPhone.length === 12) normalizedPhone = normalizedPhone.slice(2);

    const isValid = await verifyOTP(normalizedPhone, code, type);

    if (isValid) {
      return NextResponse.json({
        success: true,
        message: "Phone number verified successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid or expired OTP code" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
