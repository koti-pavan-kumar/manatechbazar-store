import { db } from "@/lib/prisma";
import { DealsContent } from "./deals-content";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Deals Under ₹199 — Grab Before They're Gone",
  description: "Shop the best deals under ₹199 at Mana Tech Bazar. Limited stock, free delivery above ₹499.",
  path: "/deals",
});

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ max?: string }>;
}

export default async function DealsPage(props: Props) {
  const { max } = await props.searchParams;
  const maxPrice = parseInt(max || "199");
  const maxPricePaise = maxPrice * 100;

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: {
        isActive: true,
        price: { lte: maxPricePaise },
      },
      orderBy: { createdAt: "desc" },
      include: {
        categoryProducts: {
          include: { category: true },
        },
      },
    }),
    db.category.findMany({
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  // Only show categories that have products in this price range
  const categorySlugs = new Set<string>();
  products.forEach((p) => {
    p.categoryProducts.forEach((cp) => {
      if (cp.category) categorySlugs.add(cp.category.slug);
    });
  });
  const filteredCategories = categories.filter((c) => categorySlugs.has(c.slug));

  return (
    <DealsContent
      products={JSON.parse(JSON.stringify(products))}
      categories={JSON.parse(JSON.stringify(filteredCategories))}
      maxPrice={maxPrice}
      priceKey={String(maxPrice)}
    />
  );
}
