"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/stores/wishlist";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  const moveToCart = (item: typeof items[0]) => {
    addItem({
      id: item.id,
      title: item.title,
      slug: item.slug,
      price: item.price,
      mrp: item.mrp,
      image: item.image,
      stock: 999,
    });
    removeItem(item.id);
  };

  // ─── Empty Wishlist State ────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="relative inline-block mb-8">
          {/* Floating hearts */}
          <div className="absolute -top-8 -left-6 text-2xl animate-float opacity-30">❤️</div>
          <div className="absolute -top-4 -right-8 text-xl animate-float-delayed opacity-25">💕</div>
          <div className="absolute bottom-0 -left-10 text-lg animate-float opacity-20" style={{ animationDelay: "1s" }}>💗</div>

          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center border-2 border-pink-100">
            <Heart className="h-16 w-16 text-pink-300" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3">Your wishlist is empty</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">Save products you love to come back to them later. Tap the heart icon on any product to add it here!</p>
        <Link href="/products">
          <Button size="lg" className="h-14 px-8 text-base font-semibold rounded-2xl shadow-lg shadow-pink-500/20 hover:shadow-xl hover:shadow-pink-500/30 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
            <Sparkles className="h-5 w-5 mr-2" />
            Discover Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
          <Heart className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Wishlist</h1>
          <p className="text-sm text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""} saved</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {items.map((item, i) => (
          <div key={item.id} className="group animate-slide-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <Link href={`/products/${item.slug}`} className="block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted img-zoom">
                <Image
                  src={item.image || "/placeholder-product.jpg"}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </Link>
            <div className="mt-3 px-1">
              <Link href={`/products/${item.slug}`} className="text-sm font-semibold line-clamp-1 hover:text-primary transition-colors">
                {item.title}
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold text-sm">{formatPrice(item.price)}</span>
                {item.mrp > item.price && (
                  <span className="text-xs text-muted-foreground line-through">{formatPrice(item.mrp)}</span>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  className="flex-1 rounded-xl h-9 font-semibold text-xs"
                  onClick={() => moveToCart(item)}
                >
                  <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Move to Cart
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeItem(item.id)}
                  className="rounded-xl h-9 px-3 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
