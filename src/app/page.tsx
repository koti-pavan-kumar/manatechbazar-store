import { db } from "@/lib/prisma";
import { safeJsonParse, formatPrice, calcDiscount } from "@/lib/utils";
import { HomeContent } from "@/components/home-content";
import { StoreLayout } from "@/components/layout/store-layout";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Mana Tech Bazar — Your Favourite Store | Shop the Best Deals",
  description:
    "Discover amazing products at the best prices. Shop gadgets, kitchen, jewellery, toys & more. Free delivery above ₹499.",
  path: "/",
});

async function getHomeData() {
  const [featuredProducts, newProducts, dealProducts, categories, settings, allProducts] =
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
      }),
      db.storeSetting.findUnique({ where: { id: "singleton" } }),
      db.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 40,
      }),
    ]);

  return { featuredProducts, newProducts, dealProducts, categories, settings, allProducts };
}

export default async function HomePage() {
  const data = await getHomeData();
  return <StoreLayout><HomeContent data={data} /></StoreLayout>;
}
