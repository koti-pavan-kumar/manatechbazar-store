# 🛍️ Mana Tech Bazar

A complete, production-ready, mobile-first e-commerce website built with Next.js 15, TypeScript, Prisma, and Tailwind CSS. Designed for Instagram-based Indian stores with ₹ pricing, UPI/COD payments, and WhatsApp integration.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up database and seed data
npx prisma db push
npx tsx prisma/seed.ts

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@manatechbazar.in | admin123 |
| Customer | demo@example.com | customer123 |

---

## 📋 Tech Stack (All Free)

| Layer | Choice | Free Tier |
|-------|--------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript | Vercel Hobby |
| UI | Tailwind CSS + shadcn/ui + lucide-react | Free |
| Database | SQLite (dev) / PostgreSQL via Neon (prod) | Neon Free |
| Auth | Auth.js v5 — email/password + Google OAuth | Free |
| Images | Cloudinary (or local uploads) | Cloudinary Free |
| Payments | Razorpay Standard Checkout | Free to integrate |
| State | Zustand (cart + wishlist) | Free |
| Forms | react-hook-form + zod | Free |
| Email | Resend (order confirmations) | Free |

### About Razorpay

> **Razorpay has no setup or monthly fees.** It charges ~2% per real transaction. Test-mode payments are 100% free. Going live requires KYC with a bank account — no cost.

---

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (store)/           # Customer-facing pages
│   ├── admin/             # Admin dashboard (role-protected)
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Header, BottomNav, etc.
│   ├── product/           # Product cards, etc.
│   └── admin/             # Admin-specific components
├── lib/                   # Utilities, auth, validations
│   ├── prisma.ts          # Prisma client singleton
│   ├── auth.ts            # Auth.js configuration
│   ├── utils.ts           # Helpers (formatPrice, slugify, etc.)
│   ├── validations.ts     # Zod schemas
│   ├── constants.ts       # Store config, status labels
│   └── email.ts           # Resend email integration
├── stores/                # Zustand stores
│   ├── cart.ts            # Shopping cart
│   └── wishlist.ts        # Wishlist
prisma/
├── schema.prisma          # Database schema
├── seed.ts                # Seed script (15 demo products)
```

---

## 🔧 Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
# Database (SQLite for local dev)
DATABASE_URL="file:./dev.db"

# Auth.js
AUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Razorpay Test Mode (https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID="rzp_test_xxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxx"
RAZORPAY_WEBHOOK_SECRET=""

# Cloudinary (https://cloudinary.com — free tier)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Resend (https://resend.com — free tier)
RESEND_API_KEY=""

# AI Chatbot (https://console.groq.com — free)
GROQ_API_KEY=""
```

---

## 🛒 Customer Features

- **Home page** — Hero carousel, announcement banner, category tiles, deal of the day countdown, new arrivals, Instagram CTA
- **Product listing** — Filters by category, sort (price/popular/discount), search, price range
- **Product detail** — Image gallery, MRP struck-through with discount badge, variants (size/color), ratings & reviews, related products, sticky mobile Add to Cart, WhatsApp order button
- **Cart** — Quantity controls, coupon application with live discount math, free-shipping progress bar
- **Wishlist** — Heart toggle on all product cards, move-to-cart
- **Checkout** — Saved address book, Razorpay (UPI/cards/wallets) and COD, server-side price calculation
- **Orders** — Status timeline, invoice summary, reorder
- **Account** — Profile, addresses, order history
- **Chatbot** — "Ask Mohan" AI assistant grounded in catalog data

---

## 🔧 Admin Features

- **Dashboard** — Revenue, orders count, low-stock alerts, top products
- **Products** — Full CRUD with image upload, categories, variants, featured/deal-of-day toggles
- **Categories** — Create/rename/delete, unlimited categories
- **Coupons** — Flat or % off, min-order, max discount cap, expiry, usage limits
- **Orders** — View all, update status (placed → confirmed → shipped → delivered)
- **Customers** — List all customers with order counts
- **Settings** — Store name, announcement banner, social links, shipping threshold

