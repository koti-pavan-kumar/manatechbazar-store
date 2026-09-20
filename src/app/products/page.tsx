import { db } from "@/lib/prisma";
import { ProductsContent } from "./products-content";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse our complete collection of products. Filter by category, price, and more.",
};

interface SearchParams {
  category?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  page?: string;
}

async function getProducts(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  if (searchParams.category) {
    where.categoryProducts = {
      some: { category: { slug: searchParams.category } },
    };
  }

  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search } },
      { description: { contains: searchParams.search } },
      { tags: { contains: searchParams.search } },
    ];
  }

  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {};
    if (searchParams.minPrice) where.price.gte = parseInt(searchParams.minPrice) * 100;
    if (searchParams.maxPrice) where.price.lte = parseInt(searchParams.maxPrice) * 100;
  }

  let orderBy: any = { createdAt: "desc" };
  switch (searchParams.sort) {
    case "price-low": orderBy = { price: "asc" }; break;
    case "price-high": orderBy = { price: "desc" }; break;
    case "popular": orderBy = { orderItems: { _count: "desc" } }; break;
    case "discount": orderBy = { discountPercent: "desc" }; break;
    case "newest":
    default: orderBy = { createdAt: "desc" };
  }

  const [products, total, categories] = await Promise.all([
    db.product.findMany({ where, orderBy, skip, take: limit }),
    db.product.count({ where }),
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return {
    products,
    categories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export default async function ProductsPage(props: { searchParams: Promise<Record<string, string | undefined>> }) {
  const rawParams = await props.searchParams;
  const searchParams: SearchParams = {
    category: rawParams.category,
    sort: rawParams.sort,
    minPrice: rawParams.minPrice,
    maxPrice: rawParams.maxPrice,
    search: rawParams.search,
    page: rawParams.page,
  };
  const data = await getProducts(searchParams);
  return <ProductsContent data={data} searchParams={searchParams as Record<string, string | undefined>} />;
}
