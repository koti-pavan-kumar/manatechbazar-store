"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, Tag, ArrowRight, ShoppingBag, Truck, Shield, Sparkles, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { STORE } from "@/lib/constants";

export default function CartPage() {
  const { items, removeItem, updateQuantity, couponCode, discount, applyCoupon, removeCoupon, getSubtotal } = useCartStore();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getSubtotal();
  const hasFreeShippingItem = items.some((item) => item.freeShipping);
  const shipping = hasFreeShippingItem || subtotal >= STORE.minOrderForFreeShipping * 100 ? 0 : 4900;
  const total = Math.max(0, subtotal - discount + shipping);
  const freeShippingProgress = Math.min(100, (subtotal / (STORE.minOrderForFreeShipping * 100)) * 100);
  const amountForFreeShipping = Math.max(0, STORE.minOrderForFreeShipping * 100 - subtotal);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const data = await res.json();
      if (data.success) {
        applyCoupon(data.code, data.discount);
        setCouponInput("");
      } else {
        setCouponError(data.error || "Invalid coupon");
      }
    } catch {
      setCouponError("Something went wrong");
    } finally {
      setCouponLoading(false);
    }
  };

  // ─── Empty Cart State ──────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="relative inline-block mb-8">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center animate-float">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-pink-400 flex items-center justify-center animate-bounce-in" style={{ animationDelay: "0.3s" }}>
            <span className="text-white text-lg">?</span>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">Looks like you haven&apos;t added anything yet. Start exploring our collection and find something you love!</p>
        <Link href="/products">
          <Button size="lg" className="h-14 px-8 text-base font-semibold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300">
            <ShoppingBag className="h-5 w-5 mr-2" /> Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
          <ShoppingBag className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Shopping Cart</h1>
          <p className="text-sm text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""} in your cart</p>
        </div>
      </div>

      {/* Free Shipping Progress */}
      {hasFreeShippingItem ? (
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Truck className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-green-800">
              🚚 FREE delivery on this order! (Free shipping product in cart)
            </span>
          </div>
        </div>
      ) : amountForFreeShipping > 0 ? (
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Truck className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-green-800">
              Add {formatPrice(amountForFreeShipping)} more for FREE delivery! 🚚
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={freeShippingProgress} className="h-2.5 bg-green-100 flex-1" />
            <span className="text-sm font-bold text-green-600">{Math.round(freeShippingProgress)}%</span>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
            <Truck className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-green-700 font-semibold text-sm">🎉 You&apos;ve unlocked FREE delivery!</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item, i) => (
            <div
              key={`${item.id}-${item.variantId}`}
              className="flex gap-4 p-4 border-2 rounded-2xl bg-card hover:shadow-md transition-all duration-200 group animate-slide-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Link href={`/products/${item.slug}`} className="relative w-20 h-24 sm:w-24 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-muted img-zoom">
                <Image
                  src={item.image || "/placeholder-product.jpg"}
                  alt={item.title}
                  fill
                  className="object-contain"
                  sizes="96px"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.slug}`} className="font-semibold line-clamp-1 hover:text-primary transition-colors text-sm sm:text-base">
                  {item.title}
                </Link>
                {item.variantLabel && (
                  <p className="text-xs text-muted-foreground mt-0.5">{item.variantLabel}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold">{formatPrice(item.price)}</span>
                  {item.mrp > item.price && (
                    <span className="text-xs text-muted-foreground line-through">{formatPrice(item.mrp)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center border-2 rounded-xl overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId)}
                      className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId)}
                      disabled={item.quantity >= item.stock}
                      className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                    <button
                      onClick={() => removeItem(item.id, item.variantId)}
                      className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border-2 rounded-2xl p-6 sticky top-20 space-y-5 bg-card">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Order Summary
            </h2>

            {/* Coupon */}
            <div>
              <label className="text-xs font-semibold mb-1.5 block">Have a coupon?</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter code"
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                  className="h-11 rounded-xl font-mono"
                />
                <Button variant="outline" onClick={handleApplyCoupon} disabled={couponLoading} className="shrink-0 rounded-xl">
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
              {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
              {couponCode && (
                <div className="flex items-center justify-between mt-2 p-2.5 bg-green-50 rounded-xl border border-green-100">
                  <span className="text-sm text-green-700 font-semibold">
                    <Tag className="h-3.5 w-3.5 inline mr-1" /> {couponCode}
                  </span>
                  <button onClick={removeCoupon} className="text-xs text-red-500 hover:underline font-medium">
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600 font-bold">FREE</span> : formatPrice(shipping)}</span>
              </div>
              <div className="border-t-2 pt-3 flex justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold gradient-text">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link href="/checkout" className="block">
              <Button size="lg" className="w-full h-13 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 bg-gradient-to-r from-primary to-primary/90">
                Proceed to Checkout
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>

            <Link href="/products" className="block text-center text-sm text-primary hover:underline font-semibold">
              ← Continue Shopping
            </Link>

            {/* Trust signals */}
            <div className="border-t pt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" />
                <span>Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
