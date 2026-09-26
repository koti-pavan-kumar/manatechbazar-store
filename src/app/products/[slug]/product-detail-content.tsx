"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Heart, ShoppingCart, Star, Truck, Shield, ChevronLeft,
  Minus, Plus, Share2, ChevronRight, Pencil, Trash2, Eye, EyeOff, Loader2, Zap, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/product-card";
import { formatPrice, calcDiscount, safeJsonParse } from "@/lib/utils";
import { useCartStore } from "@/stores/cart";
import { useWishlistStore } from "@/stores/wishlist";
import { cn } from "@/lib/utils";
import { showToast } from "@/components/cart-toast";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useImageRatio } from "@/lib/use-image-ratio";

interface Props {
  product: any;
  related: any[];
}

export function ProductDetailContent({ product, related }: Props) {
  const images = safeJsonParse(product.images, []);
  const [selectedImage, setSelectedImage] = useState(0);
  // Gallery adopts the current image's uploaded ratio (never crops it)
  const galleryRatio = useImageRatio(images[selectedImage]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  // Auto-scroll gallery: advance every 3 seconds (timer resets on manual selection)
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setTimeout(() => {
      setSelectedImage((i) => (i + 1) % images.length);
    }, 3000);
    return () => clearTimeout(timer);
  }, [selectedImage, images.length]);

  const prevImage = () => setSelectedImage((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setSelectedImage((i) => (i + 1) % images.length);
  const { data: session } = useSession();
  const router = useRouter();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  // Admin quick-edit state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [newPrice, setNewPrice] = useState(String(product.price / 100));
  const [newMrp, setNewMrp] = useState(String(product.mrp / 100));
  const [newStock, setNewStock] = useState(String(product.stock));
  const [priceLoading, setPriceLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  const discount = product.discountPercent || calcDiscount(product.mrp, product.price);
  const currentPrice = selectedVariant?.price || product.price;
  const currentStock = selectedVariant?.stock ?? product.stock;
  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
    : 0;

  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));

  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = useCallback(() => {
    addItem({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: currentPrice,
      mrp: product.mrp,
      image: images[0] || "",
      stock: currentStock,
      freeShipping: product.freeShipping,
      deliveryCharge: product.deliveryCharge,
      codAvailable: product.codAvailable,
      variantId: selectedVariant?.id,
      variantLabel: selectedVariant
        ? [selectedVariant.size, selectedVariant.color].filter(Boolean).join(" / ")
        : undefined,
    }, quantity);
    setAddedToCart(true);
    showToast(`${product.title} added to cart!`);
    setTimeout(() => setAddedToCart(false), 2000);
  }, [addItem, product, currentPrice, currentStock, selectedVariant, quantity]);

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const handleWishlist = () => {
    toggleWishlist({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      mrp: product.mrp,
      image: images[0] || "",
    });
  };


  // Admin handlers
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/products?id=${product.id}`, { method: "DELETE" });
      if (res.ok) router.push("/admin/products");
    } finally { setDeleteLoading(false); }
  };

  const handleQuickEdit = async () => {
    setPriceLoading(true);
    try {
      const res = await fetch(`/api/admin/products?id=${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: product.title,
          description: product.description,
          mrp: Number(newMrp),
          price: Number(newPrice),
          stock: Number(newStock),
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          isDealOfTheDay: product.isDealOfTheDay,
          categoryIds: product.categoryProducts.map((cp: any) => cp.categoryId),
          tags: typeof product.tags === "string" ? JSON.parse(product.tags).join(", ") : product.tags.join(", "),
          images: typeof product.images === "string" ? JSON.parse(product.images) : product.images,
        }),
      });
      if (res.ok) {
        setPriceDialogOpen(false);
        router.refresh();
      }
    } finally { setPriceLoading(false); }
  };

  const handleToggleActive = async () => {
    setToggleLoading(true);
    try {
      await fetch(`/api/admin/products?id=${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: product.title,
          description: product.description,
          mrp: product.mrp / 100,
          price: product.price / 100,
          stock: product.stock,
          isActive: !product.isActive,
          isFeatured: product.isFeatured,
          isDealOfTheDay: product.isDealOfTheDay,
          categoryIds: product.categoryProducts.map((cp: any) => cp.categoryId),
          tags: typeof product.tags === "string" ? JSON.parse(product.tags).join(", ") : product.tags.join(", "),
          images: typeof product.images === "string" ? JSON.parse(product.images) : product.images,
        }),
      });
      router.refresh();
    } finally { setToggleLoading(false); }
  };

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 pb-36 lg:pb-8 w-full overflow-hidden">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 overflow-x-auto no-scrollbar">
        <Link href="/" className="hover:text-foreground shrink-0">Home</Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <Link href="/products" className="hover:text-foreground shrink-0">Shop</Link>
        {product.categoryProducts[0] && (
          <>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <Link href={`/category/${product.categoryProducts[0].category.slug}`} className="hover:text-foreground shrink-0">
              {product.categoryProducts[0].category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-2 gap-6 lg:gap-10">
        {/* Image Gallery */}
        <div className="space-y-3 min-w-0">
          {/* Main Image — auto-scrolling gallery */}
          <div
            className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted group transition-[aspect-ratio] duration-500"
            style={galleryRatio ? { aspectRatio: galleryRatio } : undefined}
          >
            {images[selectedImage] ? (
              <Image
                key={selectedImage}
                src={images[selectedImage]}
                alt={`${product.title} — image ${selectedImage + 1} of ${images.length}`}
                fill
                className="object-cover gallery-fade"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
            {discount > 0 && (
              <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0 text-sm z-10">
                {discount}% OFF
              </Badge>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur-sm z-10">
                {selectedImage + 1} / {images.length}
              </div>
            )}

            {/* Prev / Next arrows (appear on hover on desktop, always on mobile touch) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 md:opacity-0 hover:bg-black/70 transition-all z-10 max-md:opacity-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 md:opacity-0 hover:bg-black/70 transition-all z-10 max-md:opacity-100"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Dot indicators + progress bar */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex flex-col items-center gap-1.5 z-10">
                <div className="flex gap-1.5">
                  {images.map((_: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      aria-label={`Go to image ${i + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        selectedImage === i ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
                {/* 3s countdown progress bar */}
                <div className="w-24 h-0.5 rounded-full bg-white/30 overflow-hidden">
                  <div
                    key={`progress-${selectedImage}`}
                    className="h-full bg-white rounded-full gallery-progress"
                  />
                </div>
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-colors",
                    selectedImage === i ? "border-primary" : "border-transparent hover:border-muted-foreground/30"
                  )}
                >
                  <Image src={img} alt="" width={80} height={80} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-5 min-w-0">
          {/* Title & Rating */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{product.title}</h1>
            {product.reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={cn("h-4 w-4", s <= avgRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
                  ))}
                </div>
                <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({product.reviews.length} reviews)</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl font-bold">{formatPrice(currentPrice)}</span>
            {discount > 0 && (
              <>
                <span className="text-sm text-muted-foreground">Market price</span>
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.mrp)}</span>
                <Badge className="bg-green-100 text-green-800 border-0">{discount}% OFF</Badge>
              </>
            )}
          </div>
          {discount > 0 && (
            <p className="text-xs text-muted-foreground">
              Market price is the prevailing online / retail price for this item, shown for comparison. You pay {formatPrice(currentPrice)}.
            </p>
          )}

          {/* Stock */}
          {currentStock > 0 ? (
            <p className="text-sm text-green-600 font-medium">
              ✓ In Stock {currentStock < 10 && `— Only ${currentStock} left!`}
            </p>
          ) : (
            <p className="text-sm text-red-600 font-medium">✗ Out of Stock</p>
          )}

          <Separator />

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="space-y-4">
              {/* Group by unique sizes */}
              {product.variants.some((v: any) => v.size) && (
                <div>
                  <p className="text-sm font-medium mb-2">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(product.variants.filter((v: any) => v.size).map((v: any) => v.size))].map((size: any) => {
                      const variant = product.variants.find((v: any) => v.size === size);
                      const inStock = variant && variant.stock > 0;
                      return (
                        <button
                          key={size}
                          onClick={() => inStock && setSelectedVariant(variant)}
                          disabled={!inStock}
                          className={cn(
                            "min-h-[44px] min-w-[44px] px-4 rounded-lg border text-sm font-medium transition-colors",
                            selectedVariant?.size === size
                              ? "border-primary bg-primary text-primary-foreground"
                              : inStock
                                ? "border-border hover:border-primary"
                                : "border-border opacity-50 cursor-not-allowed line-through"
                          )}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group by unique colors */}
              {product.variants.some((v: any) => v.color) && (
                <div>
                  <p className="text-sm font-medium mb-2">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(product.variants.filter((v: any) => v.color).map((v: any) => v.color))].map((color: any) => {
                      const variant = product.variants.find((v: any) => v.color === color);
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedVariant(variant)}
                          className={cn(
                            "min-h-[44px] px-4 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2",
                            selectedVariant?.color === color
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary"
                          )}
                        >
                          {variant?.colorCode && (
                            <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: variant.colorCode }} />
                          )}
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-sm font-medium mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-11 w-11 flex items-center justify-center"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="h-11 w-11 flex items-center justify-center"
                  disabled={quantity >= currentStock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {currentStock > 0 && currentStock < 10 && (
                <span className="text-xs text-orange-600">Hurry! Only {currentStock} left</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 w-full overflow-hidden">
            {currentStock > 0 ? (
              <>
                {/* Main row: Buy Now + Add to Cart side by side */}
                <div className="flex gap-2 w-full">
                  <Button size="lg" className="flex-1 min-w-0 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] border border-[#FCD200] shadow-sm hover:shadow-md font-bold text-sm sm:text-base" onClick={handleBuyNow}>
                    Buy Now
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    className={cn(
                      "flex-1 min-w-0 transition-all duration-300 text-sm sm:text-base",
                      addedToCart
                        ? "bg-green-500 text-white hover:bg-green-600 border-green-500"
                        : ""
                    )}
                  >
                    {addedToCart ? (
                      <><Check className="h-4 w-4 mr-1 sm:mr-2" /> Added!</>
                    ) : (
                      <><ShoppingCart className="h-4 w-4 mr-1 sm:mr-2" /> Add to Cart</>
                    )}
                  </Button>
                </div>
                {/* Wishlist row */}
                <Button size="lg" variant="outline" onClick={handleWishlist} className="w-full h-12">
                  <Heart className={cn("h-5 w-5 mr-2", isInWishlist && "fill-red-500 text-red-500")} />
                  {isInWishlist ? "Saved to Wishlist" : "Add to Wishlist"}
                </Button>
              </>
            ) : (
              <Button size="lg" className="w-full" disabled>
                Out of Stock
              </Button>
            )}
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <>
              <Separator />
              <div className="p-4 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 space-y-3">
                <p className="text-sm font-bold text-blue-700 flex items-center gap-1">
                  🔧 Admin Controls
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <Button size="sm" variant="outline">
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Full Edit
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => setPriceDialogOpen(true)}>
                    💰 Quick Edit Price/Stock
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleToggleActive}
                    disabled={toggleLoading}
                  >
                    {toggleLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : product.isActive ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                    {product.isActive ? "Hide from Store" : "Show on Store"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                </div>
                <p className="text-xs text-blue-600">
                  ID: {product.id} • SKU: {product.sku || "—"} • Created: {new Date(product.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            </>
          )}

          {/* Description */}
          <div className="w-full overflow-hidden">
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line break-words">
              {product.description}
            </p>
          </div>

          {/* Delivery badge — free vs charged */}
          {product.freeShipping ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <Truck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs font-bold text-green-700 dark:text-green-400">🚚 FREE Delivery on this product!</p>
                <p className="text-[10px] text-green-600 dark:text-green-500">No shipping charges</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs font-bold">🚚 Delivery {formatPrice(product.deliveryCharge ?? 4900)}</p>
                <p className="text-[10px] text-muted-foreground">FREE on orders above ₹499</p>
              </div>
            </div>
          )}

          {/* Trust Signals */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
            <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg bg-muted/50 min-w-0 overflow-hidden">
              <Truck className="h-5 w-5 text-green-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{product.freeShipping ? "Free Delivery" : "Delivery"}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {product.freeShipping ? "Included" : `${formatPrice(product.deliveryCharge ?? 4900)} · Free ₹499+`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg bg-muted/50 min-w-0 overflow-hidden">
              <Shield className="h-5 w-5 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">Secure Payment</p>
                <p className="text-[10px] text-muted-foreground truncate">UPI & Cards</p>
              </div>
            </div>
          </div>

          {/* Reviews */}
          {product.reviews.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Customer Reviews ({product.reviews.length})</h3>
              <div className="space-y-3">
                {product.reviews.slice(0, 5).map((review: any) => (
                  <div key={review.id} className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{review.user?.name || "Store Customer"}</span>
                      {review.isVerified && (
                        <Badge variant="success" className="text-[10px] py-0">Verified Purchase</Badge>
                      )}
                    </div>
                    <div className="flex gap-0.5 mb-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={cn("h-3 w-3", s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete &quot;{product.title}&quot;? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Price Edit Dialog */}
      <Dialog open={priceDialogOpen} onOpenChange={setPriceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Edit Price & Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>                  <Label>Market price (₹)</Label>
              <Input type="number" value={newMrp} onChange={(e) => setNewMrp(e.target.value)} />
            </div>
            <div>
              <Label>Selling Price (₹)</Label>
              <Input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
            </div>
            <div>
              <Label>Stock</Label>
              <Input type="number" value={newStock} onChange={(e) => setNewStock(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPriceDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleQuickEdit} disabled={priceLoading}>
              {priceLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Mobile Buy Now + Add to Cart */}
      {currentStock > 0 && (
        <div className="fixed bottom-[64px] left-0 right-0 border-t bg-background/95 backdrop-blur p-2.5 lg:hidden z-40 w-full max-w-full">
          <div className="flex items-center gap-2 w-full max-w-full px-1">
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-xs text-muted-foreground truncate">{product.title}</p>
              <p className="font-bold text-sm">{formatPrice(currentPrice)}</p>
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className={cn(
                "px-2 h-9 rounded-lg font-semibold text-[11px] shrink-0 transition-all duration-300",
                addedToCart
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : ""
              )}
            >
              {addedToCart ? <><Check className="h-3.5 w-3.5" /> </> : <><ShoppingCart className="h-3.5 w-3.5" /> Cart</>}
            </Button>
            <Button size="sm" onClick={handleBuyNow} className="px-3 h-9 rounded-lg font-bold text-[11px] bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] border border-[#FCD200] shrink-0">
              Buy Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
