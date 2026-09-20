import { NextRequest, NextResponse } from "next/server";
import { sendOTP } from "@/lib/otp";
import { db } from "@/lib/prisma";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: 3 OTP requests per IP per 10 minutes
  const ip = getClientIp(req);
  const rl = rateLimit(ip, {
    key: "send-otp",
    maxRequests: 3,
    windowMs: 10 * 60 * 1000,
  });

  if (!rl.allowed) {
    return rateLimitResponse(rl);
  }

  try {
    const { phone, type = "REGISTER" } = await req.json();

    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit phone number" },
        { status: 400 }
      );
    }

    // Normalize phone
    let normalizedPhone = phone.replace(/[\s\-]/g, "");
    if (normalizedPhone.startsWith("+91")) normalizedPhone = normalizedPhone.slice(3);
    if (normalizedPhone.startsWith("91") && normalizedPhone.length === 12) normalizedPhone = normalizedPhone.slice(2);

    // Check if phone already registered (for registration type)
    if (type === "REGISTER") {
      const existing = await db.user.findUnique({ where: { phone: normalizedPhone } });
      if (existing) {
        return NextResponse.json(
          { error: "An account with this phone number already exists" },
          { status: 409 }
        );
      }
    }

    const result = await sendOTP(normalizedPhone, type);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "OTP sent successfully",
        // In dev mode, return OTP for testing
        ...(result.otp && { otp: result.otp }),
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to send OTP" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
