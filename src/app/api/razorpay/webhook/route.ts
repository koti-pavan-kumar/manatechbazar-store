import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { sendOrderConfirmation } from "@/lib/email";
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

    // Handle payment.captured (source of truth)
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;

      // Find order by razorpayOrderId (idempotent)
      const existingOrder = await db.order.findFirst({
        where: { razorpayOrderId },
        include: { items: true, address: true, user: true },
      });

      if (existingOrder && existingOrder.paymentStatus !== "PAID") {
        // Idempotent: only update if not already marked as paid
        // 1. Update order status
        await db.order.update({
          where: { id: existingOrder.id },
          data: {
            paymentStatus: "PAID",
            razorpayPaymentId,
            status: "PLACED",
          },
        });

        // 2. Decrement stock
        for (const item of existingOrder.items) {
          await db.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        // 3. Clear cart
        await db.cartItem.deleteMany({ where: { userId: existingOrder.userId } });

        // 4. Send confirmation email
        if (existingOrder.user?.email) {
          sendOrderConfirmation({
            orderNumber: existingOrder.orderNumber,
            customerName: existingOrder.user.name || "",
            customerEmail: existingOrder.user.email,
            items: existingOrder.items.map((i) => ({ title: i.title, quantity: i.quantity, total: i.total })),
            subtotal: existingOrder.subtotal,
            discount: existingOrder.discount,
            shipping: existingOrder.shippingCharges,
            total: existingOrder.total,
            paymentMode: "RAZORPAY",
            address: existingOrder.address ? `${existingOrder.address.line1}, ${existingOrder.address.city}, ${existingOrder.address.state} - ${existingOrder.address.pincode}` : "",
          });
        }
      }
    }

    // Handle payment.failed — mark order as failed, no stock to restore (stock was never decremented)
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
