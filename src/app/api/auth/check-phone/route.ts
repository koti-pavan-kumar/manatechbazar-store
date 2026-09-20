import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ exists: false });
    }

    // Normalize phone
    let normalizedPhone = phone.replace(/[\s\-]/g, "");
    if (normalizedPhone.startsWith("+91")) normalizedPhone = normalizedPhone.slice(3);
    if (normalizedPhone.startsWith("91") && normalizedPhone.length === 12) normalizedPhone = normalizedPhone.slice(2);

    const existing = await db.user.findUnique({
      where: { phone: normalizedPhone },
      select: { id: true },
    });

    return NextResponse.json({ exists: !!existing });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
