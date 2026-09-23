import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import crypto from "crypto";

/** Constant-time comparison — prevents timing attacks on signature checks. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a || "", "utf8");
  const bb = Buffer.from(b || "", "utf8");
  if (ab.length !== bb.length || ab.length === 0) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } =
      await req.json();

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error("RAZORPAY_KEY_SECRET is not configured");
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
    }

    // Verify signature (HMAC over order_id|payment_id)
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (!safeEqual(expectedSignature, razorpay_signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Fetch the pending order
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // The signature only proves THIS razorpay order was paid — make sure it
    // belongs to the internal order the client is trying to confirm.
    if (order.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json({ error: "Order mismatch" }, { status: 400 });
    }

    // Only process if order is still pending (idempotent)
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ success: true, orderId: order.id });
    }

    // Payment verified! Activate the order atomically:
    // updateMany + status guard prevents double stock decrement if the
    // webhook fires at the same moment.
    const updated = await db.order.updateMany({
      where: { id: orderId, paymentStatus: { not: "PAID" } },
      data: {
        paymentStatus: "PAID",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "PLACED",
      },
    });

    if (updated.count > 0) {
      // Decrement stock for each item (only on first confirmation)
      for (const item of order.items) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
