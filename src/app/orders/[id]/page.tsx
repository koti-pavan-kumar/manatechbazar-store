"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Package, Truck, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STATUS_STEPS = [
  { key: "PLACED", icon: Package, label: "Order Placed" },
  { key: "CONFIRMED", icon: CheckCircle, label: "Confirmed" },
  { key: "SHIPPED", icon: Truck, label: "Shipped" },
  { key: "DELIVERED", icon: CheckCircle, label: "Delivered" },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data.order);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-4">
        <p className="text-lg font-medium mb-4">Order not found</p>
        <Button onClick={() => router.push("/account")}>Go to Account</Button>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link href="/account" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ChevronLeft className="h-4 w-4" /> Back to Account
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on {new Date(order.createdAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
          {order.paymentStatus === "PAID" && order.paidAt && (
            <p className="text-xs text-green-600 mt-0.5">
              💳 Payment received: {new Date(order.paidAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
            </p>
          )}
          {order.paymentStatus === "FAILED" && (
            <p className="text-xs text-red-500 mt-0.5">
              ❌ Payment failed: {new Date(order.failedAt || order.updatedAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
            </p>
          )}
        </div>
        <Badge className={cn("text-sm", ORDER_STATUS[order.status]?.color)}>
          {ORDER_STATUS[order.status]?.label}
        </Badge>
      </div>

      {/* Status Timeline */}
      {!isCancelled && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, i) => {
                const Icon = step.icon;
                const isActive = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                // Exact timestamp for each completed step
                const stepTime =
                  step.key === "PLACED" ? order.createdAt :
                  step.key === "CONFIRMED" ? (order.paidAt || order.createdAt) :
                  step.key === "SHIPPED" ? order.shippedAt :
                  step.key === "DELIVERED" ? order.deliveredAt : null;
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors",
                      isActive ? "bg-green-500 text-white" : "bg-muted text-muted-foreground",
                      isCurrent && "ring-4 ring-green-500/20"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={cn("text-xs font-medium text-center", isActive ? "text-green-600" : "text-muted-foreground")}>
                      {step.label}
                    </span>
                    {isActive && stepTime && (
                      <span className="text-[10px] text-muted-foreground text-center mt-0.5 leading-tight">
                        {new Date(stepTime).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {isCancelled && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-700">Order Cancelled</p>
              {order.cancelReason && <p className="text-sm text-red-600">{order.cancelReason}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Order Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.size && `Size: ${item.size} • `}{item.color && `Color: ${item.color} • `}
                  Qty: {item.quantity}
                </p>
              </div>
              <p className="font-medium text-sm">{formatPrice(item.total)}</p>
            </div>
          ))}
          <Separator />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{order.shippingCharges === 0 ? "FREE" : formatPrice(order.shippingCharges)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-1 border-t">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Shipping Address</CardTitle>
        </CardHeader>
        <CardContent>
          {order.address && (
            <div className="text-sm space-y-1">
              <p className="font-medium">{order.address.name}</p>
              <p className="text-muted-foreground">{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}</p>
              <p className="text-muted-foreground">{order.address.city}, {order.address.state} - {order.address.pincode}</p>
              <p className="text-muted-foreground">📞 {order.address.phone}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Method</span>
            <span>{order.paymentMode === "RAZORPAY" ? "Online Payment" : "Cash on Delivery"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={order.paymentStatus === "PAID" ? "success" : order.paymentStatus === "FAILED" ? "destructive" : "secondary"}>
              {order.paymentStatus}
            </Badge>
          </div>
          {order.razorpayPaymentId && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment ID</span>
              <span className="font-mono text-xs">{order.razorpayPaymentId}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
