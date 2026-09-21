import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Fetch all orders (both registered and guest)
    const where: any = {};
    if (search) {
      where.OR = [
        { guestName: { contains: search, mode: "insensitive" } },
        { guestPhone: { contains: search } },
        { guestEmail: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { phone: { contains: search } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { orderNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const total = await db.order.count({ where });

    const orders = await db.order.findMany({
      where,
      select: {
        id: true,
        orderNumber: true,
        guestName: true,
        guestPhone: true,
        guestEmail: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        address: {
          select: {
            name: true,
            phone: true,
            line1: true,
            city: true,
            state: true,
            pincode: true,
          },
        },
        user: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Build customer list from orders
    const customerMap = new Map<string, any>();

    for (const order of orders) {
      const name = order.guestName || order.user?.name || order.address?.name || "Unknown";
      const phone = order.guestPhone || order.user?.phone || order.address?.phone || "N/A";
      const email = order.guestEmail || order.user?.email || "N/A";
      const key = phone !== "N/A" ? phone : name;

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          name,
          phone,
          email,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: order.createdAt,
          orders: [],
        });
      }

      const customer = customerMap.get(key);
      customer.totalOrders++;
      customer.totalSpent += order.total;
      if (new Date(order.createdAt) > new Date(customer.lastOrderDate)) {
        customer.lastOrderDate = order.createdAt;
      }
      customer.orders.push({
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
      });
    }

    const customers = Array.from(customerMap.values())
      .sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime())
      .slice(skip, skip + limit);

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total: customerMap.size,
        totalPages: Math.ceil(customerMap.size / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
