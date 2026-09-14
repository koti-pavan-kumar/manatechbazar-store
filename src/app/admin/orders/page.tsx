"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, Loader2 } from "lucide-react";

const STATUS_OPTIONS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(data.orders || []); setLoading(false); });
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      setOrders(orders.map((o) => o.id === orderId ? { ...o, status } : o));
    } catch {
      alert("Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders ({orders.length})</h1>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg font-medium">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm">#{order.orderNumber}</p>
                      <Badge className={ORDER_STATUS[order.status]?.color || ""}>
                        {ORDER_STATUS[order.status]?.label || order.status}
                      </Badge>
                      <Badge variant={order.paymentStatus === "PAID" ? "success" : "secondary"}>
                        {order.paymentMode} — {order.paymentStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.user?.name} • {order.user?.email} • {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.items?.length} item(s) • {formatPrice(order.total)}
                    </p>
                    {order.address && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📍 {order.address.line1}, {order.address.city}, {order.address.state} - {order.address.pincode}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className="appearance-none h-10 pl-3 pr-8 rounded-lg border bg-background text-sm font-medium min-w-[140px]"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{ORDER_STATUS[s]?.label || s}</option>
                        ))}
                      </select>
                      {updatingId === order.id && (
                        <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
