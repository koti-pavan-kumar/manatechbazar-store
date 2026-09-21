import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Handle payment.captured (source of truth — backup for client-side verify)
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;

      const existingOrder = await db.order.findFirst({
        where: { razorpayOrderId },
        include: { items: true },
      });

      if (existingOrder && existingOrder.paymentStatus !== "PAID") {
        // Activate the order
        await db.order.update({
          where: { id: existingOrder.id },
          data: {
            paymentStatus: "PAID",
            razorpayPaymentId,
            status: "PLACED",
          },
        });

        // Decrement stock
        for (const item of existingOrder.items) {
          await db.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }
    }

    // Handle payment.failed
    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const existingOrder = await db.order.findFirst({
        where: { razorpayOrderId: payment.order_id },
      });

      if (existingOrder) {
        await db.order.update({
          where: { id: existingOrder.id },
          data: { paymentStatus: "FAILED", status: "PAYMENT_FAILED" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
