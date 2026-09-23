import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: prevents using this endpoint to enumerate registered
  // phone numbers or hammer the database.
  const ip = getClientIp(req);
  const rl = rateLimit(ip, {
    key: "check-phone",
    maxRequests: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (!rl.allowed) {
    return rateLimitResponse(rl);
  }

  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ exists: false });
    }

    // Normalize phone
    let normalizedPhone = phone.replace(/[\s\-]/g, "");
    if (normalizedPhone.startsWith("+91")) normalizedPhone = normalizedPhone.slice(3);
    if (normalizedPhone.startsWith("91") && normalizedPhone.length === 12)
      normalizedPhone = normalizedPhone.slice(2);

    const existing = await db.user.findUnique({
      where: { phone: normalizedPhone },
      select: { id: true },
    });

    return NextResponse.json({ exists: !!existing });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
