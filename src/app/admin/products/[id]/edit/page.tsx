export const dynamic = "force-dynamic";

import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage(props: Props) {
  const { id } = await props.params;
  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id }, include: { categoryProducts: true } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Product</h1>
      <ProductForm product={product} categories={categories} mode="edit" />
    </div>
  );
}
