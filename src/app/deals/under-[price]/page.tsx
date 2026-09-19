import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DealsContent } from "./deals-content";

interface Props {
  params: Promise<{ price: string }>;
}

export default async function DealsPage(props: Props) {
  const { price } = await props.params;
  const maxPrice = parseInt(price);

  if (!maxPrice || ![199, 499, 999].includes(maxPrice)) {
    notFound();
  }

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
      priceKey={price}
    />
  );
}
