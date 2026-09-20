import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { cashfree, CASHFREE_API_VERSION } from "@/lib/cashfree";

export async function POST(req: NextRequest) {
  try {
    const { orderId, cfOrderId } = await req.json();

    // Fetch order status from Cashfree
    const response = await (cashfree as any).PGFetchOrder(CASHFREE_API_VERSION, cfOrderId);
    const cfOrder = response.data;

    if (cfOrder.order_status === "PAID") {
      // Update internal order
      const order = await db.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          razorpayPaymentId: cfOrderId,
          status: "CONFIRMED",
        },
      });

      return NextResponse.json({ success: true, orderId: order.id, status: "PAID" });
    }

    return NextResponse.json({ success: true, status: cfOrder.order_status });
  } catch (error) {
    console.error("Cashfree verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
