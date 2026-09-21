import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import Razorpay from "razorpay";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: NextRequest) {
  // Rate limit: 5 checkouts per IP per 15 minutes
  const ip = getClientIp(req);
  const rl = rateLimit(ip, {
    key: "checkout",
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.allowed) {
    return rateLimitResponse(rl);
  }

  try {
    const {
      // Billing info (guest)
      guestName,
      guestPhone,
      guestEmail,
      // Address fields
      address: addressFields,
      // Cart items from client
      items: cartItems,
      couponCode,
    } = await req.json();

    // Validate required fields
    if (!guestName || !guestPhone) {
      return NextResponse.json({ error: "Name and phone number are required" }, { status: 400 });
    }
    if (!addressFields?.line1 || !addressFields?.city || !addressFields?.state || !addressFields?.pincode) {
      return NextResponse.json({ error: "Complete address is required" }, { status: 400 });
    }
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Create a standalone address (no userId needed)
    const address = await db.address.create({
      data: {
        name: guestName,
        phone: guestPhone,
        line1: addressFields.line1,
        line2: addressFields.line2 || null,
        city: addressFields.city,
        state: addressFields.state,
        pincode: addressFields.pincode,
        country: "IN",
        isDefault: false,
      },
    });

    // Calculate totals server-side (never trust client)
    let subtotal = 0;
    const processedItems = cartItems.map((item: any) => {
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
          await db.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }

    // Check if any item has free shipping
    const hasFreeShipping = cartItems.some((item: any) => item.freeShipping);
    const shipping = hasFreeShipping || subtotal >= 49900 ? 0 : 4900;
    const total = Math.max(1, subtotal - couponDiscount + shipping);

    // Check stock
    for (const item of cartItems) {
      const product = await db.product.findUnique({ where: { id: item.id } });
      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          { error: `"${item.title}" is out of stock or has insufficient quantity` },
          { status: 400 }
        );
      }
    }

    const orderNumber = generateOrderNumber();

    // Create Razorpay order ONLY — no internal order yet
    const razorpayOrder = await razorpay.orders.create({
      amount: total,
      currency: "INR",
      receipt: orderNumber,
    });

    // Store pending order (PAYMENT_PENDING — hidden from customer)
    const pendingOrder = await db.order.create({
      data: {
        orderNumber,
        status: "PAYMENT_PENDING",
        paymentMode: "RAZORPAY",
        paymentStatus: "PENDING",
        razorpayOrderId: razorpayOrder.id,
        addressId: address.id,
        subtotal,
        discount: couponDiscount,
        shippingCharges: shipping,
        total,
        couponCode: couponCode || null,
        // Guest info
        guestName,
        guestPhone,
        guestEmail: guestEmail || null,
        items: {
          create: processedItems,
        },
      },
    });

    return NextResponse.json({
      success: true,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      internalOrderId: pendingOrder.id,
      amount: total,
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
