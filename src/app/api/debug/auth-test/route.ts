import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const admin = await db.user.findUnique({
      where: { email: "admin@manatechbazar.in" },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const passwordValid = await bcrypt.compare("admin123", admin.passwordHash || "");
    
    return NextResponse.json({
      email: admin.email,
      role: admin.role,
      hasPassword: !!admin.passwordHash,
      passwordValid,
      hashAlgorithm: admin.passwordHash?.substring(0, 7),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
