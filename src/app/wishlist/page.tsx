"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2, Sparkles, ArrowRight, Package, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/stores/wishlist";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";

function RevealSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}
      style={{ transitionDelay: `${delay}ms`, transitionDuration: "0.8s" }}
    >
      {children}
    </div>
  );
}

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const [removingId, setRemovingId] = useState<string | null>(null);

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
    setRemovingId(item.id);
    setTimeout(() => {
      removeItem(item.id);
      setRemovingId(null);
    }, 400);
  };

  const handleRemove = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      removeItem(id);
      setRemovingId(null);
    }, 400);
  };

  // ─── Empty Wishlist State ────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 text-8xl animate-float">💕</div>
            <div className="absolute bottom-10 right-10 text-7xl animate-float-delayed">✨</div>
            <div className="absolute top-1/2 left-1/3 text-6xl animate-float" style={{ animationDelay: "2s" }}>💗</div>
          </div>
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-sm font-medium animate-bounce-in">
              <Heart className="h-4 w-4" /> Your Collection
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 animate-slide-in-up">
              Your Wishlist is <span className="text-yellow-300">Empty</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-lg mx-auto mb-8 animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
              Save products you love by tapping the heart icon. They&apos;ll be waiting right here for you!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-up" style={{ animationDelay: "0.2s" }}>
              <Link href="/products">
                <Button size="lg" className="h-14 px-8 text-base font-bold rounded-2xl bg-white text-pink-600 hover:bg-white/90 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Explore Products
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/offers">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold rounded-2xl border-white/40 text-white hover:bg-white/10 transition-all duration-300">
                  🔥 View Offers
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: "❤️", title: "Tap the Heart", desc: "Click the heart icon on any product to save it" },
              { icon: "🛒", title: "Move to Cart", desc: "Ready to buy? Move items to cart in one tap" },
              { icon: "🔔", title: "Never Miss Out", desc: "Come back anytime — your picks are saved here" },
            ].map((tip, i) => (
              <RevealSection key={i} delay={i * 150}>
                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border border-pink-100 dark:border-pink-900/30 hover:shadow-lg transition-shadow duration-300">
                  <span className="text-4xl mb-3 block">{tip.icon}</span>
                  <h3 className="font-bold text-lg mb-2">{tip.title}</h3>
                  <p className="text-muted-foreground text-sm">{tip.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Wishlist with items ────────────────────────────────
  const totalSaved = items.reduce((sum, item) => sum + (item.mrp - item.price), 0);

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 right-16 text-7xl animate-float">💖</div>
          <div className="absolute bottom-8 left-16 text-6xl animate-float-delayed">✨</div>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 text-sm font-medium animate-bounce-in">
                <Heart className="h-4 w-4 fill-current" /> My Collection
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold animate-slide-in-up">
                My Wishlist
              </h1>
              <p className="text-white/80 mt-1 animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
                {items.length} item{items.length !== 1 ? "s" : ""} saved with ❤️
              </p>
            </div>
            <div className="flex items-center gap-4 animate-slide-in-left">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 text-center">
                <p className="text-xs text-white/70 uppercase tracking-wider font-medium">You Save</p>
                <p className="text-2xl font-extrabold text-yellow-300">{formatPrice(totalSaved)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wishlist Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item, i) => (
            <RevealSection key={item.id} delay={i * 80}>
              <div
                className={`group relative transition-all duration-500 ${
                  removingId === item.id ? "opacity-0 scale-90 translate-y-4" : "opacity-100"
                }`}
              >
                {/* Product Image */}
                <Link href={`/products/${item.slug}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]">
                    <Image
                      src={item.image || "/placeholder-product.jpg"}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Discount badge */}
                    {item.mrp > item.price && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                        {Math.round(((item.mrp - item.price) / item.mrp) * 100)}% OFF
                      </div>
                    )}
                    {/* Quick view button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-5 py-2.5 flex items-center gap-2 text-sm font-semibold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <Eye className="h-4 w-4" /> Quick View
                      </div>
                    </div>
                    {/* Floating hearts decoration */}
                    <div className="absolute -top-1 -right-1 text-lg opacity-0 group-hover:opacity-100 transition-opacity animate-bounce-in">💕</div>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="mt-3 px-1">
                  <Link href={`/products/${item.slug}`} className="block">
                    <h3 className="text-sm font-bold line-clamp-1 group-hover:text-pink-600 transition-colors duration-300">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="font-extrabold text-base text-foreground">{formatPrice(item.price)}</span>
                    {item.mrp > item.price && (
                      <span className="text-xs text-muted-foreground line-through">{formatPrice(item.mrp)}</span>
                    )}
                  </div>
                  {/* Savings line */}
                  {item.mrp > item.price && (
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      🎉 You save {formatPrice(item.mrp - item.price)}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="flex-1 rounded-xl h-10 font-semibold text-xs bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-md shadow-pink-500/20 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-300"
                      onClick={() => moveToCart(item)}
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Move to Cart
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemove(item.id)}
                      className="rounded-xl h-10 px-3 border-rose-200 dark:border-rose-800 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 transition-all duration-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>

        {/* Bottom CTA */}
        <RevealSection delay={200}>
          <div className="mt-12 mb-8 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-3xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border border-pink-100 dark:border-pink-900/30">
              <div>
                <p className="font-bold text-lg">Ready to shop?</p>
                <p className="text-sm text-muted-foreground">Move your favourites to cart and check out with UPI or COD</p>
              </div>
              <Link href="/cart">
                <Button className="h-11 px-6 rounded-xl font-semibold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/20">
                  <ShoppingCart className="h-4 w-4 mr-2" /> Go to Cart
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </RevealSection>
      </div>
    </div>
  );
}
