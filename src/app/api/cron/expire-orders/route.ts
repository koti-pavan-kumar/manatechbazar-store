import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

// Cron endpoint to expire unpaid orders and restore stock.
//
// Call every 5 minutes via Vercel Cron or external service like cron-job.org
// URL: GET https://yourapp.com/api/cron/expire-orders?secret=YOUR_SECRET
//
// Orders older than 15 minutes with PENDING payment status are:
// 1. Marked as CANCELLED
// 2. Product stock is restored
// 3. Razorpay order expires naturally

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    // Find all unpaid orders older than 15 minutes
    const expiredOrders = await db.order.findMany({
      where: {
        paymentStatus: "PENDING",
        paymentMode: "RAZORPAY",
        createdAt: { lt: fifteenMinutesAgo },
      },
      include: { items: true },
    });

    if (expiredOrders.length === 0) {
      return NextResponse.json({ message: "No expired orders found", expired: 0 });
    }

    let restoredCount = 0;

    for (const order of expiredOrders) {
      // Restore stock for each item
      for (const item of order.items) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Mark order as cancelled
      await db.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
          paymentStatus: "FAILED",
          cancelReason: "Payment not completed within 15 minutes",
        },
      });

      restoredCount++;
    }

    console.log(`Cron: Expired ${restoredCount} unpaid orders, restored stock`);

    return NextResponse.json({
      message: `Expired ${restoredCount} unpaid orders`,
      expired: restoredCount,
    });
  } catch (error: any) {
    console.error("Cron expire-orders error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
