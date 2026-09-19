"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, X, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/product-card";

const priceLabels: Record<string, { label: string; emoji: string; gradient: string }> = {
  "199": { label: "Under ₹199", emoji: "🏷️", gradient: "from-pink-500 to-rose-500" },
  "499": { label: "Under ₹499", emoji: "🔥", gradient: "from-orange-500 to-amber-500" },
  "999": { label: "Under ₹999", emoji: "⚡", gradient: "from-violet-500 to-purple-500" },
};

interface Props {
  products: any[];
  categories: any[];
  maxPrice: number;
  priceKey: string;
}

export function DealsContent({ products, categories, maxPrice, priceKey }: Props) {
  const info = priceLabels[priceKey] || priceLabels["199"];
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  let filtered = products.filter((p) => {
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || p.categoryProducts?.some((cp: any) => cp.category?.slug === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  if (sortBy === "price-low") filtered.sort((a: any, b: any) => a.price - b.price);
  else if (sortBy === "price-high") filtered.sort((a: any, b: any) => b.price - a.price);
  else if (sortBy === "discount") filtered.sort((a: any, b: any) => (b.discountPercent || 0) - (a.discountPercent || 0));

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className={`bg-gradient-to-r ${info.gradient} text-white`}>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{info.emoji}</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold">{info.label}</h1>
          </div>
          <p className="text-white/80 text-lg">All products priced at ₹{maxPrice} or less — deals you don&apos;t want to miss!</p>
          <Badge className="mt-3 bg-white/20 text-white border-0 px-4 py-1.5">{filtered.length} products found</Badge>
        </div>
      </section>

      {/* Filters */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-12 rounded-xl" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-12 px-4 rounded-xl border bg-background text-sm font-medium min-w-[160px]">
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="discount">Biggest Discount</option>
          </select>
        </div>

        {/* Category Filters */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => setSelectedCategory("")} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedCategory ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted hover:bg-muted/80"}`}>
              All
            </button>
            {categories.map((cat: any) => (
              <button key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.slug ? "" : cat.slug)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.slug ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted hover:bg-muted/80"}`}>
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-30" />
            <p className="text-lg font-bold mb-1">No products found</p>
            <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filtered.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
