import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { safeJsonParse } from "@/lib/utils";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

/**
 * POST /api/products/validate
 * Body: { ids: string[] }
 *
 * Returns fresh catalog data for the IDs that still exist and are active.
 * IDs missing from the response have been deleted (or hidden) by the admin
 * and must be pruned from the client's cart / wishlist.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(ip, {
    key: "validate-products",
    maxRequests: 60,
    windowMs: 60 * 1000,
  });
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ products: {} });
    }

    // Cap to prevent abuse
    const uniqueIds = [...new Set(ids.filter((id) => typeof id === "string"))].slice(0, 100);
    if (uniqueIds.length === 0) {
      return NextResponse.json({ products: {} });
    }

    const products = await db.product.findMany({
      where: { id: { in: uniqueIds }, isActive: true },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        mrp: true,
        stock: true,
        images: true,
        freeShipping: true,
      },
    });

    const map: Record<
      string,
      {
        id: string;
        title: string;
        slug: string;
        price: number;
        mrp: number;
        stock: number;
        image: string;
        freeShipping: boolean;
      }
    > = {};

    for (const p of products) {
      const images = safeJsonParse(p.images);
      map[p.id] = {
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: p.price,
        mrp: p.mrp,
        stock: p.stock,
        image: images[0] || "",
        freeShipping: p.freeShipping,
      };
    }

    return NextResponse.json({ products: map });
  } catch (error) {
    console.error("Product validate error:", error);
    // Never break the page — client keeps its snapshot on failure
    return NextResponse.json({ products: {}, error: "validate failed" }, { status: 200 });
  }
}
