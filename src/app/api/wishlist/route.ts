import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId } = await req.json();

    const existing = await db.wishlistItem.findFirst({
      where: {
        userId: (session.user as any).id,
        productId,
      },
    });

    if (existing) {
      await db.wishlistItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ removed: true });
    } else {
      await db.wishlistItem.create({
        data: {
          userId: (session.user as any).id,
          productId,
        },
      });
      return NextResponse.json({ added: true });
    }
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
