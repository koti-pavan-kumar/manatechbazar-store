import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmation } from "@/lib/email";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 5 checkouts per user per 15 minutes
  const userId = (session.user as any).id;
  const rl = rateLimit(userId, {
    key: "checkout",
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.allowed) {
    return rateLimitResponse(rl);
  }

  try {
    const { addressId, paymentMode, couponCode, items: cartItems } = await req.json();
    const userId = (session.user as any).id;

    // Fetch cart items from database if not provided
    let orderItems = cartItems;
    if (!orderItems || orderItems.length === 0) {
      const dbCartItems = await db.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });
      orderItems = dbCartItems.map((ci) => ({
        id: ci.product.id,
        title: ci.product.title,
        slug: ci.product.slug,
        price: ci.product.price,
        mrp: ci.product.mrp,
        image: typeof ci.product.images === "string" ? JSON.parse(ci.product.images)[0] : ci.product.images[0],
        quantity: ci.quantity,
        stock: ci.product.stock,
      }));
    }

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Validate address
    const address = await db.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== userId) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    // Calculate totals server-side (never trust client)
    let subtotal = 0;
    const processedItems = orderItems.map((item: any) => {
      const itemTotal = item.price * item.quantity;
      const itemDiscount = (item.mrp - item.price) * item.quantity;
      subtotal += itemTotal;
      return {
        productId: item.id,
        title: item.title,
        image: item.image,
        mrp: item.mrp,
        priceAtPurchase: item.price,
        discountAtPurchase: itemDiscount,
        quantity: item.quantity,
        total: itemTotal,
      };
    });

    // Apply coupon discount server-side
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive && new Date(coupon.expiry) > new Date()) {
        if (subtotal >= coupon.minOrder) {
          if (coupon.type === "FLAT") {
            couponDiscount = coupon.value;
          } else {
            couponDiscount = Math.min(
              (subtotal * coupon.value) / 100,
              coupon.maxDiscount || Infinity
            );
          }
          // Increment usage count
          await db.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }

    const shipping = subtotal >= 49900 ? 0 : 4900; // ₹499 threshold, ₹49 shipping
    const total = Math.max(1, subtotal - couponDiscount + shipping); // Min ₹1

    // Check stock
    for (const item of orderItems) {
      const product = await db.product.findUnique({ where: { id: item.id } });
      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          { error: `"${item.title}" is out of stock or has insufficient quantity` },
          { status: 400 }
        );
      }
    }

    const orderNumber = generateOrderNumber();

    if (paymentMode === "RAZORPAY") {
      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: total, // amount in paise
        currency: "INR",
        receipt: orderNumber,
      });

      // Create internal order in PENDING state
      const order = await db.order.create({
        data: {
          userId,
          addressId,
          orderNumber,
          status: "PLACED",
          paymentMode: "RAZORPAY",
          paymentStatus: "PENDING",
          razorpayOrderId: razorpayOrder.id,
          subtotal,
          discount: couponDiscount,
          shippingCharges: shipping,
          total,
          couponCode: couponCode || null,
          items: {
            create: processedItems,
          },
        },
      });

      // Decrease stock optimistically
      for (const item of orderItems) {
        await db.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear cart
      await db.cartItem.deleteMany({ where: { userId } });

      return NextResponse.json({
        success: true,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        razorpayOrderId: razorpayOrder.id,
        internalOrderId: order.id,
        amount: total,
      });
    }

    // COD — create order directly
    const order = await db.order.create({
      data: {
        userId,
        addressId,
        orderNumber,
        status: "PLACED",
        paymentMode: "COD",
        paymentStatus: "PENDING",
        subtotal,
        discount: couponDiscount,
        shippingCharges: shipping,
        total,
        couponCode: couponCode || null,
        items: {
          create: processedItems,
        },
      },
    });

    // Decrease stock
    for (const item of orderItems) {
      await db.product.update({
        where: { id: item.id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Clear cart
    await db.cartItem.deleteMany({ where: { userId } });

    // Send order confirmation email
    const user = await db.user.findUnique({ where: { id: userId } });
    sendOrderConfirmation({
      orderNumber,
      customerName: user?.name || "",
      customerEmail: user?.email || "",
      items: processedItems.map((i: any) => ({ title: i.title, quantity: i.quantity, total: i.total })),
      subtotal,
      discount: couponDiscount,
      shipping,
      total,
      paymentMode: "COD",
      address: `${address.line1}, ${address.city}, ${address.state} - ${address.pincode}`,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
