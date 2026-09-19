export const dynamic = "force-dynamic";

import { db } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add New Product</h1>
      <ProductForm categories={categories} mode="create" />
    </div>
  );
}
