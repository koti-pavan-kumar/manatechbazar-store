import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    // Verify webhook signature — refuse to process if the secret is not
    // configured (an empty secret would make the check meaningless).
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured — rejecting webhook");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    // Constant-time comparison to prevent timing attacks
    const a = Buffer.from(expectedSignature, "utf8");
    const b = Buffer.from(signature, "utf8");
    if (a.length !== b.length || a.length === 0 || !crypto.timingSafeEqual(a, b)) {
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
        // Activate the order atomically — updateMany with a status guard
        // ensures verify + webhook can never double-decrement stock.
        const activated = await db.order.updateMany({
          where: { id: existingOrder.id, paymentStatus: { not: "PAID" } },
          data: {
            paymentStatus: "PAID",
            razorpayPaymentId,
            status: "PLACED",
          },
        });

        // Decrement stock only if WE won the race (first confirmation)
        if (activated.count > 0) {
          for (const item of existingOrder.items) {
            await db.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
          }
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
