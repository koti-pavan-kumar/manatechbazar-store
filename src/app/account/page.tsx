"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  User, Package, MapPin, LogOut, ChevronRight, Plus, Edit, Trash2, Loader2,
  Shield, Mail, Phone, Heart, Settings, Headphones, ShoppingBag, CreditCard,
  Truck, Star, Calendar, TrendingUp, ExternalLink, Camera, MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<"overview" | "orders" | "addresses" | "wishlist" | "settings">("overview");
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/account/orders").then((r) => r.json()),
        fetch("/api/account/addresses").then((r) => r.json()),
      ]).then(([ordersData, addressesData]) => {
        setOrders(ordersData.orders || []);
        setAddresses(addressesData.addresses || []);
        setLoading(false);
      });
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <User className="h-12 w-12 text-primary/40" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="h-4 w-4 text-primary/60" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 text-center">Welcome back!</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-sm">Sign in to track orders, manage your wishlist, and enjoy a personalised shopping experience.</p>
        <div className="flex gap-3">
          <Link href="/register">
            <Button size="lg" className="rounded-2xl px-8 font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
              Create Account
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="rounded-2xl px-8 font-bold">
              Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const user = session.user as any;
  const totalSpent = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
  const totalItems = orders.reduce((sum: number, o: any) => sum + (o.items?.length || 0), 0);
  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "2026";

  const tabs = [
    { key: "overview" as const, icon: User, label: "Overview", color: "from-blue-500 to-indigo-500" },
    { key: "orders" as const, icon: Package, label: "Orders", color: "from-emerald-500 to-teal-500", count: orders.length },
    { key: "addresses" as const, icon: MapPin, label: "Addresses", color: "from-pink-500 to-rose-500", count: addresses.length },
    { key: "wishlist" as const, icon: Heart, label: "Wishlist", color: "from-red-500 to-orange-500" },
    { key: "settings" as const, icon: Settings, label: "Settings", color: "from-gray-500 to-slate-600" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      {/* ═══════════ PROFILE HEADER ═══════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-white">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-purple-600/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />
        <div className="absolute top-4 right-8 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
        <div className="absolute top-8 right-16 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
        <div className="absolute top-12 right-4 w-1 h-1 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-primary/30 to-purple-500/30 backdrop-blur-sm flex items-center justify-center border-2 border-white/20 text-3xl sm:text-4xl font-extrabold shadow-2xl">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              {user.role === "ADMIN" && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg">
                  <Shield className="h-3.5 w-3.5 text-gray-900" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold">{user.name}</h1>
                {user.role === "ADMIN" && (
                  <span className="inline-flex items-center gap-1 bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                    <Shield className="h-3 w-3" /> Admin
                  </span>
                )}
              </div>
              <p className="text-white/50 text-sm flex items-center gap-1.5 mt-1">
                <Phone className="h-3.5 w-3.5" /> {(user as any).phone || user.email}
              </p>
              <p className="text-white/40 text-xs flex items-center gap-1.5 mt-0.5">
                <Calendar className="h-3 w-3" /> Member since {memberSince}
              </p>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-white/10 text-center">
              <p className="text-xl sm:text-2xl font-extrabold">{orders.length}</p>
              <p className="text-[11px] sm:text-xs text-white/50 mt-0.5">Orders</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-white/10 text-center">
              <p className="text-xl sm:text-2xl font-extrabold">{formatPrice(totalSpent)}</p>
              <p className="text-[11px] sm:text-xs text-white/50 mt-0.5">Total Spent</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-white/10 text-center">
              <p className="text-xl sm:text-2xl font-extrabold">{totalItems}</p>
              <p className="text-[11px] sm:text-xs text-white/50 mt-0.5">Items Bought</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ QUICK ACTION TILES ═══════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/wishlist" className="group">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:shadow-lg hover:border-red-200 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Heart className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-sm font-bold text-gray-900">Wishlist</p>
            <p className="text-[11px] text-gray-500">Your favourites</p>
          </div>
        </Link>
        <Link href="/products" className="group">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ShoppingBag className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-sm font-bold text-gray-900">Shop</p>
            <p className="text-[11px] text-gray-500">Browse products</p>
          </div>
        </Link>
        <a href="https://www.instagram.com/manatechbazar?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="group">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:shadow-lg hover:border-pink-200 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Camera className="h-5 w-5 text-pink-500" />
            </div>
            <p className="text-sm font-bold text-gray-900">Instagram</p>
            <p className="text-[11px] text-gray-500">Follow us</p>
          </div>
        </a>
        <a href="https://wa.me/917893653255" target="_blank" rel="noopener noreferrer" className="group">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:shadow-lg hover:border-green-200 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <MessageCircle className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm font-bold text-gray-900">Support</p>
            <p className="text-[11px] text-gray-500">WhatsApp us</p>
          </div>
        </a>
      </div>

      {/* ═══════════ TAB NAVIGATION ═══════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map(({ key, icon: Icon, label, color, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`relative flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 min-h-[48px] whitespace-nowrap ${
                tab === key
                  ? `bg-gradient-to-r ${color} text-white shadow-lg`
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
              {count !== undefined && count > 0 && (
                <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${
                  tab === key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ OVERVIEW TAB ═══════════ */}
      {tab === "overview" && (
        <div className="space-y-4">
          {/* Profile Info Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50/80 to-transparent">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                Profile Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-100">
                  <Label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Full Name</Label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{user.name}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-100">
                  <Label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Phone Number</Label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{(user as any).phone || "Not set"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders Preview */}
          {orders.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50/80 to-transparent">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  Recent Orders
                </h2>
                <button onClick={() => setTab("orders")} className="text-xs font-bold text-primary hover:underline">
                  View All →
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {orders.slice(0, 3).map((order: any) => (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">#{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString("en-IN")} • {order.items?.length || 0} item(s)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={ORDER_STATUS[order.status]?.color || ""} variant="secondary">
                          {ORDER_STATUS[order.status]?.label || order.status}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-gray-300" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 gap-4">
            {user.role === "ADMIN" && (
              <Link href="/admin">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                    <Shield className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base">Admin Dashboard</h3>
                  <p className="text-white/70 text-xs mt-0.5">Manage products, orders & customers</p>
                  <div className="flex items-center gap-1 mt-3 text-sm font-semibold text-white/90">
                    Open Dashboard <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            )}
            <Link href="/offers">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 text-white hover:shadow-xl hover:shadow-orange-500/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <Star className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base">Hot Deals</h3>
                <p className="text-white/70 text-xs mt-0.5">Check out ongoing offers & coupons</p>
                <div className="flex items-center gap-1 mt-3 text-sm font-semibold text-white/90">
                  View Offers <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          </div>

          {/* Sign Out */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      )}

      {/* ═══════════ ORDERS TAB ═══════════ */}
      {tab === "orders" && (
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading orders...</p>
              </div>
            </div>
          ) : orders.length > 0 ? (
            orders.map((order: any, i: number) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <div
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-primary/10 transition-all duration-200 cursor-pointer mb-3"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">#{order.orderNumber}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} • {order.items?.length || 0} item(s)
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                        <Badge className={`mt-1 ${ORDER_STATUS[order.status]?.color || ""}`} variant="secondary">
                          {ORDER_STATUS[order.status]?.label || order.status}
                        </Badge>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                <Package className="h-10 w-10 text-gray-300" />
              </div>
              <p className="text-lg font-bold text-gray-900 mb-1">No orders yet</p>
              <p className="text-gray-500 text-sm mb-6">Your order history will appear here</p>
              <Link href="/products">
                <Button className="rounded-2xl px-8 font-bold shadow-lg shadow-primary/20">
                  <ShoppingBag className="h-4 w-4 mr-2" /> Start Shopping
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ ADDRESSES TAB ═══════════ */}
      {tab === "addresses" && (
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading addresses...</p>
              </div>
            </div>
          ) : addresses.length > 0 ? (
            addresses.map((addr: any, i: number) => (
              <div
                key={addr.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all duration-200"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{addr.name}</p>
                        {addr.isDefault && (
                          <span className="inline-flex items-center bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
                      </p>
                      <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> {addr.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                <MapPin className="h-10 w-10 text-gray-300" />
              </div>
              <p className="text-lg font-bold text-gray-900 mb-1">No addresses saved</p>
              <p className="text-gray-500 text-sm">Add an address during checkout — it&apos;ll be saved here</p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ WISHLIST TAB ═══════════ */}
      {tab === "wishlist" && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
            <Heart className="h-10 w-10 text-red-300" />
          </div>
          <p className="text-lg font-bold text-gray-900 mb-1">Your Wishlist</p>
          <p className="text-gray-500 text-sm mb-6">Tap the ❤️ on any product to save it here</p>
          <Link href="/products">
            <Button className="rounded-2xl px-8 font-bold shadow-lg shadow-primary/20">
              <Heart className="h-4 w-4 mr-2" /> Browse Products
            </Button>
          </Link>
        </div>
      )}

      {/* ═══════════ SETTINGS TAB ═══════════ */}
      {tab === "settings" && (
        <div className="space-y-4">
          {/* Account Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50/80 to-transparent">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-400" />
                Account Settings
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Phone Number</p>
                    <p className="text-xs text-gray-500">{(user as any).phone || user.email}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-0">Verified</Badge>
              </div>
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Role</p>
                    <p className="text-xs text-gray-500">{user.role === "ADMIN" ? "Administrator" : "Customer"}</p>
                  </div>
                </div>
                <Badge className={user.role === "ADMIN" ? "bg-yellow-100 text-yellow-700 border-0" : "bg-gray-100 text-gray-600 border-0"}>
                  {user.role}
                </Badge>
              </div>
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Payment Methods</p>
                    <p className="text-xs text-gray-500">UPI, Cards, Net Banking, COD</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-0">Active</Badge>
              </div>
            </div>
          </div>

          {/* Support Links */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50/80 to-transparent">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Headphones className="h-4 w-4 text-gray-400" />
                Help & Support
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              <Link href="/refund-policy" className="block px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Refund Policy</p>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
              </Link>
              <Link href="/terms" className="block px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Terms & Conditions</p>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
              </Link>
              <Link href="/privacy" className="block px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Privacy Policy</p>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
              </Link>
              <a href="https://wa.me/917893653255" target="_blank" rel="noopener noreferrer" className="block px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Contact on WhatsApp</p>
                  <ExternalLink className="h-4 w-4 text-gray-300" />
                </div>
              </a>
            </div>
          </div>

          {/* Danger Zone */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-red-200 text-red-500 font-semibold hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" /> Sign Out of Account
          </button>
        </div>
      )}
    </div>
  );
}
