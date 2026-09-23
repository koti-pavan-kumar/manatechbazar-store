"use client";

import { useState, useEffect, useMemo } from "react";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Loader2, Search, Filter, X, ArrowUpDown,
} from "lucide-react";

const STATUS_OPTIONS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
const PAYMENT_STATUSES = ["PAID", "PENDING", "FAILED", "REFUNDED"];
const PAYMENT_MODES = ["RAZORPAY", "COD"];
const DATE_RANGES = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "high", label: "Amount: high → low" },
  { value: "low", label: "Amount: low → high" },
];

function dateStart(range: string): Date | null {
  const now = new Date();
  switch (range) {
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

const selectClass =
  "h-10 px-3 pr-8 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none cursor-pointer hover:bg-gray-50 transition-colors";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [paymentMode, setPaymentMode] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(data.orders || []); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    let list = [...orders];

    // Search: order number, customer name, phone, address, coupon
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((o) => {
        const name = (o.guestName || o.user?.name || "").toLowerCase();
        const phone = (o.guestPhone || o.user?.phone || "").toLowerCase();
        const city = (o.address?.city || "").toLowerCase();
        return (
          o.orderNumber?.toLowerCase().includes(q) ||
          name.includes(q) ||
          phone.includes(q) ||
          city.includes(q) ||
          o.couponCode?.toLowerCase().includes(q)
        );
      });
    }

    // Exact-match filters, normalized against casing/null drift
    if (status !== "all") list = list.filter((o) => (o.status || "").trim().toUpperCase() === status);
    if (paymentStatus !== "all")
      list = list.filter((o) => ((o.paymentStatus || "PENDING").trim() || "PENDING").toUpperCase() === paymentStatus);
    if (paymentMode !== "all") list = list.filter((o) => (o.paymentMode || "").trim().toUpperCase() === paymentMode);

    const start = dateStart(dateRange);
    if (start) list = list.filter((o) => new Date(o.createdAt) >= start);

    switch (sort) {
      case "oldest":
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "high":
        list.sort((a, b) => b.total - a.total);
        break;
      case "low":
        list.sort((a, b) => a.total - b.total);
        break;
      default:
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [orders, search, status, paymentStatus, paymentMode, dateRange, sort]);

  const activeFilters =
    (search ? 1 : 0) +
    (status !== "all" ? 1 : 0) +
    (paymentStatus !== "all" ? 1 : 0) +
    (paymentMode !== "all" ? 1 : 0) +
    (dateRange !== "all" ? 1 : 0) +
    (sort !== "newest" ? 1 : 0);

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setPaymentStatus("all");
    setPaymentMode("all");
    setDateRange("all");
    setSort("newest");
  };

  const updateStatus = async (orderId: string, next: string) => {
    setUpdatingId(orderId);
    try {
      await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: next }),
      });
      setOrders(orders.map((o) => o.id === orderId ? { ...o, status: next } : o));
    } catch {
      alert("Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Orders ({activeFilters > 0 ? `${filtered.length} of ${orders.length}` : orders.length})
        </h1>
        {activeFilters > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <X className="h-4 w-4" /> Clear filters ({activeFilters})
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5" /> Filter Orders
        </p>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer name, phone, city, or coupon code..."
            className="pl-9 h-10 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Order Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={`w-full ${selectClass}`}>
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{ORDER_STATUS[s]?.label || s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Payment Status</label>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className={`w-full ${selectClass}`}>
              <option value="all">All payments</option>
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Payment Method</label>
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className={`w-full ${selectClass}`}>
              <option value="all">All methods</option>
              {PAYMENT_MODES.map((m) => (
                <option key={m} value={m}>{m === "RAZORPAY" ? "Razorpay (online)" : "Cash on Delivery"}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Date Range</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className={`w-full ${selectClass}`}>
              {DATE_RANGES.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectClass}>
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <span className="text-xs text-gray-400">
            Showing {filtered.length} of {orders.length} orders
          </span>
        </div>

        {/* Active filter chips */}
        {activeFilters > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {search && (
              <Chip label={`Search: "${search}"`} onClear={() => setSearch("")} />
            )}
            {status !== "all" && (
              <Chip label={`Status: ${ORDER_STATUS[status]?.label || status}`} onClear={() => setStatus("all")} />
            )}
            {paymentStatus !== "all" && (
              <Chip label={`Payment: ${paymentStatus}`} onClear={() => setPaymentStatus("all")} />
            )}
            {paymentMode !== "all" && (
              <Chip label={`Method: ${paymentMode}`} onClear={() => setPaymentMode("all")} />
            )}
            {dateRange !== "all" && (
              <Chip
                label={`Date: ${DATE_RANGES.find((d) => d.value === dateRange)?.label}`}
                onClear={() => setDateRange("all")}
              />
            )}
            {sort !== "newest" && (
              <Chip label={`Sort: ${SORT_OPTIONS.find((s) => s.value === sort)?.label}`} onClear={() => setSort("newest")} />
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-lg font-medium text-gray-700">
            {orders.length === 0 ? "No orders yet" : "No orders match these filters"}
          </p>
          {orders.length > 0 && activeFilters > 0 && (
            <button onClick={clearFilters} className="mt-2 text-sm text-indigo-600 hover:underline">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Card className={order.paymentStatus === "FAILED" ? "border-red-200 bg-red-50/40" : ""}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm">#{order.orderNumber}</p>
                      {/*
                        Primary badge = TRUE order state.
                        A failed/pending payment must never read as "Order Placed" —
                        that was the confusion: order-status and payment-status are separate fields.
                      */}
                      {order.paymentStatus === "FAILED" ? (
                        <Badge className="bg-red-100 text-red-700 border-transparent">❌ Payment Failed</Badge>
                      ) : order.paymentStatus === "PENDING" && order.status === "PLACED" ? (
                        <Badge className="bg-amber-100 text-amber-700 border-transparent">⏳ Awaiting Payment</Badge>
                      ) : (
                        <Badge className={ORDER_STATUS[order.status]?.color || ""}>
                          {ORDER_STATUS[order.status]?.label || order.status}
                        </Badge>
                      )}
                      <Badge
                        variant={
                          order.paymentStatus === "PAID"
                            ? "success"
                            : order.paymentStatus === "FAILED"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {order.paymentStatus === "FAILED"
                          ? order.paymentMode
                          : `${order.paymentMode} — ${order.paymentStatus}`}
                      </Badge>
                      {order.couponCode && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          🏷 {order.couponCode}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.guestName || order.user?.name || "Guest"} • {order.guestPhone || order.user?.phone || ""} • {new Date(order.createdAt).toLocaleDateString("en-IN")}
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

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
      {label}
      <button onClick={onClear} className="hover:text-indigo-900 font-bold" aria-label={`Remove ${label}`}>
        ×
      </button>
    </span>
  );
}
