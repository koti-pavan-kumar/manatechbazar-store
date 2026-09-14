import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: 10 coupon attempts per IP per 5 minutes
  const ip = getClientIp(req);
  const rl = rateLimit(ip, {
    key: "coupon",
    maxRequests: 10,
    windowMs: 5 * 60 * 1000,
  });
  if (!rl.allowed) {
    return rateLimitResponse(rl);
  }

  try {
    const { code, subtotal } = await req.json();

    if (!code || subtotal === undefined) {
      return NextResponse.json({ error: "Code and subtotal are required" }, { status: 400 });
    }

    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) {
      return NextResponse.json({ success: false, error: "Invalid coupon code" }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ success: false, error: "This coupon is no longer active" }, { status: 400 });
    }

    if (new Date(coupon.expiry) < new Date()) {
      return NextResponse.json({ success: false, error: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ success: false, error: "This coupon has reached its usage limit" }, { status: 400 });
    }

    if (subtotal < coupon.minOrder) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order value is ₹${(coupon.minOrder / 100).toLocaleString("en-IN")}`,
        },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.type === "FLAT") {
      discount = coupon.value;
    } else {
      discount = Math.min(
        Math.round((subtotal * coupon.value) / 100),
        coupon.maxDiscount || Infinity
      );
    }

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discount,
      type: coupon.type,
      value: coupon.value,
    });
  } catch (error) {
    console.error("Coupon apply error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
