import { db } from "@/lib/prisma";
import { formatPrice, safeJsonParse } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Package } from "lucide-react";
import Image from "next/image";
import { DeleteProductButton } from "./delete-button";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { categoryProducts: { include: { category: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} product{products.length !== 1 ? "s" : ""} total</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30">
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </Link>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((product: any) => {
              const images = safeJsonParse(product.images, []);
              return (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {images[0] && (
                          <Image src={images[0]} alt="" fill className="object-cover" sizes="48px" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{product.title}</p>
                        <p className="text-xs text-gray-500">
                          {product.categoryProducts.map((cp: any) => cp.category.name).join(", ")}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-sm text-gray-900">{formatPrice(product.price)}</p>
                    {product.discountPercent > 0 && (
                      <p className="text-xs text-gray-400 line-through">{formatPrice(product.mrp)}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge variant={product.stock === 0 ? "destructive" : product.stock < 5 ? "warning" : "secondary"} className="rounded-lg">
                      {product.stock}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant={product.isActive ? "success" : "secondary"} className="rounded-lg">
                      {product.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button variant="outline" size="sm" className="rounded-lg">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <DeleteProductButton productId={product.id} productTitle={product.title} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {products.map((product: any, i: number) => {
          const images = safeJsonParse(product.images, []);
          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-slide-in-up"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex gap-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {images[0] && <Image src={images[0]} alt="" fill className="object-cover" sizes="64px" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{product.title}</p>
                  <p className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={product.isActive ? "success" : "secondary"} className="text-[10px] rounded-md">
                      {product.isActive ? "Active" : "Hidden"}
                    </Badge>
                    <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <Button variant="outline" size="sm" className="rounded-lg"><Edit className="h-3.5 w-3.5" /></Button>
                  </Link>
                  <DeleteProductButton productId={product.id} productTitle={product.title} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-bold text-gray-900 mb-1">No products yet</p>
          <p className="text-gray-500 text-sm mb-4">Add your first product to get started!</p>
          <Link href="/admin/products/new"><Button className="rounded-xl px-6">Add Your First Product</Button></Link>
        </div>
      )}
    </div>
  );
}
