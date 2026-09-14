import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const settings = await db.storeSetting.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const settings = await db.storeSetting.upsert({
      where: { id: "singleton" },
      update: {
        storeName: body.storeName,
        storeDescription: body.storeDescription,
        announcementText: body.announcementText,
        announcementActive: body.announcementActive,
        whatsappNumber: body.whatsappNumber,
        instagramHandle: body.instagramHandle,
        freeShippingThreshold: body.freeShippingThreshold,
        email: body.email,
        phone: body.phone,
      },
      create: {
        id: "singleton",
        ...body,
      },
    });

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
