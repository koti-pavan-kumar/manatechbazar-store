import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentMode: true,
      paymentStatus: true,
      subtotal: true,
      discount: true,
      shippingCharges: true,
      total: true,
      couponCode: true,
      createdAt: true,
      shippedAt: true,
      deliveredAt: true,
      guestName: true,
      guestPhone: true,
      guestEmail: true,
      user: { select: { name: true, email: true, phone: true } },
      items: true,
      address: true,
    },
  });

  return NextResponse.json({ orders });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { orderId, status } = await req.json();

    const updateData: any = { status };

    if (status === "SHIPPED") {
      updateData.shippedAt = new Date();
    } else if (status === "DELIVERED") {
      updateData.deliveredAt = new Date();
      updateData.paymentStatus = "PAID"; // Mark as paid on delivery for COD
    }

    const order = await db.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
