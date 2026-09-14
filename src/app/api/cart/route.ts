import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ items: [] });
  }

  const items = await db.cartItem.findMany({
    where: { userId: (session.user as any).id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId, variantId, quantity } = await req.json();

    const existing = await db.cartItem.findFirst({
      where: {
        userId: (session.user as any).id,
        productId,
        variantId: variantId || null,
      },
    });

    if (existing) {
      await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + (quantity || 1) },
      });
    } else {
      await db.cartItem.create({
        data: {
          userId: (session.user as any).id,
          productId,
          variantId: variantId || null,
          quantity: quantity || 1,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (productId) {
    await db.cartItem.deleteMany({
      where: {
        userId: (session.user as any).id,
        productId,
      },
    });
  } else {
    await db.cartItem.deleteMany({
      where: { userId: (session.user as any).id },
    });
  }

  return NextResponse.json({ success: true });
}
