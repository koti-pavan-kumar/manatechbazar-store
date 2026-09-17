"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users, Search, ChevronLeft, ChevronRight, Mail, Phone,
  ShoppingBag, IndianRupee, Calendar, ArrowUpDown, Loader2,
  Crown, TrendingUp, UserCheck, Clock,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  joinedAt: string;
  totalOrders: number;
  totalSpent: number;
  deliveredOrders: number;
  lastOrderDate: string | null;
}

interface CustomersResponse {
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminCustomersPage() {
  const [data, setData] = useState<CustomersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search,
        sortBy,
        sortOrder,
      });
      const res = await fetch(`/api/admin/customers?${params}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(debounce);
  }, [page, search, sortBy, sortOrder]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Compute summary stats from current page
  const stats = data
    ? {
        totalCustomers: data.pagination.total,
        totalRevenue: data.customers.reduce((s, c) => s + c.totalSpent, 0),
        avgOrderValue:
          data.customers.reduce((s, c) => s + c.totalSpent, 0) /
            Math.max(data.customers.reduce((s, c) => s + c.totalOrders, 0), 1) || 0,
        repeatCustomers: data.customers.filter((c) => c.totalOrders > 1).length,
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage and view all registered customers
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                  <p className="text-xs text-muted-foreground">Total Customers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <IndianRupee className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground">Revenue (shown)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatPrice(stats.avgOrderValue)}</p>
                  <p className="text-xs text-muted-foreground">Avg Order Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <UserCheck className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.repeatCustomers}</p>
                  <p className="text-xs text-muted-foreground">Repeat Buyers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sort Controls */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "createdAt", label: "Join Date" },
          { key: "name", label: "Name" },
        ].map((s) => (
          <Button
            key={s.key}
            variant={sortBy === s.key ? "default" : "outline"}
            size="sm"
            onClick={() => toggleSort(s.key)}
          >
            {s.label}
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ))}
      </div>

      {/* Customer List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data?.customers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No customers found</p>
            <p className="text-muted-foreground">
              {search ? "Try a different search term" : "No customers have registered yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data?.customers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Customer Info */}
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                      {customer.image ? (
                        <img
                          src={customer.image}
                          alt={customer.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          {customer.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base">{customer.name}</h3>
                        {customer.totalOrders > 5 && (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">
                            <Crown className="h-3 w-3 mr-1" />
                            VIP
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {customer.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Joined {new Date(customer.joinedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right: Stats */}
                  <div className="flex items-center gap-6 sm:gap-8 pl-16 sm:pl-0">
                    <div className="text-center">
                      <p className="text-xl font-bold">{customer.totalOrders}</p>
                      <p className="text-xs text-muted-foreground">Orders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-green-600">
                        {formatPrice(customer.totalSpent)}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Spent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold">{customer.deliveredOrders}</p>
                      <p className="text-xs text-muted-foreground">Delivered</p>
                    </div>
                    <div className="text-center hidden sm:block">
                      <p className="text-sm font-medium">
                        {customer.lastOrderDate
                          ? new Date(customer.lastOrderDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })
                          : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">Last Order</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(data.pagination.page - 1) * data.pagination.limit + 1} to{" "}
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{" "}
            {data.pagination.total} customers
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm font-medium px-3">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
