import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { isEmailVerified } from "@/lib/verification";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: 5 registrations per IP per hour
  const ip = getClientIp(req);
  const rl = rateLimit(ip, {
    key: "register",
    maxRequests: 5,
    windowMs: 60 * 60 * 1000,
  });

  if (!rl.allowed) {
    return rateLimitResponse(rl);
  }

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Check if email is verified before creating account
    const verified = await isEmailVerified(email, "REGISTER");
    if (!verified) {
      return NextResponse.json(
        { error: "Please verify your email before creating an account" },
        { status: 400 }
      );
    }

    // Check existing user
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password with strong cost factor
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: { name, email, passwordHash, role: "CUSTOMER" },
    });

    return NextResponse.json(
      { success: true, message: "Account created successfully" },
      {
        status: 201,
        headers: {
          "X-RateLimit-Remaining": String(rl.remaining),
        },
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
