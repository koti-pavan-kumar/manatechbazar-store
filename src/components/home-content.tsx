"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Truck, Shield, CreditCard, Star, Sparkles, Zap, ShoppingBag } from "lucide-react";
import { Instagram } from "@/components/ui/icon-instagram";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, safeJsonParse } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

const INSTAGRAM_URL = "https://www.instagram.com/manatechbazar?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==";

// Hero floating product images
const heroProducts = [
  { src: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80", rotate: -8, delay: 0 },
  { src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80", rotate: 5, delay: 0.2 },
  { src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", rotate: -3, delay: 0.4 },
  { src: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80", rotate: 7, delay: 0.6 },
];

interface HomeData {
  featuredProducts: any[];
  newProducts: any[];
  dealProducts: any[];
  categories: any[];
  settings: any;
}

// Scroll reveal component
function RevealSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-800 ease-out ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}
      style={{ transitionDelay: `${delay}ms`, transitionDuration: "0.8s" }}
    >
      {children}
    </div>
  );
}

export function HomeContent({ data }: { data: HomeData }) {
  const { featuredProducts, newProducts, dealProducts, categories, settings } = data;
  const [dealTimeLeft, setDealTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setDealTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { minutes--; seconds = 59; }
        if (minutes < 0) { hours--; minutes = 59; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-0">
      {/* ═══════════════════════════════════════════════════════
          HERO SECTION — Animated gradient + floating products
      ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white min-h-[70vh] lg:min-h-[80vh] flex items-center">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-purple-600/20 to-orange-500/20 animate-hero-gradient opacity-60" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23ffffff' fill-opacity='1'%3e%3cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }} />

        {/* Floating product images (desktop only) */}
        <div className="hidden lg:block">
          {heroProducts.map((p, i) => (
            <div
              key={i}
              className="absolute w-36 h-44 xl:w-44 xl:h-52 rounded-2xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-1000"
              style={{
                top: `${15 + i * 18}%`,
                right: `${5 + (i % 2) * 15}%`,
                transform: `rotate(${p.rotate}deg)`,
                animation: `float ${6 + i}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
                opacity: mounted ? 1 : 0,
                transitionDelay: `${400 + i * 200}ms`,
              }}
            >
              <img src={p.src} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          ))}
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-56 h-56 bg-orange-500/10 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: "2s" }} />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:py-20 lg:py-28">
          <div className="max-w-2xl">
            <Badge
              variant="secondary"
              className={`mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm text-sm px-4 py-1.5 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5 inline" />
              New Arrivals Every Week
            </Badge>

            <h1
              className={`text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1] transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              Shop the{" "}
              <span className="gradient-text">Best Deals</span>
              <br />
              on Trending Products
            </h1>

            <p
              className={`text-lg sm:text-xl text-white/70 mb-10 max-w-lg leading-relaxed transition-all duration-700 delay-400 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              Curated fashion, accessories & lifestyle products.
              Free delivery above ₹499. Trusted by 10,000+ happy customers.
            </p>

            <div
              className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <Link href="/products">
                <Button size="lg" className="bg-white text-gray-900 hover:bg-white/90 w-full sm:w-auto h-14 px-8 text-base font-semibold rounded-2xl shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/20 transition-all duration-300 hover:scale-105">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Shop Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto h-14 px-8 text-base font-semibold rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105">
                  <Instagram className="h-5 w-5 mr-2" />
                  Follow Us
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div
              className={`flex items-center gap-8 mt-12 transition-all duration-700 delay-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <div>
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm text-white/50">Happy Customers</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-white/50">Products</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <div className="text-2xl font-bold flex items-center gap-1">4.8 <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /></div>
                <div className="text-sm text-white/50">Store Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="var(--background)" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TRUST SIGNALS — Animated bar with icons
      ═══════════════════════════════════════════════════════ */}
      <RevealSection>
        <section className="border-b bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-5">
            <div className="grid grid-cols-3 gap-4 text-center text-xs sm:text-sm">
              <div className="flex items-center justify-center gap-2 group cursor-default">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Truck className="h-4 w-4 text-green-600" />
                </div>
                <span className="font-medium">Free Shipping ₹499+</span>
              </div>
              <div className="flex items-center justify-center gap-2 group cursor-default">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium">Secure Payment</span>
              </div>
              <div className="flex items-center justify-center gap-2 group cursor-default">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Zap className="h-4 w-4 text-purple-600" />
                </div>
                <span className="font-medium">UPI & COD Available</span>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ═══════════════════════════════════════════════════════
          CATEGORIES — 3D hover tiles with zoom
      ═══════════════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <RevealSection>
          <section className="mx-auto max-w-7xl px-4 py-10 lg:py-14">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Shop by Category</h2>
                <p className="text-muted-foreground mt-1">Find what you love</p>
              </div>
              <Link href="/products" className="text-sm font-medium text-primary hover:underline flex items-center gap-1 group">
                View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((cat: any, i: number) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group flex flex-col items-center gap-3"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="aspect-square w-full rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-primary/50 transition-all duration-300 img-zoom shadow-md group-hover:shadow-xl">
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl bg-muted">
                        {cat.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-center group-hover:text-primary transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </RevealSection>
      )}

      {/* ═══════════════════════════════════════════════════════
          DEAL OF THE DAY — Pulsing countdown + grid
      ═══════════════════════════════════════════════════════ */}
      {dealProducts.length > 0 && (
        <RevealSection>
          <section className="mx-auto max-w-7xl px-4 py-10 lg:py-14">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  <span className="animate-wave text-3xl">🔥</span>
                  Deal of the Day
                </h2>
                <div className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-red-500/20 animate-pulse-glow">
                  <Clock className="h-4 w-4" />
                  <span className="tabular-nums">
                    {String(dealTimeLeft.hours).padStart(2, "0")}:
                    {String(dealTimeLeft.minutes).padStart(2, "0")}:
                    {String(dealTimeLeft.seconds).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {dealProducts.map((product: any, i: number) => (
                <ProductCard key={product.id} product={product} priority={i < 4} />
              ))}
            </div>
          </section>
        </RevealSection>
      )}

      {/* ═══════════════════════════════════════════════════════
          FEATURED PRODUCTS — With scroll reveal
      ═══════════════════════════════════════════════════════ */}
      {featuredProducts.length > 0 && (
        <RevealSection>
          <section className="mx-auto max-w-7xl px-4 py-10 lg:py-14">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  <span className="text-3xl">⭐</span> Featured Products
                </h2>
                <p className="text-muted-foreground mt-1">Handpicked just for you</p>
              </div>
              <Link href="/products" className="text-sm font-medium text-primary hover:underline flex items-center gap-1 group">
                View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product: any, i: number) => (
                <ProductCard key={product.id} product={product} priority={i < 4} />
              ))}
            </div>
          </section>
        </RevealSection>
      )}

      {/* ═══════════════════════════════════════════════════════
          NEW ARRIVALS — With stagger animation
      ═══════════════════════════════════════════════════════ */}
      {newProducts.length > 0 && (
        <RevealSection>
          <section className="mx-auto max-w-7xl px-4 py-10 lg:py-14">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  <span className="text-3xl">🆕</span> New Arrivals
                </h2>
                <p className="text-muted-foreground mt-1">Fresh styles just dropped</p>
              </div>
              <Link href="/products?sort=newest" className="text-sm font-medium text-primary hover:underline flex items-center gap-1 group">
                View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {newProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </RevealSection>
      )}

      {/* ═══════════════════════════════════════════════════════
          MARQUEE BANNER — Scrolling promo text
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-primary text-primary-foreground py-4 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 mx-8 text-sm sm:text-base font-semibold uppercase tracking-wider">
              <span>🔥 FLAT 20% OFF</span>
              <span className="text-primary-foreground/50">✦</span>
              <span>Use code WELCOME20</span>
              <span className="text-primary-foreground/50">✦</span>
              <span>Free Shipping ₹499+</span>
              <span className="text-primary-foreground/50">✦</span>
              <span>UPI & COD Available</span>
              <span className="text-primary-foreground/50">✦</span>
              <span>Follow @manatechbazar</span>
              <span className="text-primary-foreground/50">✦</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          INSTAGRAM CTA — Gradient + floating images
      ═══════════════════════════════════════════════════════ */}
      <RevealSection>
        <section className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 text-white">
          {/* Animated gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 animate-hero-gradient opacity-60" />

          {/* Floating mini product images */}
          <div className="hidden md:block">
            <div className="absolute top-8 left-8 w-20 h-20 rounded-xl overflow-hidden shadow-lg rotate-[-10deg] opacity-40 animate-float border border-white/20">
              <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-8 right-12 w-24 h-24 rounded-xl overflow-hidden shadow-lg rotate-[8deg] opacity-40 animate-float-delayed border border-white/20">
              <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-12 right-20 w-16 h-16 rounded-xl overflow-hidden shadow-lg rotate-[-5deg] opacity-30 animate-float border border-white/20" style={{ animationDelay: "1s" }}>
              <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80" alt="" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Instagram className="h-8 w-8" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Follow us on Instagram</h2>
            <p className="text-lg opacity-90 mb-8 max-w-md mx-auto">
              Get exclusive deals, new arrivals, and behind-the-scenes content daily!
            </p>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 h-14 px-8 text-base font-semibold rounded-2xl shadow-xl shadow-black/10 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <Instagram className="h-5 w-5 mr-2" />
                @manatechbazar
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </a>
          </div>
        </section>
      </RevealSection>

      {/* ═══════════════════════════════════════════════════════
          WHATSAPP — Green gradient with floating phone
      ═══════════════════════════════════════════════════════ */}
      <RevealSection>
        <section className="mx-auto max-w-7xl px-4 py-12 lg:py-16">
          <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-100 p-8 sm:p-12">
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-200/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-emerald-200/30 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  ACTIVE ON WHATSAPP
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">Stay in the Loop</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Join our WhatsApp community for instant updates on new arrivals, exclusive deals, and styling tips!
                </p>
                <a
                  href="https://wa.me/919999999999?text=Hi!%20I%20want%20to%20join%20your%20updates"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="bg-green-500 hover:bg-green-600 h-12 px-8 text-base font-semibold rounded-2xl shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 hover:scale-105">
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Join WhatsApp Group
                  </Button>
                </a>
              </div>

              {/* Phone mockup */}
              <div className="hidden md:block flex-shrink-0">
                <div className="w-48 h-80 bg-white rounded-[2rem] shadow-2xl border-4 border-gray-200 p-3 relative">
                  <div className="w-full h-full bg-green-50 rounded-[1.5rem] flex flex-col items-center justify-center gap-3 p-4">
                    <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-green-700 text-center">Join 500+ members</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>
    </div>
  );
}
