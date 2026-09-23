"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Loader2, Package, Phone, Mail, MapPin, CreditCard,
  Truck, CheckCircle, Clock, XCircle, ShoppingBag, Copy, ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";

const STATUS_OPTIONS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

function fmtDT(value: string | Date | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/orders/${params.id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => { setOrder(data.order); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  const updateStatus = async (status: string) => {
    if (status === "CANCELLED" && !confirm("Cancel this order? Stock will be restored.")) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, status }),
      });
      if (res.ok) setOrder({ ...order, status });
      else alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const copyId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-medium mb-3">Order not found</p>
        <Link href="/admin/orders" className="text-indigo-600 hover:underline">
          ← Back to orders
        </Link>
      </div>
    );
  }

  const customerName = order.guestName || order.user?.name || "Guest";
  const customerPhone = order.guestPhone || order.user?.phone || "";
  const customerEmail = order.guestEmail || order.user?.email || "";
  const discountRupees = Math.round(order.discount / 100);
  const shippingRupees = Math.round(order.shippingCharges / 100);

  const timeline = [
    { label: "Order placed", time: order.createdAt, icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
    order.paymentStatus === "PAID"
      ? { label: "Payment received", time: order.paidAt || order.updatedAt, icon: CheckCircle, color: "text-green-600 bg-green-50" }
      : order.paymentStatus === "FAILED"
        ? { label: "Payment failed", time: order.failedAt || order.updatedAt, icon: XCircle, color: "text-red-600 bg-red-50" }
        : { label: "Awaiting payment", time: order.updatedAt, icon: Clock, color: "text-amber-600 bg-amber-50" },
    ...(order.shippedAt ? [{ label: "Shipped", time: order.shippedAt, icon: Truck, color: "text-indigo-600 bg-indigo-50" }] : []),
    ...(order.deliveredAt ? [{ label: "Delivered", time: order.deliveredAt, icon: CheckCircle, color: "text-green-700 bg-green-50" }] : []),
  ];

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-1.5">
            <ChevronLeft className="h-4 w-4" /> Back to orders
          </Link>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold">#{order.orderNumber}</h1>
            <Badge className={ORDER_STATUS[order.status]?.color || ""}>
              {ORDER_STATUS[order.status]?.label || order.status}
            </Badge>
            <Badge variant={order.paymentStatus === "PAID" ? "success" : order.paymentStatus === "FAILED" ? "destructive" : "secondary"}>
              {order.paymentMode} — {order.paymentStatus}
            </Badge>
          </div>
          <p className="text-xs text-gray-400 mt-1">Placed {fmtDT(order.createdAt)} • Last update {fmtDT(order.updatedAt)}</p>
        </div>

        {/* Status updater */}
        <div className="flex items-center gap-2">
          <select
            value={order.status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={updating}
            className="h-11 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium min-w-[160px] focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{ORDER_STATUS[s]?.label || s}</option>
            ))}
          </select>
          {updating && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* LEFT: products (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Products */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-indigo-500" /> Products in this order ({order.items?.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border shrink-0">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-snug">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.size && `Size: ${item.size} • `}{item.color && `Color: ${item.color} • `}Qty: <strong>{item.quantity}</strong>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatPrice(item.priceAtPurchase)} × {item.quantity}
                      {item.mrp > item.priceAtPurchase && (
                        <span className="line-through ml-1.5">{formatPrice(item.mrp)}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">{formatPrice(item.total)}</p>
                    {item.mrp > item.priceAtPurchase && (
                      <p className="text-[11px] text-green-600">{Math.round(((item.mrp - item.priceAtPurchase) / item.mrp) * 100)}% off</p>
                    )}
                  </div>
                </div>
              ))}

              <Separator />

              {/* Money breakdown */}
              <div className="space-y-1.5 text-sm pt-1">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount {order.couponCode && `(coupon ${order.couponCode})`}</span>
                    <span>− {formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shippingRupees === 0 ? "FREE" : formatPrice(order.shippingCharges)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total paid</span>
                  <span className={order.paymentStatus === "PAID" ? "text-green-600" : order.paymentStatus === "FAILED" ? "text-red-600" : "text-gray-900"}>
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-500" /> Order Timeline (exact times)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="space-y-3">
                {timeline.map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${t.color}`}>
                      <t.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.label}</p>
                      <p className="text-xs text-gray-500">{fmtDT(t.time)}</p>
                    </div>
                  </div>
                ))}
                {order.status === "CANCELLED" && order.cancelReason && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-red-50 text-red-600">
                      <XCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-600">Cancelled</p>
                      <p className="text-xs text-gray-500">{order.cancelReason}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: customer + payment (1 col) */}
        <div className="space-y-5">
          {/* Customer */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="h-4 w-4 text-indigo-500" /> Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1 space-y-2.5 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{customerName}</span>
                {order.user ? (
                  <Badge variant="outline" className="text-[10px]">Registered</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">Guest</Badge>
                )}
              </div>
              {customerPhone && (
                <a href={`tel:${customerPhone}`} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600">
                  <Phone className="h-3.5 w-3.5" /> {customerPhone}
                </a>
              )}
              {customerPhone && (
                <a
                  href={`https://wa.me/91${customerPhone.replace(/\D/g, "").slice(-10)}?text=Hi%20${encodeURIComponent(customerName)}%2C%20regarding%20your%20order%20${order.orderNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-600 hover:underline text-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Message on WhatsApp
                </a>
              )}
              {customerEmail && (
                <a href={`mailto:${customerEmail}`} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600">
                  <Mail className="h-3.5 w-3.5" /> {customerEmail}
                </a>
              )}
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-indigo-500" /> Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1 text-sm text-gray-700 leading-relaxed">
              <p className="font-medium">{order.address?.name}</p>
              <p>{order.address?.line1}</p>
              {order.address?.line2 && <p>{order.address.line2}</p>}
              <p>{order.address?.city}, {order.address?.state} − {order.address?.pincode}</p>
              <p className="text-xs text-gray-400 mt-1">📞 {order.address?.phone}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  [order.address?.line1, order.address?.line2, order.address?.city, order.address?.state, order.address?.pincode].filter(Boolean).join(" ")
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-2"
              >
                <MapPin className="h-3 w-3" /> View on Google Maps
              </a>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-500" /> Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium">{order.paymentMode === "RAZORPAY" ? "Razorpay (online)" : order.paymentMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge variant={order.paymentStatus === "PAID" ? "success" : order.paymentStatus === "FAILED" ? "destructive" : "secondary"}>
                  {order.paymentStatus}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold">{formatPrice(order.total)}</span>
              </div>

              {order.razorpayOrderId && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-gray-500 shrink-0">Razorpay Order</span>
                  <span className="flex items-center gap-1 font-mono text-[11px] truncate">
                    {order.razorpayOrderId}
                    <button onClick={() => copyId(order.razorpayOrderId)} className="p-1 hover:bg-gray-100 rounded" title="Copy">
                      <Copy className={`h-3 w-3 ${copied ? "text-green-600" : "text-gray-400"}`} />
                    </button>
                  </span>
                </div>
              )}
              {order.razorpayPaymentId && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-gray-500 shrink-0">Payment ID</span>
                  <span className="flex items-center gap-1 font-mono text-[11px] truncate">
                    {order.razorpayPaymentId}
                    <button onClick={() => copyId(order.razorpayPaymentId)} className="p-1 hover:bg-gray-100 rounded" title="Copy">
                      <Copy className={`h-3 w-3 ${copied ? "text-green-600" : "text-gray-400"}`} />
                    </button>
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID</span>
                <span className="font-mono text-[11px] text-gray-400">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Coupon</span>
                <span className="font-medium">{order.couponCode || "—"}</span>
              </div>
              {discountRupees > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>You saved</span>
                  <span>{formatPrice(order.discount)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
