"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Clock, Tag, Flame, Sparkles, Gift, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/product-card";
import { formatPrice, timeRemaining } from "@/lib/utils";

interface Props {
  data: { coupons: any[]; deals: any[] };
}

export function OffersContent({ data }: Props) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div>
      {/* ─── Hero Banner ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-500 to-pink-500 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-600 to-purple-500 animate-hero-gradient opacity-40" />

        {/* Floating decorative elements */}
        <div className="absolute top-8 left-[10%] text-5xl animate-float opacity-30">🏷️</div>
        <div className="absolute top-16 right-[15%] text-4xl animate-float-delayed opacity-25">🔥</div>
        <div className="absolute bottom-8 left-[20%] text-3xl animate-float opacity-20" style={{ animationDelay: "1s" }}>💰</div>
        <div className="absolute bottom-12 right-[10%] text-4xl animate-float-delayed opacity-20" style={{ animationDelay: "0.5s" }}>⚡</div>

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-yellow-400/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-white/5 rounded-full blur-[60px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:py-16 text-center">
          <Badge variant="secondary" className={`mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Zap className="h-3.5 w-3.5 mr-1 inline" />
            Limited Time Deals
          </Badge>
          <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="animate-wave inline-block mr-2">🔥</span>
            Offers & Deals
          </h1>
          <p className={`text-lg text-white/80 max-w-lg mx-auto transition-all duration-700 delay-400 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            Grab these exclusive deals before they expire! Use coupons at checkout for instant discounts.
          </p>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" fill="none" className="w-full">
            <path d="M0 50L60 42C120 34 240 18 360 12C480 6 600 10 720 15C840 20 960 26 1080 28C1200 30 1320 28 1380 27L1440 26V50H0Z" fill="var(--background)" />
          </svg>
        </div>
      </section>

      {/* ─── Content ───────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-12">
        {/* Coupons */}
        {data.coupons.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Active Coupons</h2>
                <p className="text-sm text-muted-foreground">Copy & paste at checkout</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {data.coupons.map((coupon: any, i: number) => (
                <div key={coupon.id} style={{ animationDelay: `${i * 100}ms` }} className="animate-slide-in-up">
                  <CouponCard coupon={coupon} onCopy={copyCode} copiedCode={copiedCode} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Deal of the Day */}
        {data.deals.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20 animate-pulse-glow">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span className="animate-wave inline-block">🔥</span> Deal of the Day
                </h2>
                <p className="text-sm text-muted-foreground">Hurry — limited stock at these prices!</p>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {data.deals.map((product: any, i: number) => (
                <div key={product.id} style={{ animationDelay: `${i * 80}ms` }} className="animate-slide-in-up">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}

        {data.coupons.length === 0 && data.deals.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Tag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">No active offers right now</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">Check back soon — we add new deals regularly!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CouponCard({ coupon, onCopy, copiedCode }: { coupon: any; onCopy: (code: string) => void; copiedCode: string | null }) {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [justCopied, setJustCopied] = useState(false);

  useEffect(() => {
    const update = () => setRemaining(timeRemaining(new Date(coupon.expiry)));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [coupon.expiry]);

  const handleCopy = (code: string) => {
    onCopy(code);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 2000);
  };

  const isExpiringSoon = remaining.days < 7;

  return (
    <div className="relative group">
      {/* Gradient border */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />

      <div className="relative bg-card border-2 rounded-2xl p-5 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Background decoration */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/5 rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary/5 rounded-full" />

        {/* Discount badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge
              className={`text-sm font-bold px-3 py-1 rounded-lg ${
                coupon.type === "PERCENT"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-md shadow-orange-500/20"
                  : "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md shadow-green-500/20"
              }`}
            >
              {coupon.type === "PERCENT" ? `${coupon.value}% OFF` : `${formatPrice(coupon.value)} OFF`}
            </Badge>
            {coupon.usageLimit && (
              <Badge variant="secondary" className="text-xs rounded-lg">
                {coupon.usageLimit} uses left
              </Badge>
            )}
          </div>
        </div>

        {coupon.minOrder > 0 && (
          <p className="text-xs text-muted-foreground mb-3 font-medium">
            Min. order: {formatPrice(coupon.minOrder)}
          </p>
        )}

        {/* Coupon code */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-muted/50 border-2 border-dashed rounded-xl px-4 py-2.5 text-center">
            <code className="text-lg font-bold tracking-widest text-foreground">{coupon.code}</code>
          </div>
          <Button
            variant={justCopied ? "default" : "outline"}
            size="lg"
            onClick={() => handleCopy(coupon.code)}
            className={`shrink-0 rounded-xl h-[46px] transition-all duration-300 ${
              justCopied ? "bg-green-500 hover:bg-green-600 text-white border-0" : ""
            }`}
          >
            {copiedCode === coupon.code ? (
              <Check className="h-5 w-5" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Expiry countdown */}
        <div className={`flex items-center gap-1.5 text-xs font-medium ${isExpiringSoon ? "text-red-500" : "text-muted-foreground"}`}>
          <Clock className="h-3.5 w-3.5" />
          {isExpiringSoon && <span className="animate-pulse mr-1">⚠️</span>}
          <span>
            Expires in: {remaining.days}d {remaining.hours}h {remaining.minutes}m {remaining.seconds}s
          </span>
        </div>
      </div>
    </div>
  );
}
