import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-webhook-signature") || "";
    const timestamp = req.headers.get("x-webhook-timestamp") || "";

    // Verify webhook signature
    const rawBody = timestamp + body;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.CASHFREE_SECRET_KEY || "")
      .update(rawBody)
      .digest("base64");

    if (expectedSignature !== signature) {
      console.error("Cashfree webhook signature mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Handle PAID event (payment captured successfully)
    if (event.type === "PAYMENT_SUCCESS" || event.type === "payment.captured") {
      const cfOrderId = event.data?.order?.order_id || event.data?.order_id;

      if (cfOrderId) {
        // Find order by cfOrderId (idempotent)
        const existingOrder = await db.order.findFirst({
          where: { razorpayOrderId: cfOrderId },
        });

        if (existingOrder && existingOrder.paymentStatus !== "PAID") {
          await db.order.update({
            where: { id: existingOrder.id },
            data: {
              paymentStatus: "PAID",
              razorpayPaymentId: event.data?.payment?.cf_payment_id || cfOrderId,
              status: "CONFIRMED",
            },
          });
        }
      }
    }

    // Handle FAILED event
    if (event.type === "PAYMENT_FAILED" || event.type === "payment.failed") {
      const cfOrderId = event.data?.order?.order_id || event.data?.order_id;

      if (cfOrderId) {
        const existingOrder = await db.order.findFirst({
          where: { razorpayOrderId: cfOrderId },
        });

        if (existingOrder) {
          await db.order.update({
            where: { id: existingOrder.id },
            data: { paymentStatus: "FAILED" },
          });

          // Restore stock
          const orderItems = await db.orderItem.findMany({
            where: { orderId: existingOrder.id },
          });
          for (const item of orderItems) {
            await db.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Cashfree webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
