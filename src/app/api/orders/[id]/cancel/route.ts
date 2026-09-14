import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Cancel an order.
 *
 * - Only the order owner can cancel
 * - Only PLACED or CONFIRMED orders can be cancelled
 * - Stock is restored for all items
 * - If paid via Razorpay, a refund is initiated
 * - SHIPPED or DELIVERED orders cannot be cancelled
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = (session.user as any).id;

  try {
    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only the order owner can cancel
    if (order.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only PLACED or CONFIRMED orders can be cancelled
    if (!["PLACED", "CONFIRMED"].includes(order.status)) {
      return NextResponse.json(
        { error: `Cannot cancel order with status "${order.status}". Only placed or confirmed orders can be cancelled.` },
        { status: 400 }
      );
    }

    // Parse cancel reason from body
    const body = await req.json().catch(() => ({}));
    const cancelReason = body.reason || "Cancelled by customer";

    // Restore stock for all items
    for (const item of order.items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    // If paid via Razorpay, initiate refund
    let refundId = null;
    if (order.paymentMode === "RAZORPAY" && order.paymentStatus === "PAID" && order.razorpayPaymentId) {
      try {
        const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
          amount: order.total, // Full refund in paise
          notes: {
            reason: cancelReason,
            orderId: order.id,
          },
        });
        refundId = refund.id;
        console.log(`💰 Refund initiated: ${refundId} for order ${order.orderNumber}`);
      } catch (refundError: any) {
        console.error("Refund failed:", refundError);
        // Still cancel the order, but note the refund failure
        // Admin can manually process refund later
      }
    }

    // Update order status
    const updatedOrder = await db.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelReason: cancelReason,
        paymentStatus: refundId ? "REFUNDED" : order.paymentStatus,
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      refund: refundId ? { id: refundId, status: "initiated" } : null,
      message: refundId
        ? "Order cancelled and refund initiated. Refund will be credited in 5-7 business days."
        : "Order cancelled successfully.",
    });
  } catch (error: any) {
    console.error("Cancel order error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
