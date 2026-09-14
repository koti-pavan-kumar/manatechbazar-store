import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const coupon = await db.coupon.create({
      data: {
        code: body.code.toUpperCase().trim(),
        type: body.type,
        value: body.type === "FLAT" ? body.value * 100 : body.value, // flat in paise
        minOrder: (body.minOrder || 0) * 100, // convert to paise
        maxDiscount: body.maxDiscount ? body.maxDiscount * 100 : null,
        expiry: new Date(body.expiry),
        usageLimit: body.usageLimit || null,
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { id, ...data } = body;
    const coupon = await db.coupon.update({
      where: { id },
      data: {
        code: data.code?.toUpperCase().trim(),
        type: data.type,
        value: data.type === "FLAT" ? data.value * 100 : data.value,
        minOrder: (data.minOrder || 0) * 100,
        maxDiscount: data.maxDiscount ? data.maxDiscount * 100 : null,
        expiry: data.expiry ? new Date(data.expiry) : undefined,
        usageLimit: data.usageLimit || null,
        isActive: data.isActive,
      },
    });
    return NextResponse.json({ coupon });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  await db.coupon.delete({ where: { id: id! } });
  return NextResponse.json({ success: true });
}
