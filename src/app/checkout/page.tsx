"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, addressSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";
import { STORE } from "@/lib/constants";
import { CreditCard, Banknote, Loader2, Check, Plus } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, getSubtotal, couponCode, discount, clearCart } = useCartStore();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<"RAZORPAY" | "COD">("RAZORPAY");
  const [loading, setLoading] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(false);

  const subtotal = getSubtotal();
  const hasFreeShippingItem = items.some((item) => item.freeShipping);
  const shipping = hasFreeShippingItem || subtotal >= STORE.minOrderForFreeShipping * 100 ? 0 : 4900;
  const total = Math.max(0, subtotal - discount + shipping);

  const newAddressForm = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: (session?.user as any)?.name || "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      country: "IN",
      isDefault: false,
    },
  });

  useEffect(() => {
    fetch("/api/account/addresses")
      .then((r) => r.json())
      .then((data) => {
        setAddresses(data.addresses || []);
        if (data.addresses?.length > 0) {
          setSelectedAddressId(data.addresses[0].id);
        }
      });
  }, []);

  if (items.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-4">
        <p className="text-lg font-medium mb-4">Your cart is empty</p>
        <Button onClick={() => router.push("/products")}>Start Shopping</Button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      let addressId = selectedAddressId;

      // Save new address if needed
      if (showNewAddress && !selectedAddressId) {
        const addrData = newAddressForm.getValues();
        const addrRes = await fetch("/api/account/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addrData),
        });
        const addrResult = await addrRes.json();
        if (!addrRes.ok) throw new Error(addrResult.error);
        addressId = addrResult.address.id;
      }

      if (!addressId) {
        alert("Please select or add a delivery address");
        setLoading(false);
        return;
      }

      if (paymentMode === "COD") {
        // Place COD order directly
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            addressId,
            paymentMode: "COD",
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
        if (data.success) {
          clearCart();
          router.push(`/orders/${data.orderId}`);
        } else {
          alert(data.error || "Failed to place order");
        }
      } else {
        // Razorpay flow
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            addressId,
            paymentMode: "RAZORPAY",
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
            name: (session?.user as any)?.name || "",
            email: session?.user?.email || "",
          },
          theme: { color: "#1a1a1a" },
          modal: {
            ondismiss: function () {
              setLoading(false);
              // Order was NOT created — user exited without paying
              // Cart is still intact, user can try again
            },
            confirm_close: true,
          },
          notes: { checkout_domain: "manatechbazar.in" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error: any) {
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      <div className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        <div className="space-y-6">
          {/* Address Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {addresses.length > 0 && (
                <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                  {addresses.map((addr: any) => (
                    <label key={addr.id} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={addr.id} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{addr.name}</span>
                          {addr.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                        <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-sm text-muted-foreground">📞 {addr.phone}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              )}

              <Button variant="outline" onClick={() => setShowNewAddress(!showNewAddress)} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add New Address
              </Button>

              {showNewAddress && (
                <form className="grid grid-cols-2 gap-3 mt-4 p-4 border rounded-xl bg-muted/30">
                  <div className="col-span-2 sm:col-span-1">
                    <Label>Name</Label>
                    <Input {...newAddressForm.register("name")} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Label>Phone</Label>
                    <Input {...newAddressForm.register("phone")} />
                  </div>
                  <div className="col-span-2">
                    <Label>Address Line 1</Label>
                    <Input {...newAddressForm.register("line1")} />
                  </div>
                  <div className="col-span-2">
                    <Label>Address Line 2 (optional)</Label>
                    <Input {...newAddressForm.register("line2")} />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input {...newAddressForm.register("city")} />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input {...newAddressForm.register("state")} />
                  </div>
                  <div>
                    <Label>Pincode</Label>
                    <Input {...newAddressForm.register("pincode")} />
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMode} onValueChange={(v) => setPaymentMode(v as any)}>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="RAZORPAY" />
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Online Payment (UPI / Cards / Wallets)</p>
                    <p className="text-xs text-muted-foreground">Pay securely via Razorpay</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="COD" />
                  <Banknote className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">Pay when you receive your order</p>
                  </div>
                </label>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary ({items.length} items)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={`${item.id}-${item.variantId}`} className="flex justify-between text-sm">
                  <span className="flex-1">
                    {item.title} {item.variantLabel ? `(${item.variantLabel})` : ""} × {item.quantity}
                  </span>
                  <span className="font-medium ml-2">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600 font-medium">FREE</span> : formatPrice(shipping)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            size="xl"
            className="w-full"
            onClick={handlePlaceOrder}
            disabled={loading || (!selectedAddressId && !showNewAddress)}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Check className="h-5 w-5 mr-2" />}
            {paymentMode === "COD" ? "Place Order (COD)" : `Pay ${formatPrice(total)}`}
          </Button>
        </div>
      </div>
    </>
  );
}
