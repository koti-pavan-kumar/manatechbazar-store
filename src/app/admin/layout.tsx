"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import {
  LayoutDashboard, Package, Tag, Ticket, ClipboardList, Users, Settings,
  ChevronLeft, Menu, Store, LogOut, ExternalLink, Sun, Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";

function ThemeToggleInline() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all min-h-[44px] w-full"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", color: "text-blue-500" },
  { href: "/admin/products", icon: Package, label: "Products", color: "text-purple-500" },
  { href: "/admin/categories", icon: Tag, label: "Categories", color: "text-pink-500" },
  { href: "/admin/coupons", icon: Ticket, label: "Coupons", color: "text-orange-500" },
  { href: "/admin/orders", icon: ClipboardList, label: "Orders", color: "text-green-500" },
  { href: "/admin/customers", icon: Users, label: "Customers", color: "text-cyan-500" },
  { href: "/admin/settings", icon: Settings, label: "Settings", color: "text-gray-500" },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-3" onClick={onNavigate}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-foreground/20 to-primary-foreground/10 flex items-center justify-center border border-white/10">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-base block leading-tight">Mana Tech Bazar</span>
            <span className="text-[11px] text-white/50 font-medium">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label, color }) => {
          const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px]",
                isActive
                  ? "bg-white/10 text-white shadow-lg shadow-black/10 backdrop-blur-sm"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
                isActive ? "bg-white/15" : "bg-white/5"
              )}>
                <Icon className={cn("h-4 w-4", isActive ? "text-white" : color)} />
              </div>
              {label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <ThemeToggleInline />
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all min-h-[44px]"
        >
          <ExternalLink className="h-4 w-4" />
          View Store
        </Link>
        <button
          onClick={() => {
            import("next-auth/react").then(({ signOut }) => signOut({ callbackUrl: "/login" }));
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all min-h-[44px] w-full"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SessionProvider>
      <div className="flex min-h-dvh bg-[#f8f7f4] dark:bg-background">
        {/* Sidebar — Desktop */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 shadow-xl shadow-black/5 z-30">
          <SidebarContent />
        </aside>

        {/* Main area */}
        <div className="flex-1 lg:ml-64 flex flex-col">
          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between bg-card border-b px-4 h-14 shadow-sm sticky top-0 z-20">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-bold text-sm">Mana Tech Bazar — Admin</span>
            <div className="flex items-center gap-1">
              <Link href="/" className="min-h-[44px] min-w-[44px] flex items-center justify-center text-xs text-muted-foreground rounded-lg hover:bg-muted transition-colors">
                Store
              </Link>
              <button
                onClick={() => {
                  import("next-auth/react").then(({ signOut }) => signOut({ callbackUrl: "/login" }));
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-xs text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="w-64 shadow-2xl" onClick={() => setSidebarOpen(false)}>
                <SidebarContent onNavigate={() => setSidebarOpen(false)} />
              </div>
              <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            </div>
          )}

          {/* Main content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
