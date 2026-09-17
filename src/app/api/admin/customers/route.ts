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
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build search filter
    const where: any = { role: "CUSTOMER" };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await db.user.count({ where });

    // Get customers with order stats
    const customers = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    // Compute stats for each customer
    const customersWithStats = customers.map((c) => {
      const totalSpent = c.orders.reduce((sum, o) => sum + o.total, 0);
      const totalOrders = c.orders.length;
      const lastOrder = c.orders[0]?.createdAt || null;
      const deliveredOrders = c.orders.filter((o) => o.status === "DELIVERED").length;

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        image: c.image,
        joinedAt: c.createdAt,
        totalOrders,
        totalSpent,
        deliveredOrders,
        lastOrderDate: lastOrder,
      };
    });

    return NextResponse.json({
      customers: customersWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
