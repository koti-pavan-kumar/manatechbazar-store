import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { title, description, mrp, price, stock, sku, isActive, isFeatured, isDealOfTheDay, freeShipping, deliveryCharge, codAvailable, categoryIds, tags, images, variants } = body;

    if (!title || !description || !mrp || !price || !categoryIds?.length || !images?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate types & ranges — never write unvalidated input to the DB
    if (typeof title !== "string" || title.trim().length < 1 || title.length > 200) {
      return NextResponse.json({ error: "Title must be 1-200 characters" }, { status: 400 });
    }
    if (typeof description !== "string" || description.length > 10000) {
      return NextResponse.json({ error: "Description is too long" }, { status: 400 });
    }
    const mrpNum = Number(mrp);
    const priceNum = Number(price);
    const stockNum = Number(stock);
    if (!Number.isFinite(mrpNum) || mrpNum < 1 || !Number.isFinite(priceNum) || priceNum < 1) {
      return NextResponse.json({ error: "Prices must be positive numbers" }, { status: 400 });
    }
    if (priceNum > mrpNum) {
      return NextResponse.json({ error: "Selling price cannot be higher than the market price" }, { status: 400 });
    }
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      return NextResponse.json({ error: "Stock must be a whole number" }, { status: 400 });
    }
    if (!Array.isArray(images) || !Array.isArray(categoryIds)) {
      return NextResponse.json({ error: "Invalid images or categories" }, { status: 400 });
    }
    const deliveryChargeNum = deliveryCharge == null || deliveryCharge === "" ? 49 : Number(deliveryCharge);
    if (!Number.isFinite(deliveryChargeNum) || deliveryChargeNum < 0 || deliveryChargeNum > 100000) {
      return NextResponse.json({ error: "Delivery charge must be between ₹0 and ₹100000" }, { status: 400 });
    }

    let slug = slugify(title);
    // Ensure unique slug
    const existing = await db.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    const product = await db.product.create({
      data: {
        title,
        slug,
        description,
        mrp: Math.round(mrp * 100), // convert to paise
        price: Math.round(price * 100),
        discountPercent,
        stock,
        sku: sku || null,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        isDealOfTheDay: isDealOfTheDay ?? false,
        freeShipping: freeShipping ?? false,
        deliveryCharge: Math.round(deliveryChargeNum * 100), // convert to paise
        codAvailable: codAvailable ?? true,
        images: JSON.stringify(images),
        tags: JSON.stringify(tags ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : []),
        categoryProducts: {
          create: categoryIds.map((categoryId: string) => ({ categoryId })),
        },
        variants: variants?.length ? {
          create: variants.map((v: any) => ({
            size: v.size || null,
            color: v.color || null,
            colorCode: v.colorCode || null,
            sku: v.sku || null,
            price: v.price ? Math.round(v.price * 100) : null,
            stock: v.stock || 0,
            image: v.image || null,
          })),
        } : undefined,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

    const body = await req.json();
    const { title, description, mrp, price, stock, sku, isActive, isFeatured, isDealOfTheDay, freeShipping, deliveryCharge, codAvailable, categoryIds, tags, images } = body;

    // Validate before writing — same rules as create
    if (typeof title !== "string" || title.trim().length < 1 || title.length > 200) {
      return NextResponse.json({ error: "Title must be 1-200 characters" }, { status: 400 });
    }
    const mrpNum = Number(mrp);
    const priceNum = Number(price);
    const stockNum = Number(stock);
    if (!Number.isFinite(mrpNum) || mrpNum < 1 || !Number.isFinite(priceNum) || priceNum < 1) {
      return NextResponse.json({ error: "Prices must be positive numbers" }, { status: 400 });
    }
    if (priceNum > mrpNum) {
      return NextResponse.json({ error: "Selling price cannot be higher than the market price" }, { status: 400 });
    }
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      return NextResponse.json({ error: "Stock must be a whole number" }, { status: 400 });
    }
    const deliveryChargeNum = deliveryCharge == null || deliveryCharge === "" ? 49 : Number(deliveryCharge);
    if (!Number.isFinite(deliveryChargeNum) || deliveryChargeNum < 0 || deliveryChargeNum > 100000) {
      return NextResponse.json({ error: "Delivery charge must be between ₹0 and ₹100000" }, { status: 400 });
    }

    const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    // Delete old category associations and recreate
    if (categoryIds) {
      await db.categoryProduct.deleteMany({ where: { productId: id } });
    }

    const product = await db.product.update({
      where: { id },
      data: {
        title,
        description,
        mrp: Math.round(mrp * 100),
        price: Math.round(price * 100),
        discountPercent,
        stock,
        sku: sku || null,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        isDealOfTheDay: isDealOfTheDay ?? false,
        freeShipping: freeShipping ?? false,
        deliveryCharge: Math.round(deliveryChargeNum * 100), // convert to paise
        codAvailable: codAvailable ?? true,
        images: JSON.stringify(images),
        tags: JSON.stringify(tags ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : []),
        ...(categoryIds && {
          categoryProducts: {
            create: categoryIds.map((categoryId: string) => ({ categoryId })),
          },
        }),
      },
    });

    return NextResponse.json({ product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

    // Products referenced by order history cannot be hard-deleted
    // (foreign key protection) — archive them instead so past orders
    // keep working while the product disappears from the storefront.
    const orderItemCount = await db.orderItem.count({ where: { productId: id } });

    if (orderItemCount > 0) {
      const archived = await db.product.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        archived: true,
        message: `This product has ${orderItemCount} order(s) attached, so it was hidden from the store instead of permanently deleted. Past orders still work.`,
        product: archived,
      });
    }

    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
  }
}
