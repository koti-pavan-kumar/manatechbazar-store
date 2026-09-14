"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, ShoppingBag, ArrowRight, Sparkles, Star, Truck, Shield, CheckCircle2 } from "lucide-react";
import { Instagram } from "@/components/ui/icon-instagram";

const INSTAGRAM_URL = "https://www.instagram.com/manatechbazar?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==";

// Ecommerce product images for the visual panel
const productImages = [
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80", // Bag
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80", // Sunglasses
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80", // Perfume
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80", // Shoes
];

const benefits = [
  "Exclusive member-only deals",
  "Early access to new arrivals",
  "Free shipping on orders ₹499+",
  "Easy returns & exchanges",
];

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Registration failed");
        return;
      }
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (signInResult?.error) {
        window.location.href = "/login";
      } else {
        window.location.href = "/";
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
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-500/10 to-orange-400/10 animate-gradient" />

        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23ffffff' fill-opacity='1'%3e%3cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }} />

        {/* Floating product images */}
        <div className="absolute top-16 left-20 w-36 h-44 rounded-2xl overflow-hidden animate-float shadow-2xl rotate-[-8deg] border border-white/10">
          <img src={productImages[0]} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <div className="absolute top-40 right-16 w-28 h-36 rounded-2xl overflow-hidden animate-float-delayed shadow-2xl rotate-[6deg] border border-white/10">
          <img src={productImages[1]} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <div className="absolute bottom-36 left-16 w-32 h-40 rounded-2xl overflow-hidden animate-float shadow-2xl rotate-[5deg] border border-white/10">
          <img src={productImages[2]} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <div className="absolute bottom-20 right-24 w-40 h-40 rounded-2xl overflow-hidden animate-float-delayed shadow-2xl rotate-[-4deg] border border-white/10">
          <img src={productImages[3]} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-1/3 left-1/4 w-56 h-56 bg-pink-500/10 rounded-full blur-[100px] animate-glow-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-orange-500/10 rounded-full blur-[80px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />

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
              Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">10,000+</span>
              <br />Happy Shoppers
            </h1>
            <p className="text-lg text-white/60 max-w-md mb-10">
              Create your account and unlock exclusive deals, early access, and a personalized shopping experience.
            </p>

            {/* Benefits list */}
            <div className="space-y-3 max-w-xs mx-auto mb-10">
              {benefits.map((benefit, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 text-white/80 text-sm transition-all duration-500 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
                  style={{ transitionDelay: `${300 + i * 100}ms` }}
                >
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
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
          <div className={`absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6 text-white/40 text-xs transition-all duration-1000 delay-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" />
              <span>Free Shipping ₹499+</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5" />
              <span>4.8★ Rated</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Panel: Register Form ────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 relative overflow-y-auto">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(0 0 0 / 1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        }} />

        <div className={`w-full max-w-md relative transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
          {/* Mobile logo (hidden on desktop) */}
          <div className="lg:hidden text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Mana Tech Bazar</span>
            </Link>
          </div>

          {/* Welcome text */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">Get Started</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Create your account</h2>
            <p className="text-muted-foreground mt-2">Join Mana Tech Bazar and start shopping!</p>
          </div>

          {/* Form Card with 3D hover effect */}
          <div
            className="bg-card rounded-2xl border shadow-lg p-6 sm:p-8 transition-all duration-300 hover:shadow-xl"
            style={{
              perspective: "1000px",
              transformStyle: "preserve-3d",
            }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-scale-in flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <span className="text-red-600 text-xs font-bold">!</span>
                  </div>
                  {error}
                </div>
              )}

              <div className="space-y-2 animate-slide-in-up" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  className="h-12 rounded-xl border-2 transition-all duration-200 focus:border-primary focus:ring-0"
                  {...register("name")}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message as string}</p>}
              </div>

              <div className="space-y-2 animate-slide-in-up" style={{ animationDelay: "0.35s", animationFillMode: "both" }}>
                <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-12 rounded-xl border-2 transition-all duration-200 focus:border-primary focus:ring-0"
                  {...register("email")}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message as string}</p>}
              </div>

              <div className="space-y-2 animate-slide-in-up" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
                <Label htmlFor="phone" className="text-sm font-medium">Phone <span className="text-muted-foreground">(optional)</span></Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 99999 99999"
                  className="h-12 rounded-xl border-2 transition-all duration-200 focus:border-primary focus:ring-0"
                  {...register("phone")}
                />
              </div>

              <div className="space-y-2 animate-slide-in-up" style={{ animationDelay: "0.45s", animationFillMode: "both" }}>
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
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
                {errors.password && <p className="text-xs text-red-500">{errors.password.message as string}</p>}
              </div>

              <div className="space-y-2 animate-slide-in-up" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  className="h-12 rounded-xl border-2 transition-all duration-200 focus:border-primary focus:ring-0"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message as string}</p>}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-xl font-semibold text-base transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] mt-2 animate-slide-in-up"
                style={{ animationDelay: "0.55s", animationFillMode: "both" }}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Terms */}
            <p className="text-xs text-center text-muted-foreground mt-4 animate-slide-in-up" style={{ animationDelay: "0.6s", animationFillMode: "both" }}>
              By creating an account, you agree to our{" "}
              <Link href="#" className="text-primary hover:underline">Terms</Link>
              {" "}and{" "}
              <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </div>

          {/* Sign in link */}
          <div className="mt-6 text-center animate-slide-in-up" style={{ animationDelay: "0.65s", animationFillMode: "both" }}>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline underline-offset-4 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {/* Back to home */}
          <div className="mt-4 text-center animate-slide-in-up" style={{ animationDelay: "0.7s", animationFillMode: "both" }}>
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ← Back to store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
