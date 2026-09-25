import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { safeJsonParse } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) return { title: "Category Not Found" };
  return pageMetadata({
    title: `${category.name} — Shop Now`,
    description: `Browse our collection of ${category.name} products. Best prices at Mana Tech Bazar.`,
    path: `/category/${category.slug}`,
    image: category.image || undefined,
    imageAlt: category.name,
  });
}

export default async function CategoryPage(props: Props) {
  const { slug } = await props.params;
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const products = await db.product.findMany({
    where: {
      isActive: true,
      categoryProducts: { some: { categoryId: category.id } },
    },
    orderBy: { createdAt: "desc" },
  });

  const categoryImage = category.image;

  return (
    <div>
      {/* ─── Category Hero Banner ──────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-purple-600/20 to-orange-500/20 animate-hero-gradient opacity-50" />

        {/* Category image background (blurred) */}
        {categoryImage && (
          <div className="absolute inset-0 opacity-20">
            <img src={categoryImage} alt="" className="w-full h-full object-cover blur-xl scale-110" />
          </div>
        )}

        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23ffffff' fill-opacity='1'%3e%3cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <Link href="/products" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            All Products
          </Link>

          <div className="flex items-center gap-6">
            {/* Category image thumbnail */}
            {categoryImage && (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl shrink-0">
                <img src={categoryImage} alt={category.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                {category.name}
              </h1>
              <p className="text-lg text-white/60 mt-2">
                {products.length} product{products.length !== 1 ? "s" : ""} available
              </p>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" fill="none" className="w-full">
            <path d="M0 50L60 42C120 34 240 18 360 12C480 6 600 10 720 15C840 20 960 26 1080 28C1200 30 1320 28 1380 27L1440 26V50H0Z" fill="var(--background)" />
          </svg>
        </div>
      </section>

      {/* ─── Products Grid ─────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {products.map((product, i) => (
              <div
                key={product.id}
                style={{ animationDelay: `${i * 60}ms` }}
                className="animate-slide-in-up"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">No products in this category yet</h2>
            <p className="text-muted-foreground mb-6">Check back soon — we add new products regularly!</p>
            <Link href="/products" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
