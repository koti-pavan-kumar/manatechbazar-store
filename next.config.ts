import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Redirect middleware warning (Next.js 16)
  experimental: {},

  // ─── Security headers (applied to every response) ───────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent MIME-type sniffing (stops disguised files being executed)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Prevent clickjacking — site can only be framed by itself
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Don't leak full URLs to external sites
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disable camera/mic/geolocation/payment APIs (nothing on this site needs them)
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // Force HTTPS for 2 years (browsers remember HSTS)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
