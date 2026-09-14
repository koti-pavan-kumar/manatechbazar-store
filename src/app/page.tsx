import { db } from "@/lib/prisma";
import { safeJsonParse, formatPrice, calcDiscount } from "@/lib/utils";
import { HomeContent } from "@/components/home-content";
import { StoreLayout } from "@/components/layout/store-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mohan — Your Favourite Store | Shop the Best Deals",
  description:
    "Discover amazing products at the best prices. Shop fashion, accessories, electronics and more. Free delivery above ₹499.",
  openGraph: {
    title: "Mohan — Your Favourite Store",
    description: "Discover amazing products at the best prices. Shop now!",
    type: "website",
  },
};

async function getHomeData() {
  const [featuredProducts, newProducts, dealProducts, categories, settings] =
    await Promise.all([
      db.product.findMany({
        where: { isActive: true, isFeatured: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      db.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      db.product.findMany({
        where: { isActive: true, isDealOfTheDay: true },
        take: 4,
      }),
      db.category.findMany({
        orderBy: { sortOrder: "asc" },
        take: 8,
      }),
      db.storeSetting.findUnique({ where: { id: "singleton" } }),
    ]);

  return { featuredProducts, newProducts, dealProducts, categories, settings };
}

export default async function HomePage() {
  const data = await getHomeData();
  return <StoreLayout><HomeContent data={data} /></StoreLayout>;
}
