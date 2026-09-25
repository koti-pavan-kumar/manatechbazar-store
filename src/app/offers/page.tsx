import { db } from "@/lib/prisma";
import { OffersContent } from "./offers-content";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Offers & Deals — Save Big Today!",
  description: "Check out our latest offers, coupon codes, and flash sales.",
  path: "/offers",
});

async function getOffers() {
  const [coupons, deals] = await Promise.all([
    db.coupon.findMany({
      where: { isActive: true, expiry: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    }),
    db.product.findMany({
      where: { isActive: true, isDealOfTheDay: true },
      take: 8,
    }),
  ]);
  return { coupons, deals };
}

export default async function OffersPage() {
  const data = await getOffers();
  return <OffersContent data={data} />;
}
