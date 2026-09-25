import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { validateEnv } from "@/lib/env";
import { STORE } from "@/lib/constants";

// Validate environment variables on server startup
validateEnv();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(STORE.siteUrl),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Mana Tech Bazar — Your Favourite Store",
    template: "%s | Mana Tech Bazar",
  },
  description: "Discover amazing products at the best prices. Shop now on Instagram's favourite store!",
  keywords: ["online store", "shopping", "deals", "fashion", "accessories", "manatechbazar"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Mana Tech Bazar",
    title: "Mana Tech Bazar — Your Favourite Store",
    description: "Discover amazing products at the best prices.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mana Tech Bazar — Your Favourite Store",
    description: "Discover amazing products at the best prices.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1a1a1a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
