import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      count: users.length,
      users: users.map((u) => ({
        ...u,
        hasPassword: !!u.passwordHash,
        passwordHashPreview: u.passwordHash ? u.passwordHash.substring(0, 10) + "..." : null,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
