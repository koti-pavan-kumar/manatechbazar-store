"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useTransition } from "react";
import { Search, SlidersHorizontal, X, ChevronDown, Sparkles, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/product/product-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Props {
  data: {
    products: any[];
    categories: any[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
  searchParams: Record<string, string | undefined>;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "discount", label: "Biggest Discount" },
];

export function ProductsContent({ data, searchParams }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.search || "");
  const [showFilters, setShowFilters] = useState(false);

  const updateParam = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams as Record<string, string>);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`/products?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams, startTransition]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("search", search || undefined);
  };

  const clearFilters = () => {
    setSearch("");
    startTransition(() => {
      router.push("/products");
    });
  };

  const hasActiveFilters = searchParams.category || searchParams.sort || searchParams.search || searchParams.minPrice || searchParams.maxPrice;

  return (
    <div>
      {/* ─── Hero Banner ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-purple-600/20 to-orange-500/20 animate-hero-gradient opacity-50" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23ffffff' fill-opacity='1'%3e%3cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }} />
        <div className="absolute top-10 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-10 left-20 w-32 h-32 bg-orange-500/10 rounded-full blur-[60px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:py-16 text-center">
          <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 mr-1 inline" />
            {data.pagination.total} Products Available
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Discover <span className="gradient-text">Amazing Products</span>
          </h1>
          <p className="text-lg text-white/70 max-w-lg mx-auto mb-8">
            Browse our curated collection. Filter by category, sort by price, and find exactly what you need.
          </p>

          {/* Search Bar — glassmorphism */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 rounded-2xl opacity-30 group-hover:opacity-50 blur transition-opacity" />
              <div className="relative flex items-center bg-white rounded-2xl">
                <Search className="absolute left-4 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search for gadgets, jewellery, toys..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 pr-4 h-14 rounded-2xl border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 focus-visible:ring-0"
                />
                <Button type="submit" className="absolute right-2 h-10 rounded-xl px-6">
                  Search
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 27.5C1200 25 1320 20 1380 17.5L1440 15V60H0Z" fill="var(--background)" />
          </svg>
        </div>
      </section>

      {/* ─── Content ───────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0 rounded-full"
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" /> Filters
            </Button>

            {/* Category Pills */}
            {data.categories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() =>
                  updateParam(
                    "category",
                    searchParams.category === cat.slug ? undefined : cat.slug
                  )
                }
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all duration-200 min-h-[40px] hover:scale-105 active:scale-95",
                  searchParams.category === cat.slug
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-background hover:bg-muted border-border hover:border-primary/30"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={searchParams.sort || "newest"}
              onChange={(e) => updateParam("sort", e.target.value === "newest" ? undefined : e.target.value)}
              className="appearance-none h-10 pl-3 pr-8 rounded-xl border-2 bg-background text-sm font-medium cursor-pointer hover:border-primary/30 transition-colors"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mb-6 p-5 border-2 rounded-2xl bg-muted/30 animate-slide-up">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Min Price (₹)</label>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  defaultValue={searchParams.minPrice || ""}
                  onBlur={(e) => updateParam("minPrice", e.target.value || undefined)}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Max Price (₹)</label>
                <Input
                  type="number"
                  placeholder="10000"
                  min="0"
                  defaultValue={searchParams.maxPrice || ""}
                  onBlur={(e) => updateParam("maxPrice", e.target.value || undefined)}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-sm text-muted-foreground font-medium">Active filters:</span>
            {searchParams.search && (
              <Badge variant="secondary" className="gap-1 rounded-full px-3 py-1">
                &quot;{searchParams.search}&quot;
                <button onClick={() => { setSearch(""); updateParam("search", undefined); }}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {searchParams.category && (
              <Badge variant="secondary" className="gap-1 rounded-full px-3 py-1">
                {data.categories.find((c: any) => c.slug === searchParams.category)?.name || searchParams.category}
                <button onClick={() => updateParam("category", undefined)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <button onClick={clearFilters} className="text-xs text-primary hover:underline font-semibold ml-1">
              Clear all
            </button>
          </div>
        )}

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-6 font-medium">
          Showing {data.pagination.total} product{data.pagination.total !== 1 ? "s" : ""}
        </p>

        {/* Product Grid */}
        {data.products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {data.products.map((product: any, i: number) => (
              <div
                key={product.id}
                style={{ animationDelay: `${i * 50}ms` }}
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
            <h2 className="text-xl font-bold mb-2">No products found</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Try adjusting your filters or search terms to find what you&apos;re looking for.</p>
            <Button onClick={clearFilters} className="rounded-xl px-8">
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {Array.from({ length: data.pagination.totalPages }).map((_, i) => {
              const page = i + 1;
              const params = new URLSearchParams(searchParams as Record<string, string>);
              params.set("page", String(page));
              return (
                <Link
                  key={page}
                  href={`/products?${params.toString()}`}
                  className={cn(
                    "h-11 w-11 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-200 hover:scale-110",
                    page === data.pagination.page
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "hover:bg-muted border"
                  )}
                >
                  {page}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
