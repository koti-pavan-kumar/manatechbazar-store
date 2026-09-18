"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, Menu, Heart } from "lucide-react";
import { Instagram } from "@/components/ui/icon-instagram";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCartStore } from "@/stores/cart";
import { useWishlistStore } from "@/stores/wishlist";
import { useState } from "react";

export function Header() {
  const totalItems = useCartStore((s) => s.getTotalItems());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Animated announcement strip */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee py-1.5">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="mx-8 text-xs sm:text-sm font-medium">
              🔥 FLAT 20% OFF on first order — Use code <span className="font-bold">WELCOME20</span> 🔥 Free Shipping ₹499+ ⚡ UPI & COD Available ✨ Follow @manatechbazar
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
          <Link href="/category/t-shirts" className="text-sm font-medium hover:text-primary transition-colors">
            T-Shirts
          </Link>
          <Link href="/category/accessories" className="text-sm font-medium hover:text-primary transition-colors">
            Accessories
          </Link>
          <Link href="/offers" className="text-sm font-medium hover:text-primary transition-colors text-orange-600">
            Offers
          </Link>
          <Link href="/wishlist" className="text-sm font-medium hover:text-primary transition-colors">
            Wishlist
          </Link>
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />

          <Link href="/products" aria-label="Search">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          <Link href="/account" aria-label="Account">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
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
            <Link href="/account" className="block py-3 px-4 rounded-lg hover:bg-accent font-medium min-h-[44px] flex items-center" onClick={() => setMobileMenuOpen(false)}>
              My Account
            </Link>
            <a href="https://www.instagram.com/manatechbazar?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-3 px-4 rounded-lg hover:bg-accent font-medium min-h-[44px]">
              <Instagram className="h-5 w-5" /> Follow on Instagram
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
