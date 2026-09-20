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
    category: "gadgets",
    image: "https://res.cloudinary.com/j8ly7tsg/image/upload/v1789893576/hzhszbzy8nhh5awjn9ph.png",
  },
  {
    title: "Home & Kitchen",
    subtitle: "Smart living essentials",
    description: "Spoons, lighters, gas stoves & trendy kitchen gadgets you'll love!",
    category: "home-kitchen",
    image: "https://res.cloudinary.com/j8ly7tsg/image/upload/v1789893632/mwbzdbixtvwc7rcb6laz.png",
  },
  {
    title: "Jewellery & Fashion",
    subtitle: "Elegance redefined",
    description: "Gold plated earrings, necklaces, bangles & stunning jewellery for every occasion!",
    category: "jewellery",
    image: "https://res.cloudinary.com/j8ly7tsg/image/upload/v1789893601/gahsnav4taz0tvlzw2ev.png",
  },
  {
    title: "Toys & Games",
    subtitle: "Fun for every age",
    description: "Rubik's cubes, RC cars, puzzles, teddy bears & everything kids love!",
    category: "toys-games",
    image: "https://res.cloudinary.com/j8ly7tsg/image/upload/v1789893668/kqugkrx0fet1saqhosau.png",
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
        <Link href={`/category/${slide.category}`} className="block group">
          <div className="relative h-[55vh] sm:h-[65vh] lg:h-[75vh] overflow-hidden">
            {/* Full-Screen Background Image */}
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover transition-transform duration-[8000ms] ease-out group-hover:scale-105"
              priority
              sizes="100vw"
            />

            {/* Gradient overlays for text readability — left side strong, right side light */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

            {/* Text Content — left-aligned, large, bold */}
            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto max-w-7xl w-full px-6 sm:px-8">
                <div key={currentSlide} className="max-w-xl space-y-4 sm:space-y-5 animate-fade-in-up">
                  <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-4 py-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                    <span className="text-white/95 text-sm font-medium">{slide.subtitle}</span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight">
                    {slide.title.includes("&") ? (
                      <>
                        {slide.title.split("&")[0]}<span className="text-yellow-400">&</span>{slide.title.split("&")[1]}
                      </>
                    ) : (
                      <>{slide.title.split(" ").map((word, i) => (
                        <span key={i}>{word} </span>
                      ))}</>
                    )}
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl text-white/85 max-w-md leading-relaxed">
                    {slide.description}
                  </p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-2 h-12 sm:h-14 px-8 sm:px-10 font-bold rounded-2xl bg-white text-gray-900 shadow-2xl transition-all duration-300 group-hover:scale-105 text-sm sm:text-base">
                      <ShoppingBag className="h-5 w-5" /> Shop Now <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Slide Controls — positioned below the slide */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
          <button onClick={prevSlide} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => goToSlide(i)} className={`h-2.5 rounded-full transition-all duration-300 ${i === currentSlide ? "w-8 bg-white" : "w-2.5 bg-white/40 hover:bg-white/60"}`} />
          ))}
          <button onClick={nextSlide} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* ═══════════ HOT SALE SECTION ═══════════ */}
      <RevealSection>
        <section className="mx-auto max-w-7xl px-4 py-8 sm:py-12 overflow-hidden">
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
              { key: "199", label: "₹199", emoji: "🏷️", gradient: "from-pink-500 to-rose-500", shadow: "shadow-pink-500/30", count: allProducts.filter((p) => p.price / 100 <= 199).length },
              { key: "499", label: "₹499", emoji: "🔥", gradient: "from-orange-500 to-amber-500", shadow: "shadow-orange-500/30", count: allProducts.filter((p) => p.price / 100 <= 499).length },
              { key: "999", label: "₹999", emoji: "⚡", gradient: "from-violet-500 to-purple-500", shadow: "shadow-violet-500/30", count: allProducts.filter((p) => p.price / 100 <= 999).length },
            ].map((tab) => (
              <Link key={tab.key} href={`/deals?max=${tab.key}`}>
                <div className={`relative group cursor-pointer transition-all duration-500 bg-gradient-to-br ${tab.gradient} text-white shadow-xl ${tab.shadow} hover:scale-110 hover:-translate-y-2 rounded-full w-28 h-28 sm:w-36 sm:h-36 flex flex-col items-center justify-center overflow-hidden`}
                >
                  {/* 3D glow ring on hover */}
                  <div className="absolute inset-1 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-all duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent" />
                  <span className="text-lg sm:text-xl mb-0.5 relative z-10 drop-shadow-lg">{tab.emoji}</span>
                  <span className="text-2xl sm:text-4xl lg:text-5xl font-black relative z-10 tracking-tight leading-none price-3d"
                  >{tab.label}</span>
                  <div className="text-center text-[10px] sm:text-[11px] text-white/80 font-medium mt-1 relative z-10 tracking-wide">{tab.count} items</div>
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