---

## 💳 Razorpay Integration

### Test Mode Setup
1. Create free account at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings → API Keys → Generate Test Mode Keys**
3. Copy `rzp_test_xxxxxxxx` and secret to `.env.local`
4. For webhooks: **Settings → Webhooks → Add New** → URL: `https://yourapp.com/api/razorpay/webhook`

### How It Works
- Order created **server-side** with exact amount (never trusts client totals)
- Standard Checkout opens on client
- Signature verified server-side on success
- Webhook endpoint for `payment.captured` (idempotent, signature-verified)
- COD path skips gateway but creates same Order record

### Going Live
1. Complete KYC on Razorpay (need PAN + bank account)
2. Switch keys from `rzp_test_*` to `rzp_live_*`
3. Update webhook secret
4. That's it — **no additional fees**

---

## 📱 Mobile-First Design

Every screen is optimized for 360px width:
- Sticky bottom navigation (Home/Shop/Wishlist/Cart/Account)
- 44px+ minimum tap targets
- Skeleton loaders
- Optimistic cart updates
- Sticky Add to Cart on product pages
- WhatsApp floating button

---

## 🤖 AI / RAG Features

### Semantic Search (pgvector)
When using PostgreSQL (Neon), product descriptions are embedded for semantic search. Hybrid search combines keyword matching with similarity.

### "Ask Mohan" Shopping Assistant (Mana Tech Bazar)
- RAG chatbot grounded in live catalog data
- Uses Groq free API (llama-3.1-8b-instant)
- Never invents prices or products
- Falls back to product search if AI unavailable

---

## 🚀 Free Deployment (30 Minutes at ₹0)

### Step 1: GitHub
1. Create GitHub account (free)
2. Push code to repository

### Step 2: Neon Database
1. Sign up at [neon.tech](https://neon.tech) (free tier)
2. Create project → copy connection string
3. Update `DATABASE_URL` in Vercel env vars (switch provider to `postgresql`)

### Step 3: Vercel
1. Sign up at [vercel.com](https://vercel.com) with GitHub
2. Import repository
3. Add environment variables
4. Deploy

### Step 4: Cloudinary
1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier: 25GB)
2. Get Cloud Name, API Key, API Secret
3. Add to Vercel env vars

### Step 5: Razorpay
1. Sign up at [razorpay.com](https://razorpay.com) (free)
2. Get test API keys from dashboard
3. Add to Vercel env vars

### Step 6: Resend (Optional)
1. Sign up at [resend.com](https://resend.com) (free: 100 emails/day)
2. Get API key
3. Add to Vercel env vars

### Step 7: Post-Deploy
1. Visit `https://yourapp.vercel.app/api/admin/seed` to seed production
2. Or run seed via Vercel CLI:
   ```bash
   npx vercel env pull
   npx tsx prisma/seed.ts
   ```

---

## 📊 Database Schema

Key models:
- **User** — role (CUSTOMER/ADMIN), email/password auth
- **Product** — title, slug, MRP, selling price, stock, images, variants
- **Category** — admin-managed, unlimited, hierarchical
- **Order** — status timeline, payment tracking
- **Coupon** — flat/% off, min-order, expiry, usage limits
- **Review** — verified purchase badges
- **StoreSetting** — singleton config (store name, announcements, links)

---

## 🔒 Security

- bcrypt password hashing
- Zod validation on all inputs
- RBAC middleware protecting `/admin` routes
- Razorpay webhook signature verification
- Server-side price calculation (never trusts client)
- Secrets only in env vars
- Error boundaries + custom 404

---

## 📝 NPM Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with demo data
npm run db:reset     # Reset and reseed database
npm run setup        # Install + push + seed (one command)
```

---

## 🎨 Design

- Clean shadcn/ui aesthetic
- WCAG AA accessible
- Responsive: mobile-first at 360px
- ₹ formatting with Indian locale
- SEO: SSR product pages, OpenGraph, sitemap-ready

---

## 📄 License

MIT

Deploy: Mon Sep 14 21:08:02 IST 2026
