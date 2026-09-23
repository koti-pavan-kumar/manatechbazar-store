export const dynamic = "force-dynamic";

import { db } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import {
  Package, DollarSign, ShoppingCart, Users, TrendingUp, AlertTriangle, ArrowRight,
  Store, Sparkles, ClipboardList, Eye, Globe2, MousePointerClick,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS } from "@/lib/constants";

export default async function AdminDashboard() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalProducts, totalOrders, totalCustomers, recentOrders, lowStockProducts, topProducts, revenueData,
    visitorsToday, visitors7d, pageviews7d, topPages, countryRows,
  ] =
    await Promise.all([
      db.product.count({ where: { isActive: true } }),
      db.order.count(),
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          guestName: true,
          guestPhone: true,
          user: { select: { name: true, email: true } },
        },
      }),
      db.product.findMany({
        where: { isActive: true, stock: { lte: 5, gte: 0 } },
        orderBy: { stock: "asc" },
        take: 5,
      }),
      db.product.findMany({
        where: { isActive: true },
        orderBy: { orderItems: { _count: "desc" } },
        take: 5,
      }),
      db.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { total: true },
        _count: true,
      }),
      // Analytics: unique visitors today (last 30 days window kept small for speed)
      db.pageView.findMany({
        where: { createdAt: { gte: startOfToday } },
        distinct: ["sessionId"],
        select: { sessionId: true },
      }),
      db.pageView.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        distinct: ["sessionId"],
        select: { sessionId: true },
      }),
      db.pageView.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      db.pageView.groupBy({
        by: ["path"],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { _all: true },
        orderBy: { _count: { path: "desc" } },
        take: 6,
      }),
      db.pageView.groupBy({
        by: ["country"],
        where: { createdAt: { gte: thirtyDaysAgo }, country: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { country: "desc" } },
        take: 5,
      }),
    ]);

  // Raw SQL: unique visitors per source (Prisma groupBy can't do COUNT(DISTINCT))
  const sourceRows = await db.$queryRaw<
    { source: string; visitors: bigint; views: bigint }[]
  >`SELECT source, COUNT(DISTINCT "sessionId") AS visitors, COUNT(*) AS views FROM "PageView" WHERE "createdAt" >= ${thirtyDaysAgo} GROUP BY source ORDER BY views DESC LIMIT 8`;

  const totalPageviews30d = await db.pageView.count({ where: { createdAt: { gte: thirtyDaysAgo } } });
  const sourceTotal = sourceRows.reduce((s, r) => s + Number(r.views), 0) || 1;

  const SOURCE_META: Record<string, { label: string; emoji: string; color: string }> = {
    direct: { label: "Direct / typed URL", emoji: "🔗", color: "text-blue-600 bg-blue-50" },
    instagram: { label: "Instagram", emoji: "📸", color: "text-pink-600 bg-pink-50" },
    google: { label: "Google Search", emoji: "🔍", color: "text-green-600 bg-green-50" },
    facebook: { label: "Facebook", emoji: "📘", color: "text-blue-700 bg-blue-50" },
    youtube: { label: "YouTube", emoji: "▶️", color: "text-red-600 bg-red-50" },
    whatsapp: { label: "WhatsApp", emoji: "💬", color: "text-emerald-600 bg-emerald-50" },
    telegram: { label: "Telegram", emoji: "✈️", color: "text-sky-600 bg-sky-50" },
    twitter: { label: "X / Twitter", emoji: "🐦", color: "text-slate-600 bg-slate-50" },
    bing: { label: "Bing Search", emoji: "🔍", color: "text-cyan-600 bg-cyan-50" },
    duckduckgo: { label: "DuckDuckGo", emoji: "🦆", color: "text-orange-600 bg-orange-50" },
    reddit: { label: "Reddit", emoji: "🤖", color: "text-red-500 bg-red-50" },
    pinterest: { label: "Pinterest", emoji: "📌", color: "text-rose-600 bg-rose-50" },
    linkedin: { label: "LinkedIn", emoji: "💼", color: "text-blue-800 bg-blue-50" },
  };

  const sourceLabel = (s: string) => SOURCE_META[s] || { label: s, emoji: "🌐", color: "text-gray-600 bg-gray-50" };

  const totalRevenue = revenueData._sum.total || 0;
  const totalPaidOrders = revenueData._count || 0;

  const stats = [
    {
      label: "Total Revenue",
      value: formatPrice(totalRevenue),
      subtitle: `${totalPaidOrders} paid orders`,
      icon: DollarSign,
      gradient: "from-emerald-500 to-green-600",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      subtitle: "All time",
      icon: ShoppingCart,
      gradient: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      label: "Products",
      value: totalProducts,
      subtitle: "Active listings",
      icon: Package,
      gradient: "from-purple-500 to-violet-600",
      bgLight: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      label: "Customers",
      value: totalCustomers,
      subtitle: "Registered users",
      icon: Users,
      gradient: "from-orange-500 to-amber-600",
      bgLight: "bg-orange-50",
      textColor: "text-orange-700",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
        </div>
        <Link href="/" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white border shadow-sm text-sm font-medium hover:shadow-md transition-shadow">
          <Store className="h-4 w-4 text-gray-500" />
          View Store
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Store Traffic */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Eye className="h-5 w-5 text-indigo-500" />
            Store Traffic
            <span className="text-xs font-normal text-gray-400">(last 30 days)</span>
          </h2>
          <span className="text-xs text-gray-400">Anonymous, cookie-free analytics</span>
        </div>
        <div className="px-5 pb-5 space-y-5">
          {/* Headline numbers */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
              <p className="text-2xl font-black">{visitorsToday.length}</p>
              <p className="text-[11px] opacity-90 mt-0.5">Visitors today</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-2xl font-black text-gray-900">{visitors7d.length}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Visitors (7 days)</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-2xl font-black text-gray-900">{totalPageviews30d}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Page views (30 days)</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Traffic sources */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <MousePointerClick className="h-3.5 w-3.5" /> Where visitors come from
              </p>
              {sourceRows.length > 0 ? (
                <div className="space-y-2">
                  {sourceRows.map((row) => {
                    const meta = sourceLabel(row.source);
                    const pct = Math.round((Number(row.views) / sourceTotal) * 100);
                    return (
                      <div key={row.source} className="p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-800 flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-md ${meta.color} flex items-center justify-center text-xs`}>{meta.emoji}</span>
                            {meta.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            <strong className="text-gray-900">{Number(row.visitors)}</strong> visitors · {pct}%
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-4 text-center">No visitors tracked yet</p>
              )}
            </div>

            {/* Top pages + countries */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Globe2 className="h-3.5 w-3.5" /> Most viewed pages
                </p>
                {topPages.length > 0 ? (
                  <div className="space-y-1.5">
                    {topPages.map((p) => (
                      <div key={p.path} className="flex items-center justify-between text-sm px-2.5 py-1.5 rounded-lg hover:bg-gray-50">
                        <span className="font-mono text-xs text-gray-600 truncate max-w-[60%]">{p.path}</span>
                        <span className="text-xs font-bold text-gray-900">{p._count._all}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 py-2">—</p>
                )}
              </div>
              {countryRows.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">🌍 Top countries</p>
                  <div className="flex flex-wrap gap-1.5">
                    {countryRows.map((c) => (
                      <span key={c.country} className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                        {c.country} · {c._count._all}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-500" />
              Recent Orders
            </h2>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="px-5 pb-5">
            {recentOrders.length > 0 ? (
              <div className="space-y-2">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">#{order.orderNumber?.slice(-2)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">#{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">{order.guestName || order.user?.name || "Guest"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-gray-900">{formatPrice(order.total)}</p>
                      <Badge className={ORDER_STATUS[order.status]?.color || ""} variant="secondary">
                        {ORDER_STATUS[order.status]?.label || order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Low Stock Alerts
            </h2>
            <Link href="/admin/products" className="text-sm text-primary hover:underline font-medium">Manage</Link>
          </div>
          <div className="px-5 pb-5">
            {lowStockProducts.length > 0 ? (
              <div className="space-y-2">
                {lowStockProducts.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                    <Badge variant={p.stock === 0 ? "destructive" : "warning"} className="shrink-0 ml-2">
                      {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Sparkles className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">All products well-stocked</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top Selling Products
            </h2>
            <Link href="/admin/products" className="text-sm text-primary hover:underline font-medium">View All</Link>
          </div>
          <div className="px-5 pb-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {topProducts.map((p: any, i: number) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <span className="text-lg font-bold text-gray-300 w-8">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                    <p className="text-sm font-bold text-gray-700">{formatPrice(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
