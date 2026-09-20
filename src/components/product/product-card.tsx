"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Eye, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, calcDiscount, safeJsonParse } from "@/lib/utils";
import { useCartStore } from "@/stores/cart";
import { useWishlistStore } from "@/stores/wishlist";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCallback, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    mrp: number;
    price: number;
    discountPercent: number;
    images: string;
    stock: number;
    isActive: boolean;
    freeShipping?: boolean;
  };
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const images = safeJsonParse(product.images, []);
  const imageUrl = images[0] || "/placeholder-product.jpg";
  const discount = product.discountPercent || calcDiscount(product.mrp, product.price);

  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));

  // 3D tilt effect
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    // Disable tilt on mobile to prevent horizontal overflow
    if (window.innerWidth < 640) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  }, []);

  const [buyingNow, setBuyingNow] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBuyingNow(true);
    addItem({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      mrp: product.mrp,
      image: imageUrl,
      stock: product.stock,
      freeShipping: product.freeShipping,
    });
    router.push("/checkout");
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingToCart(true);
    addItem({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      mrp: product.mrp,
      image: imageUrl,
      stock: product.stock,
      freeShipping: product.freeShipping,
    });
    setTimeout(() => setAddingToCart(false), 600);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      mrp: product.mrp,
      image: imageUrl,
    });
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block overflow-hidden">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted transition-transform duration-300 ease-out"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Product Image with zoom */}
        <div className="w-full h-full img-zoom">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            unoptimized
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Discount badge */}
        {discount > 0 && (
          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-lg shadow-red-500/20 text-xs font-bold px-2.5 py-1">
            {discount}% OFF
          </Badge>
        )}

        {/* Free Shipping badge */}
        {product.freeShipping && (
          <Badge className="absolute top-3 right-12 bg-green-500 text-white border-0 shadow-lg text-[10px] font-bold px-2 py-0.5">
            🚚 FREE
          </Badge>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md hover:scale-110 active:scale-95"
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-all duration-200",
              isInWishlist ? "fill-red-500 text-red-500 scale-110" : "text-gray-600"
            )}
          />
        </button>

        {/* Quick actions (appear on hover) */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          {product.stock > 0 ? (
            <>
              <Button
                size="sm"
                onClick={handleBuyNow}
                disabled={buyingNow}
                className="h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg font-semibold text-xs px-3"
              >
                {buyingNow ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Zap className="h-4 w-4 mr-1" />}
                {buyingNow ? "Loading..." : "Buy Now"}
              </Button>
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="h-10 rounded-xl bg-white text-gray-900 hover:bg-white/90 shadow-lg font-semibold text-xs px-3"
              >
                {addingToCart ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ShoppingCart className="h-4 w-4 mr-1" />}
                {addingToCart ? "Added!" : "Cart"}
              </Button>
            </>
          ) : (
            <Badge variant="secondary" className="flex-1 h-10 rounded-xl bg-white/90 flex items-center justify-center shadow-lg text-xs">
              Out of Stock
            </Badge>
          )}
          <div
            className="h-10 w-10 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-lg transition-colors shrink-0"
          >
            <Eye className="h-4 w-4 text-gray-700" />
          </div>
        </div>
      </div>

      {/* Product info */}
      <div className="mt-3 space-y-1.5 px-1">
        <h3 className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors leading-tight">
          {product.title}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-bold text-foreground">{formatPrice(product.price)}</span>
          {discount > 0 && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.mrp)}
            </span>
          )}
          {discount > 0 && (
            <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">
              {discount}% off
            </span>
          )}
        </div>
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-xs text-orange-600 font-medium">Only {product.stock} left!</p>
        )}
      </div>
    </Link>
  );
}
