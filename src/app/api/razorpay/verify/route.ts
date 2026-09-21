import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { sendOrderConfirmation } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } =
      await req.json();

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Fetch the pending order
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true, address: true, user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only process if order is still pending (idempotent)
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ success: true, orderId: order.id });
    }

    // Payment verified! Now activate the order:
    // 1. Update order status to CONFIRMED
    await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "PLACED",
      },
    });

    // 2. Decrement stock for each item
    for (const item of order.items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // 3. Clear the user's cart
    await db.cartItem.deleteMany({ where: { userId: order.userId } });

    // 4. Send order confirmation email
    if (order.user?.email) {
      sendOrderConfirmation({
        orderNumber: order.orderNumber,
        customerName: order.user.name || "",
        customerEmail: order.user.email,
        items: order.items.map((i) => ({ title: i.title, quantity: i.quantity, total: i.total })),
        subtotal: order.subtotal,
        discount: order.discount,
        shipping: order.shippingCharges,
        total: order.total,
        paymentMode: "RAZORPAY",
        address: order.address ? `${order.address.line1}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}` : "",
      });
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
