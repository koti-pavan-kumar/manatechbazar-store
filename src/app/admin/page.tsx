import { db } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import {
  Package, DollarSign, ShoppingCart, Users, TrendingUp, AlertTriangle, ArrowRight,
  Store, Sparkles, ClipboardList,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS } from "@/lib/constants";

export default async function AdminDashboard() {
  const [totalProducts, totalOrders, totalCustomers, recentOrders, lowStockProducts, topProducts, revenueData] =
    await Promise.all([
      db.product.count({ where: { isActive: true } }),
      db.order.count(),
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { name: true, email: true } } },
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
    ]);

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
                        <p className="text-xs text-gray-500">{order.user.name}</p>
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
