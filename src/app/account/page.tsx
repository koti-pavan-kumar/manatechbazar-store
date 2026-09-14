"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  User, Package, MapPin, LogOut, ChevronRight, Plus, Edit, Trash2, Loader2,
  Shield, Mail, Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<"profile" | "orders" | "addresses">("profile");
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
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
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <User className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Sign in to your account</h1>
        <p className="text-muted-foreground mb-6">View your orders, addresses, and more.</p>
        <Link href="/login"><Button size="lg" className="rounded-xl px-8">Sign In</Button></Link>
      </div>
    );
  }

  const user = session.user as any;

  const tabs = [
    { key: "profile" as const, icon: User, label: "Profile" },
    { key: "orders" as const, icon: Package, label: "Orders" },
    { key: "addresses" as const, icon: MapPin, label: "Addresses" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Page Header with user info */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 text-white mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/10" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 text-2xl font-bold">
            {user.name?.charAt(0) || "U"}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{user.name}</h1>
            <p className="text-white/60 text-sm flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5" />
              {user.email}
            </p>
            {user.role === "ADMIN" && (
              <Badge className="mt-1.5 bg-white/10 text-white border-white/20 text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-2 border-gray-100 rounded-2xl p-1.5 mb-6 bg-white shadow-sm">
        {tabs.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 min-h-[48px] ${
              tab === key
                ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === "profile" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5 text-gray-400" />
            Profile Information
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</Label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{user.name}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</Label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {user.role === "ADMIN" && (
              <Link href="/admin">
                <Button variant="outline" className="rounded-xl px-6 font-semibold">
                  Go to Admin Dashboard <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            )}
            <Button
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-xl px-6 font-semibold"
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {tab === "orders" && (
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : orders.length > 0 ? (
            orders.map((order: any, i: number) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <div
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all duration-200 cursor-pointer mb-3 animate-slide-in-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">#{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString("en-IN")} • {order.items?.length || 0} item(s)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                      <Badge className={ORDER_STATUS[order.status]?.color || ""} variant="secondary">
                        {ORDER_STATUS[order.status]?.label || order.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-bold text-gray-900 mb-1">No orders yet</p>
              <p className="text-gray-500 text-sm mb-4">Start shopping to see your orders here!</p>
              <Link href="/products"><Button className="rounded-xl px-6">Start Shopping</Button></Link>
            </div>
          )}
        </div>
      )}

      {/* Addresses Tab */}
      {tab === "addresses" && (
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : addresses.length > 0 ? (
            addresses.map((addr: any, i: number) => (
              <div
                key={addr.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-slide-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{addr.name}</p>
                        {addr.isDefault && (
                          <Badge className="bg-green-100 text-green-700 border-0 text-xs">Default</Badge>
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
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-bold text-gray-900 mb-1">No addresses saved</p>
              <p className="text-gray-500 text-sm">Add an address at checkout</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
