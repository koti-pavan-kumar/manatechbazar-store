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
    gradient: "from-indigo-900 via-purple-900 to-violet-900",
    accentColor: "#818cf8",
    category: "gadgets",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1920&q=85",
    products: [
      "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&q=80",
      "https://images.unsplash.com/photo-1625245488600-f03fef636a3c?w=400&q=80",
      "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400&q=80",
    ],
    productLabels: ["Earbuds", "Smartwatch", "Speaker"],
  },
  {
    title: "Home & Kitchen",
    subtitle: "Smart living essentials",
    description: "Spoons, lighters, gas stoves & trendy kitchen gadgets you'll love!",
    gradient: "from-emerald-900 via-teal-800 to-cyan-900",
    accentColor: "#2dd4bf",
    category: "home-kitchen",
    image: "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=1920&q=85",
    products: [
      "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80",
      "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=400&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
    ],
    productLabels: ["Utensils", "Spice Set", "Cookware"],
  },
  {
    title: "Jewellery &\nAccessories",
    subtitle: "Elegance redefined",
    description: "Gold plated earrings, necklaces, bangles & stunning jewellery for every occasion!",
    gradient: "from-amber-900 via-rose-900 to-pink-900",
    accentColor: "#f59e0b",
    category: "jewellery",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1920&q=85",
    products: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80",
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&q=80",
    ],
    productLabels: ["Necklace", "Bangles", "Earrings"],
  },
  {
    title: "Toys & Games",
    subtitle: "Fun for every age",
    description: "Rubik's cubes, RC cars, puzzles, teddy bears & everything kids love!",
    gradient: "from-blue-900 via-indigo-900 to-purple-900",
    accentColor: "#818cf8",
    category: "toys-games",
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=1920&q=85",
    products: [
      "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400&q=80",
      "https://images.unsplash.com/photo-1566576782541-d6c5e51f4d48?w=400&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80",
    ],
    productLabels: ["Building Blocks", "RC Car", "Puzzle"],
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
        <Link href={`/category/${slide.category}`} className="block">
          <div className={`relative bg-gradient-to-br ${slide.gradient} transition-all duration-700 cursor-pointer group`}>
            {/* Full-Width Background Image with Ken Burns zoom */}
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover transition-transform duration-[8000ms] ease-out group-hover:scale-110"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Floating Product Cards with 3D entrance */}
            <div className="absolute right-4 sm:right-8 lg:right-16 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-3">
              {(slide as any).products?.map((pImg: string, idx: number) => (
                <div
                  key={idx}
                  className="relative w-28 h-28 lg:w-36 lg:h-36 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 backdrop-blur-sm bg-white/10 animate-float-card"
                  style={{
                    animationDelay: `${idx * 200}ms`,
                    transform: `perspective(800px) rotateY(-8deg) rotateX(${idx * 3 - 3}deg)`,
                  }}
                >
                  <Image src={pImg} alt={(slide as any).productLabels?.[idx] || ""} fill className="object-cover" sizes="150px" />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-[10px] lg:text-xs font-semibold truncate">{(slide as any).productLabels?.[idx]}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile: Show small floating product thumbnails */}
            <div className="absolute right-3 bottom-20 flex md:hidden gap-2">
              {(slide as any).products?.slice(0, 2).map((pImg: string, idx: number) => (
                <div
                  key={idx}
                  className="relative w-16 h-16 rounded-xl overflow-hidden shadow-xl border-2 border-white/20"
                  style={{ animationDelay: `${idx * 200}ms` }}
                >
                  <Image src={pImg} alt="" fill className="object-cover" sizes="64px" />
                </div>
              ))}
            </div>

            {/* Text Content with staggered animation */}
            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24 lg:py-32">
              <div key={currentSlide} className="max-w-lg text-white space-y-5">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                  <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="text-white/90">{slide.subtitle}</span>
                </div>
                <h1
                  className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.1] drop-shadow-2xl animate-fade-in-up whitespace-pre-line"
                  style={{ animationDelay: "200ms" }}
                >
                  {slide.title.split(/(\s|\n)/).map((word, i) => {
                    if (word === "\n") return <br key={i} />;
                    const isAccent = ["Gadgets", "Kitchen", "Jewellery", "Accessories", "Games", "&"].includes(word);
                    return isAccent ? (
                      <span key={i} className="bg-gradient-to-r from-yellow-300 to-amber-300 bg-clip-text text-transparent">{word} </span>
                    ) : (
                      <span key={i}>{word} </span>
                    );
                  })}
                </h1>
                <p className="text-base sm:text-lg text-white/80 max-w-md drop-shadow-lg animate-fade-in-up" style={{ animationDelay: "350ms" }}>
                  {slide.description}
                </p>
                <div className="pt-2 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
                  <span className="inline-flex items-center h-13 sm:h-14 px-8 sm:px-10 font-bold rounded-2xl bg-white text-gray-900 shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-white/20 text-sm sm:text-base">
                    <ShoppingBag className="h-5 w-5 mr-2" /> Shop Now <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </div>

            {/* Slide Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevSlide(); }} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              {heroSlides.map((_, i) => (
                <button key={i} onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToSlide(i); }} className={`h-2.5 rounded-full transition-all duration-300 ${i === currentSlide ? "w-8 bg-white" : "w-2.5 bg-white/40 hover:bg-white/60"}`} />
              ))}
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextSlide(); }} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Link>
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
              <Link key={tab.key} href={`/deals?max=${tab.key}`}>
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
