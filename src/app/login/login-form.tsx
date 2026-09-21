"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, ShoppingBag, ArrowRight, Sparkles, Star, Truck, Shield } from "lucide-react";
import { Instagram } from "@/components/ui/icon-instagram";

const INSTAGRAM_URL = "https://www.instagram.com/manatechbazar?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==";

// Ecommerce product images for the visual panel
const productImages = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", // Watch
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", // Headphones
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", // Sneaker
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80", // Sunglasses
];

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        phone: data.phone,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid phone number or password");
      } else {
        // Check user role to decide redirect destination
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        if (session?.user?.role === "ADMIN") {
          window.location.href = "/admin";
        } else {
          window.location.href = callbackUrl;
        }
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex bg-background">
      {/* ─── Left Panel: Visual / Branding ──────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-600/10 to-orange-500/10 animate-gradient" />

        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23ffffff' fill-opacity='1'%3e%3cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }} />

        {/* Floating product images */}
        <div className="absolute top-20 left-16 w-32 h-40 rounded-2xl overflow-hidden animate-float shadow-2xl rotate-[-6deg] border border-white/10">
          <img src={productImages[0]} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <div className="absolute top-32 right-20 w-28 h-36 rounded-2xl overflow-hidden animate-float-delayed shadow-2xl rotate-[4deg] border border-white/10">
          <img src={productImages[1]} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <div className="absolute bottom-40 left-24 w-36 h-36 rounded-2xl overflow-hidden animate-float shadow-2xl rotate-[8deg] border border-white/10">
          <img src={productImages[2]} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <div className="absolute bottom-28 right-16 w-32 h-40 rounded-2xl overflow-hidden animate-float-delayed shadow-2xl rotate-[-3deg] border border-white/10">
          <img src={productImages[3]} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-orange-500/10 rounded-full blur-[80px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <div className={`text-center transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <ShoppingBag className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-bold text-white tracking-tight">Mana Tech Bazar</span>
            </div>

            {/* Tagline */}
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
              Shop the <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">Best Deals</span>
              <br />on Trending Products
            </h1>
            <p className="text-lg text-white/60 max-w-md mb-10">
              Curated fashion, accessories & lifestyle — delivered to your doorstep with free shipping above ₹499.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-8 justify-center mb-10">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">10K+</div>
                <div className="text-xs text-white/50 mt-1">Happy Customers</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-xs text-white/50 mt-1">Products</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">4.8★</div>
                <div className="text-xs text-white/50 mt-1">Rating</div>
              </div>
            </div>

            {/* Instagram CTA */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105"
            >
              <Instagram className="h-5 w-5" />
              Follow @manatechbazar
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Trust badges at bottom */}
          <div className={`absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6 text-white/40 text-xs transition-all duration-1000 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" />
              <span>Free Shipping ₹499+</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Best Prices</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Panel: Login Form ───────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(0 0 0 / 1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        }} />

        <div className={`w-full max-w-md relative transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
          {/* Mobile logo (hidden on desktop) */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Mana Tech Bazar</span>
            </Link>
          </div>

          {/* Welcome text */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">Welcome Back</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Login to your account</h2>
            <p className="text-muted-foreground mt-2">Continue shopping with Mana Tech Bazar</p>
          </div>

          {/* Form Card with 3D hover effect */}
          <div
            className="bg-card rounded-2xl border shadow-lg p-6 sm:p-8 transition-all duration-300 hover:shadow-xl"
            style={{
              perspective: "1000px",
              transformStyle: "preserve-3d",
            }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-scale-in flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <span className="text-red-600 text-xs font-bold">!</span>
                  </div>
                  {error}
                </div>
              )}

              <div className="space-y-2 animate-slide-in-up" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                <div className="relative group">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your 10-digit phone number"
                    className="h-12 rounded-xl border-2 transition-all duration-200 focus:border-primary focus:ring-0"
                    {...register("phone")}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 flex items-center gap-1">{errors.phone.message as string}</p>}
              </div>

              <div className="space-y-2 animate-slide-in-up" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                </div>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="h-12 rounded-xl border-2 transition-all duration-200 focus:border-primary focus:ring-0 pr-12"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 flex items-center gap-1">{errors.password.message as string}</p>}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-xl font-semibold text-base transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] animate-slide-in-up"
                style={{ animationDelay: "0.5s", animationFillMode: "both" }}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <>
                    Login
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            {process.env.GOOGLE_CLIENT_ID && (
              <div className="mt-6 animate-slide-in-up" style={{ animationDelay: "0.6s", animationFillMode: "both" }}>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground font-medium">or continue with</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-12 rounded-xl mt-4 font-medium border-2 hover:bg-accent transition-all duration-200"
                  type="button"
                  onClick={() => signIn("google", { callbackUrl })}
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </Button>
              </div>
            )}
          </div>

          {/* Sign up link */}
          <div className="mt-8 text-center animate-slide-in-up" style={{ animationDelay: "0.7s", animationFillMode: "both" }}>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline underline-offset-4 transition-colors">
                Create Account
              </Link>
            </p>
          </div>

          {/* Back to home */}
          <div className="mt-4 text-center animate-slide-in-up" style={{ animationDelay: "0.8s", animationFillMode: "both" }}>
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ← Back to store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
