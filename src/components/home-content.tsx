"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/product-card";
import { formatPrice, safeJsonParse } from "@/lib/utils";
import { ArrowRight, Clock, Flame, Zap, Star, ChevronLeft, ChevronRight, Sparkles, ShoppingBag } from "lucide-react";

// ─── Types ─────────────────────────────────────────────
interface HomeData {
  featuredProducts: any[];
  newProducts: any[];
  dealProducts: any[];
  categories: any[];
  settings: any;
  allProducts?: any[];
}

// ─── Hero Slides ───────────────────────────────────────
const heroSlides = [
  {
    title: "Trendy Gadgets",
    subtitle: "Style meets technology",
    description: "Sunglasses, watches, earbuds, speakers & more — all at unbeatable prices!",
    gradient: "from-violet-600 via-purple-600 to-fuchsia-600",
    emoji: "🕶️",
    category: "gadgets",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
  },
  {
    title: "Home & Kitchen Gadgets",
    subtitle: "Smart living essentials",
    description: "Spoons, lighters, gas stoves & trendy kitchen gadgets you'll love!",
    gradient: "from-emerald-600 via-teal-600 to-cyan-600",
    emoji: "🍳",
    category: "home-kitchen",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
  },
  {
    title: "Jewellery & Accessories",
    subtitle: "Elegance redefined",
    description: "Gold plated earrings, necklaces, bangles & stunning jewellery for every occasion!",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    emoji: "💎",
    category: "jewellery",
    image: "https://images.unsplash.com/photo-1515562141589-67f0d569b40e?w=1200&q=80",
  },
  {
    title: "Toys & Games",
    subtitle: "Fun for every age",
    description: "Rubik's cubes, RC cars, puzzles, teddy bears & everything kids love!",
    gradient: "from-rose-500 via-pink-500 to-red-500",
    emoji: "🎮",
    category: "toys-games",
    image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=1200&q=80",
  },
];

// ─── Reveal Section ────────────────────────────────────
function RevealSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); observer.unobserve(el); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`transition-all ease-out ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`} style={{ transitionDelay: `${delay}ms`, transitionDuration: "0.8s" }}>
      {children}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────
