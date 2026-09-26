import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { computeShipping } from "@/lib/shipping";
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
      // Payment mode: "RAZORPAY" (default) or "COD"
      paymentMode: requestedPaymentMode,
    } = await req.json();

    const paymentMode = requestedPaymentMode === "COD" ? "COD" : "RAZORPAY";

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

    // Validate cart items: ids must be strings, quantities positive integers
    for (const item of cartItems) {
      if (!item || typeof item.id !== "string" || !item.id) {
        return NextResponse.json({ error: "Invalid cart item" }, { status: 400 });
      }
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 999) {
        return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
      }
      item.quantity = qty;
    }
    if (cartItems.length > 50) {
      return NextResponse.json({ error: "Cart too large" }, { status: 400 });
    }

    // Validate guest contact info
    const phoneDigits = String(guestPhone).replace(/[^0-9]/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 });
    }
    if (String(guestName).trim().length < 2 || String(guestName).length > 100) {
      return NextResponse.json({ error: "Please enter a valid name" }, { status: 400 });
    }
    if (!/^[0-9]{6}$/.test(String(addressFields.pincode))) {
      return NextResponse.json({ error: "Please enter a valid 6-digit pincode" }, { status: 400 });
    }

    // Fetch live products from DB — never trust client prices, titles, or existence
    const productIds = cartItems.map((item: any) => item.id);
    const liveProducts = await db.product.findMany({
      where: { id: { in: productIds } },
    });
    const liveById = new Map(liveProducts.map((p) => [p.id, p]));

    // Validate existence, active status and stock
    for (const item of cartItems) {
      const product = liveById.get(item.id);
      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `"${item.title || "An item"}" is no longer available and was removed from your cart` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `"${product.title}" is out of stock or has insufficient quantity` },
          { status: 400 }
        );
      }
    }

    // COD is allowed only when every product in the cart permits it
    if (paymentMode === "COD") {
      const codBlocked = liveProducts.find((p) => !p.codAvailable);
      if (codBlocked) {
        return NextResponse.json(
          { error: `Cash on Delivery is not available for "${codBlocked.title}". Please choose online payment.` },
          { status: 400 }
        );
      }
    }

    // Calculate totals server-side from DB prices
    let subtotal = 0;
    const processedItems = cartItems.map((item: any) => {
      const product = liveById.get(item.id)!;
      const price = product.price;
      const itemTotal = price * item.quantity;
      const itemDiscount = (product.mrp - price) * item.quantity;
      subtotal += itemTotal;
      const images = (() => {
        try { return JSON.parse(product.images || "[]"); } catch { return []; }
      })();
      return {
        productId: product.id,
        title: product.title,
        image: images[0] || item.image,
        mrp: product.mrp,
        priceAtPurchase: price,
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

    const shipping = computeShipping(
      subtotal,
      liveProducts.map((p) => ({ freeShipping: p.freeShipping, deliveryCharge: p.deliveryCharge }))
    );
    const total = Math.max(1, subtotal - couponDiscount + shipping);

    const orderNumber = generateOrderNumber();

    // ── COD: no gateway — place the order now and lock in stock ───────
    if (paymentMode === "COD") {
      try {
        const codOrder = await db.$transaction(async (tx) => {
          for (const item of processedItems) {
            const res = await tx.product.updateMany({
              where: { id: item.productId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            });
            if (res.count === 0) {
              throw new Error(`"${item.title}" just went out of stock — please update your cart and try again`);
            }
          }
          return tx.order.create({
            data: {
              orderNumber,
              status: "PLACED",
              paymentMode: "COD",
              paymentStatus: "PENDING",
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
        });

        return NextResponse.json({
          success: true,
          cod: true,
          internalOrderId: codOrder.id,
          orderNumber: codOrder.orderNumber,
          amount: total,
        });
      } catch (e: any) {
        if (typeof e?.message === "string" && e.message.includes("out of stock")) {
          return NextResponse.json({ error: e.message }, { status: 400 });
        }
        throw e;
      }
    }

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
