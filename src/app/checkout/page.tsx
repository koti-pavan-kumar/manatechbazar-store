"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";
import { STORE } from "@/lib/constants";
import { CreditCard, Loader2, Check, MapPin, User, Phone } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const billingSchema = {
  parse: (data: any) => {
    if (!data.name?.trim()) throw new Error("Name is required");
    if (!data.phone?.trim() || data.phone.replace(/\D/g, "").length < 10) throw new Error("Valid phone number is required");
    if (!data.line1?.trim()) throw new Error("Address is required");
    if (!data.city?.trim()) throw new Error("City is required");
    if (!data.state?.trim()) throw new Error("State is required");
    if (!data.pincode?.trim() || data.pincode.length < 6) throw new Error("Valid pincode is required");
    return data;
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, couponCode, discount, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"billing" | "payment">("billing");

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  const subtotal = getSubtotal();
  const hasFreeShippingItem = items.some((item) => item.freeShipping);
  const shipping = hasFreeShippingItem || subtotal >= STORE.minOrderForFreeShipping * 100 ? 0 : 4900;
  const total = Math.max(0, subtotal - discount + shipping);

  if (items.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-4">
        <p className="text-lg font-medium mb-4">Your cart is empty</p>
        <Button onClick={() => router.push("/products")}>Start Shopping</Button>
      </div>
    );
  }

  const onBillingSubmit = (data: any) => {
    try {
      billingSchema.parse(data);
      setStep("payment");
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handlePayNow = async () => {
    setLoading(true);
    try {
      const billingData = watch();

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: billingData.name,
          guestPhone: billingData.phone,
          guestEmail: billingData.email || null,
          address: {
            line1: billingData.line1,
            line2: billingData.line2 || null,
            city: billingData.city,
            state: billingData.state,
            pincode: billingData.pincode,
          },
          couponCode,
          items: items.map((item) => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            price: item.price,
            mrp: item.mrp,
            image: item.image,
            quantity: item.quantity,
            stock: item.stock,
            freeShipping: item.freeShipping,
          })),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.error || "Failed to create order");
        setLoading(false);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: "INR",
        name: STORE.name,
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
          // Verify payment
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: data.internalOrderId,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            clearCart();
            router.push(`/orders/${data.internalOrderId}`);
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: billingData.name,
          contact: billingData.phone,
          email: billingData.email || "",
        },
        theme: { color: "#1a1a1a" },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
          confirm_close: true,
        },
        notes: { checkout_domain: "manatechbazar.in" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      <div className="mx-auto max-w-3xl px-4 py-6 w-full overflow-x-clip">
        <h1 className="text-2xl font-bold mb-2">Checkout</h1>
        <p className="text-sm text-muted-foreground mb-6">Fill in your billing details to place the order</p>

        <div className="space-y-6">
          {/* ═══════════ BILLING FORM ═══════════ */}
          <Card className={step === "payment" ? "opacity-60" : ""}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Billing Information
                {step === "payment" && <span className="text-xs text-green-600 ml-auto">✓ Filled</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onBillingSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      className="h-12 rounded-xl"
                      disabled={step === "payment"}
                      {...register("name", { required: "Name is required" })}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message as string}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="10-digit phone number"
                      className="h-12 rounded-xl"
                      disabled={step === "payment"}
                      {...register("phone", { required: "Phone is required", minLength: { value: 10, message: "Enter 10-digit number" } })}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message as string}</p>}
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Delivery Address
                  </p>
                </div>

                <div>
                  <Label htmlFor="line1">Address Line 1 *</Label>
                  <Input
                    id="line1"
                    placeholder="House/Flat no., Street, Area"
                    className="h-12 rounded-xl"
                    disabled={step === "payment"}
                    {...register("line1", { required: "Address is required" })}
                  />
                  {errors.line1 && <p className="text-xs text-red-500 mt-1">{errors.line1.message as string}</p>}
                </div>

                <div>
                  <Label htmlFor="line2">Address Line 2 (optional)</Label>
                  <Input
                    id="line2"
                    placeholder="Landmark, Colony"
                    className="h-12 rounded-xl"
                    disabled={step === "payment"}
                    {...register("line2")}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      className="h-12 rounded-xl"
                      disabled={step === "payment"}
                      {...register("city", { required: "City is required" })}
                    />
                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message as string}</p>}
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="State"
                      className="h-12 rounded-xl"
                      disabled={step === "payment"}
                      {...register("state", { required: "State is required" })}
                    />
                    {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message as string}</p>}
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      placeholder="6-digit"
                      className="h-12 rounded-xl"
                      disabled={step === "payment"}
                      {...register("pincode", { required: "Pincode is required", minLength: { value: 6, message: "6 digits" } })}
                    />
                    {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode.message as string}</p>}
                  </div>
                </div>

                {step === "billing" && (
                  <Button type="submit" size="lg" className="w-full h-12 rounded-xl font-semibold">
                    Continue to Payment <Check className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {/* ═══════════ ORDER SUMMARY + PAYMENT ═══════════ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-500" />
                Order Summary ({items.reduce((n, i) => n + i.quantity, 0)} {items.reduce((n, i) => n + i.quantity, 0) === 1 ? "item" : "items"})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Full product cards — image, variant, qty, price, MRP, discount */}
              <div className="space-y-2.5">
                {items.map((item, i) => {
                  const lineTotal = item.price * item.quantity;
                  const saved = (item.mrp - item.price) * item.quantity;
                  const discountPct = item.mrp > item.price ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;
                  return (
                    <div
                      key={`${item.id}-${item.variantId}`}
                      className="flex gap-3 p-3 rounded-2xl border bg-muted/30 animate-slide-in-up"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <Link
                        href={`/products/${item.slug}`}
                        className="relative w-16 h-20 sm:w-20 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-muted img-zoom"
                      >
                        <Image
                          src={item.image || "/placeholder-product.jpg"}
                          alt={item.title}
                          fill
                          className="object-contain"
                          sizes="80px"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/products/${item.slug}`}
                            className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors"
                          >
                            {item.title}
                          </Link>
                          <span className="font-bold text-sm shrink-0">{formatPrice(lineTotal)}</span>
                        </div>
                        {item.variantLabel && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.variantLabel}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                          <span>Qty: {item.quantity}</span>
                          <span>·</span>
                          <span>{formatPrice(item.price)} each</span>
                          {item.mrp > item.price && (
                            <>
                              <span className="line-through">{formatPrice(item.mrp)}</span>
                              <span className="font-bold text-green-700 bg-green-100 rounded-full px-1.5 py-0.5">
                                {discountPct}% OFF
                              </span>
                            </>
                          )}
                        </div>
                        {(item.freeShipping || saved > 0) && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {item.freeShipping && (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 rounded-full px-2 py-0.5">
                                🚚 FREE Delivery
                              </span>
                            )}
                            {saved > 0 && (
                              <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-100 rounded-full px-2 py-0.5">
                                You save {formatPrice(saved)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({couponCode})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                {items.reduce((n, i) => n + Math.max(0, i.mrp - i.price) * i.quantity, 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Total savings vs MRP</span>
                    <span>{formatPrice(items.reduce((n, i) => n + Math.max(0, i.mrp - i.price) * i.quantity, 0))}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600 font-medium">FREE</span> : formatPrice(shipping)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {step === "payment" && (
                <div className="pt-4 space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 text-sm text-blue-700 dark:text-blue-300">
                    💳 Payment via Razorpay — UPI, Cards, Net Banking, Wallets
                  </div>
                  <Button
                    size="xl"
                    className="w-full h-14 rounded-xl text-lg font-bold"
                    onClick={handlePayNow}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <CreditCard className="h-5 w-5 mr-2" />
                    )}
                    Pay {formatPrice(total)}
                  </Button>
                  <button
                    onClick={() => setStep("billing")}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    ← Edit billing details
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