export function HomeContent({ data }: { data: HomeData }) {
  const { newProducts, categories, allProducts = [] } = data;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timer, setTimer] = useState({ hours: 5, minutes: 59, seconds: 59 });
  const slideInterval = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance slides
  useEffect(() => {
    slideInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => { if (slideInterval.current) clearInterval(slideInterval.current); };
  }, []);

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => {
      setTimer((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const goToSlide = (idx: number) => {
    setCurrentSlide(idx);
    if (slideInterval.current) clearInterval(slideInterval.current);
    slideInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
  };

  const prevSlide = () => goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);
  const nextSlide = () => goToSlide((currentSlide + 1) % heroSlides.length);

  const hotSaleProducts = allProducts.filter((p) => p.price / 100 <= 199);
  const slide = heroSlides[currentSlide];

  return (
    <div className="space-y-0">
      {/* ═══════════ HERO SLIDESHOW ═══════════ */}
      <section className="relative overflow-hidden">
        <div className={`bg-gradient-to-br ${slide.gradient} transition-all duration-700`}>
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 text-8xl animate-float">{slide.emoji}</div>
            <div className="absolute bottom-10 right-10 text-7xl animate-float-delayed">{slide.emoji}</div>
            <div className="absolute top-1/2 left-1/3 text-6xl animate-float" style={{ animationDelay: "2s" }}>{slide.emoji}</div>
          </div>

          {/* Single Full-Width Background Image */}
          <div className="absolute inset-0">
            <Image src={slide.image} alt={slide.title} fill className="object-cover" priority sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28 lg:py-36">
            <div key={currentSlide} className="max-w-xl text-white space-y-6 animate-slide-in-up">
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 px-4 py-1.5 text-sm font-medium">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" /> {slide.subtitle}
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight drop-shadow-2xl">
                {slide.title.split(" ").map((word, i) => (
                  <span key={i} className={i % 2 === 1 ? "text-yellow-300" : ""}>{word} </span>
                ))}
              </h1>
              <p className="text-lg sm:text-xl text-white/90 max-w-md drop-shadow-lg">{slide.description}</p>
              <div className="flex gap-3 pt-2">
                <Link href={`/category/${slide.category}`}>
                  <Button size="lg" className="h-14 px-10 font-bold rounded-2xl bg-white text-gray-900 hover:bg-white/90 shadow-2xl hover:scale-105 transition-all duration-300 text-base">
                    <ShoppingBag className="h-5 w-5 mr-2" /> Shop Now <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Slide Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <button onClick={prevSlide} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            {heroSlides.map((_, i) => (
              <button key={i} onClick={() => goToSlide(i)} className={`h-2.5 rounded-full transition-all duration-300 ${i === currentSlide ? "w-8 bg-white" : "w-2.5 bg-white/40 hover:bg-white/60"}`} />
            ))}
            <button onClick={nextSlide} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════ HOT SALE SECTION ═══════════ */}
      <RevealSection>
        <section className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
          {/* Hot Sale Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20 animate-pulse-glow">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold">🔥 Hot Sale</h2>
                <p className="text-sm text-muted-foreground">Limited time deals — grab them before they&apos;re gone!</p>
              </div>
            </div>
            {/* Countdown Timer */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl px-5 py-3 shadow-lg shadow-red-500/20">
              <Clock className="h-4 w-4 animate-pulse" />
              <span className="text-xs font-medium mr-1">Ends in</span>
              <span className="font-mono font-bold text-lg">{String(timer.hours).padStart(2, "0")}</span>
              <span className="animate-pulse">:</span>
              <span className="font-mono font-bold text-lg">{String(timer.minutes).padStart(2, "0")}</span>
              <span className="animate-pulse">:</span>
              <span className="font-mono font-bold text-lg">{String(timer.seconds).padStart(2, "0")}</span>
            </div>
          </div>

          {/* 3D Animated Price Tabs — Navigate to new page */}
          <div className="flex justify-center gap-3 sm:gap-4 mb-4">
            {[
              { key: "199", label: "Under ₹199", emoji: "🏷️", gradient: "from-pink-500 to-rose-500", shadow: "shadow-pink-500/30", count: allProducts.filter((p) => p.price / 100 <= 199).length },
              { key: "499", label: "Under ₹499", emoji: "🔥", gradient: "from-orange-500 to-amber-500", shadow: "shadow-orange-500/30", count: allProducts.filter((p) => p.price / 100 <= 499).length },
              { key: "999", label: "Under ₹999", emoji: "⚡", gradient: "from-violet-500 to-purple-500", shadow: "shadow-violet-500/30", count: allProducts.filter((p) => p.price / 100 <= 999).length },
            ].map((tab) => (
              <Link key={tab.key} href={`/deals/under-${tab.key}`}>
                <div className={`relative group cursor-pointer transition-all duration-500 bg-gradient-to-r ${tab.gradient} text-white shadow-xl ${tab.shadow} hover:scale-110 hover:-translate-y-2 rounded-2xl px-5 sm:px-8 py-4 sm:py-5 font-bold text-sm sm:text-base`}
                >
                  <span className="mr-1.5 text-lg">{tab.emoji}</span>
                  {tab.label}
                  <div className="text-center text-[11px] text-white/70 font-normal mt-1">{tab.count} products</div>
                </div>
              </Link>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mb-6">👆 Click a tab to see all deals in that price range</p>

          {/* Featured Hot Sale Products (first 4) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {hotSaleProducts.slice(0, 4).map((product: any, i: number) => (
              <RevealSection key={product.id} delay={i * 80}>
                <ProductCard product={product} />
              </RevealSection>
            ))}
          </div>
        </section>
      </RevealSection>

      {/* ═══════════ ALL PRODUCTS ═══════════ */}
      <RevealSection>
        <section className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold">All Products</h2>
            <Link href="/products" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {(allProducts.length > 0 ? allProducts : newProducts).slice(0, 12).map((product: any, i: number) => (
              <RevealSection key={product.id} delay={i * 60}>
                <ProductCard product={product} />
              </RevealSection>
            ))}
          </div>
        </section>
      </RevealSection>

      {/* ═══════════ INSTAGRAM CTA ═══════════ */}
      <RevealSection>
        <section className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-3xl p-8 sm:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Follow Us on Instagram</h2>
            <p className="text-white/80 mb-6 max-w-md mx-auto">Get exclusive deals, new arrivals & behind-the-scenes content!</p>
            <a href="https://www.instagram.com/manatechbazar?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-white/90 font-bold rounded-2xl px-8 shadow-xl hover:scale-105 transition-all duration-300">
                📸 Follow @manatechbazar <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </a>
          </div>
        </section>
      </RevealSection>
    </div>
  );
}
