"use client";

import Link from "next/link";
import { Search, ShoppingCart, Heart, Menu, User } from "lucide-react";
import { Instagram } from "@/components/ui/icon-instagram";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCartStore } from "@/stores/cart";
import { useWishlistStore } from "@/stores/wishlist";
import { useSession, signIn } from "next-auth/react";
import { LayoutDashboard } from "lucide-react";
import { useState } from "react";

export function Header() {
  const totalItems = useCartStore((s) => s.getTotalItems());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminPhone, setAdminPhone] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError("");
    try {
      const result = await signIn("credentials", {
        phone: adminPhone,
        password: adminPassword,
        redirect: false,
      });
      if (result?.error) {
        setAdminError("Invalid admin credentials");
      } else {
        // Check if user is actually admin
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        if (sessionData?.user?.role === "ADMIN") {
          window.location.href = "/admin";
        } else {
          setAdminError("This account is not an admin account");
        }
      }
    } catch {
      setAdminError("Something went wrong");
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Animated announcement strip */}
        <div className="bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee py-1.5">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="mx-8 text-xs sm:text-sm font-medium">
                🔥 FLAT 20% OFF on first order — Use code <span className="font-bold">WELCOME20</span> 🔥 Free Shipping ₹499+ ⚡ UPI Available ✨ Follow @manatechbazar
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between gap-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl sm:text-2xl font-bold tracking-tight">Mana Tech Bazar</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 ml-8">
            <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
              Shop
            </Link>
            <Link href="/category/gadgets" className="text-sm font-medium hover:text-primary transition-colors">
              Gadgets
            </Link>
            <Link href="/category/home-kitchen" className="text-sm font-medium hover:text-primary transition-colors">
              Kitchen
            </Link>
            <Link href="/category/jewellery" className="text-sm font-medium hover:text-primary transition-colors">
              Jewellery
            </Link>
            <Link href="/category/toys-games" className="text-sm font-medium hover:text-primary transition-colors">
              Toys
            </Link>
            <Link href="/offers" className="text-sm font-medium hover:text-primary transition-colors text-orange-600">
              Offers
            </Link>
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <ThemeToggle />

            {/* If admin is logged in, show admin dashboard link */}
            {isAdmin ? (
              <Link href="/admin">
                <Button variant="ghost" size="icon" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950" title="Admin Dashboard">
                  <LayoutDashboard className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              /* Admin login button — opens modal */
              <Button variant="ghost" size="icon" onClick={() => setAdminModalOpen(true)} title="Admin Login">
                <User className="h-5 w-5" />
              </Button>
            )}

            <Link href="/products" aria-label="Search">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Search className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/wishlist" aria-label="Wishlist" className="relative">
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-bold">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/cart" aria-label="Cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-background animate-slide-up">
            <nav className="px-4 py-4 space-y-2">
              <Link href="/products" className="block py-3 px-4 rounded-lg hover:bg-accent font-medium min-h-[44px] flex items-center" onClick={() => setMobileMenuOpen(false)}>
                Shop All
              </Link>
              <Link href="/offers" className="block py-3 px-4 rounded-lg hover:bg-accent font-medium min-h-[44px] flex items-center text-orange-600" onClick={() => setMobileMenuOpen(false)}>
                Offers & Deals
              </Link>
              <Link href="/wishlist" className="block py-3 px-4 rounded-lg hover:bg-accent font-medium min-h-[44px] flex items-center" onClick={() => setMobileMenuOpen(false)}>
                ❤️ My Wishlist
              </Link>
              <a href="https://www.instagram.com/manatechbazar?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-3 px-4 rounded-lg hover:bg-accent font-medium min-h-[44px]">
                <Instagram className="h-5 w-5" /> Follow on Instagram
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* ═══════════ ADMIN LOGIN MODAL ═══════════ */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setAdminModalOpen(false); setAdminError(""); }} />

          {/* Modal */}
          <div className="relative bg-card rounded-2xl border shadow-2xl p-6 sm:p-8 w-full max-w-sm animate-scale-in">
            <button
              onClick={() => { setAdminModalOpen(false); setAdminError(""); }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center mb-3">
                <LayoutDashboard className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-xl font-bold">Admin Login</h2>
              <p className="text-sm text-muted-foreground mt-1">Access the admin dashboard</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              {adminError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {adminError}
                </div>
              )}

              <div>
                <Label htmlFor="admin-phone">Phone Number</Label>
                <Input
                  id="admin-phone"
                  type="tel"
                  placeholder="Admin phone number"
                  className="h-12 rounded-xl mt-1"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Admin password"
                  className="h-12 rounded-xl mt-1"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" size="lg" className="w-full h-12 rounded-xl font-semibold" disabled={adminLoading}>
                {adminLoading ? "Logging in..." : "Login to Admin Panel"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
