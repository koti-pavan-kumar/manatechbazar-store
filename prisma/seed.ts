import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Real product images from Unsplash (free for commercial use)
const productImages: Record<number, string[]> = {
  1: [// Classic White Tee
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80",
  ],
  2: [// Graphic Tee
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
  ],
  3: [// Black Hoodie
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80",
    "https://images.unsplash.com/photo-1578768079470-21b48f6489af?w=600&q=80",
  ],
  4: [// Zip-Up Hoodie
    "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&q=80",
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80",
  ],
  5: [// Denim Shirt
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
    "https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=600&q=80",
  ],
  6: [// Linen Shirt
    "https://images.unsplash.com/photo-1598511802560-8e73f8e10e8f?w=600&q=80",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
  ],
  7: [// Straight Fit Jeans
    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
  ],
  8: [// Skinny Black Jeans
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
    "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80",
  ],
  9: [// Chunky White Sneakers
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
    "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&q=80",
  ],
  10: [// Canvas Slip-Ons
    "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80",
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&q=80",
  ],
  11: [// Silver Watch
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80",
    "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&q=80",
  ],
  12: [// Aviator Sunglasses
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80",
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80",
  ],
  13: [// Canvas Backpack
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
    "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=80",
  ],
  14: [// Leather Crossbody Bag
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80",
  ],
  15: [// Cotton Beanie
    "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&q=80",
    "https://images.unsplash.com/photo-1510598969022-c4c6c5d05769?w=600&q=80",
  ],
};

// Real category images from Unsplash
const catImages: Record<string, string> = {
  "t-shirts": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80",
  "hoodies": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80",
  "shirts": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80",
  "jeans": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80",
  "sneakers": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80",
  "accessories": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80",
  "bags": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
  "watches": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80",
};

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Admin User ──────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@2026!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@manatechbazar.in" },
    update: {
      passwordHash: adminPassword,
      name: "Admin",
      role: "ADMIN",
      phone: "917893653255",
    },
    create: {
      name: "Admin",
      email: "admin@manatechbazar.in",
      passwordHash: adminPassword,
      role: "ADMIN",
      phone: "917893653255",
    },
  });
  console.log("✅ Admin user created:", admin.email, "/ Admin@2026!");

  // ─── Demo Customer ───────────────────────────────────────
  const customerPassword = await bcrypt.hash("Shop@2026!", 12);
  const customer = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {
      passwordHash: customerPassword,
    },
    create: {
      name: "Priya Sharma",
      email: "demo@example.com",
      passwordHash: customerPassword,
      role: "CUSTOMER",
    },
  });
  console.log("✅ Demo customer:", customer.email, "/ Shop@2026!");

  // ─── Categories ──────────────────────────────────────────
  const categoryData = [
    { name: "T-Shirts", slug: "t-shirts", image: catImages["t-shirts"] },
    { name: "Hoodies", slug: "hoodies", image: catImages["hoodies"] },
    { name: "Shirts", slug: "shirts", image: catImages["shirts"] },
    { name: "Jeans", slug: "jeans", image: catImages["jeans"] },
    { name: "Sneakers", slug: "sneakers", image: catImages["sneakers"] },
    { name: "Accessories", slug: "accessories", image: catImages["accessories"] },
    { name: "Bags", slug: "bags", image: catImages["bags"] },
    { name: "Watches", slug: "watches", image: catImages["watches"] },
  ];

  const categories: Record<string, string> = {};
  for (let i = 0; i < categoryData.length; i++) {
    const cat = await prisma.category.upsert({
      where: { slug: categoryData[i].slug },
      update: {},
      create: { ...categoryData[i], sortOrder: i },
    });
    categories[cat.slug] = cat.id;
  }
  console.log("✅ Categories created:", Object.keys(categories).join(", "));

  // ─── Products ────────────────────────────────────────────
  const productsData = [
    {
      title: "Classic White Tee",
      slug: "classic-white-tee",
      description: "Our bestselling premium cotton t-shirt. Made from 100% organic cotton with a relaxed fit. Perfect for everyday wear. Breathable, soft, and built to last.",
      mrp: 999, price: 599, stock: 50, isFeatured: true, isDealOfTheDay: true,
      tags: ["cotton", "casual", "white", "basic", "summer"],
      categorySlugs: ["t-shirts"],
    },
    {
      title: "Oversized Graphic Tee — 'Dream Big'",
      slug: "oversized-graphic-tee-dream-big",
      description: "Express yourself with this oversized graphic tee featuring our exclusive 'Dream Big' design. Premium cotton blend with dropped shoulders.",
      mrp: 1499, price: 899, stock: 30, isFeatured: true,
      tags: ["graphic", "oversized", "cotton", "streetwear"],
      categorySlugs: ["t-shirts"],
    },
    {
      title: "Premium Black Hoodie",
      slug: "premium-black-hoodie",
      description: "Stay warm in style. Heavyweight 360 GSM French terry fabric with kangaroo pocket and adjustable hood. Inner fleece lining for extra comfort.",
      mrp: 2499, price: 1499, stock: 25, isFeatured: true, isDealOfTheDay: true,
      tags: ["hoodie", "black", "winter", "warm", "premium"],
      categorySlugs: ["hoodies"],
    },
    {
      title: "Zip-Up Hoodie — Olive",
      slug: "zip-up-hoodie-olive",
      description: "Military-inspired olive zip-up hoodie. Full-zip with metal hardware, ribbed cuffs, and side pockets. A versatile layering piece.",
      mrp: 2999, price: 1799, stock: 20, isFeatured: true,
      tags: ["hoodie", "zip", "olive", "military", "layer"],
      categorySlugs: ["hoodies"],
    },
    {
      title: "Slim Fit Blue Denim Shirt",
      slug: "slim-fit-blue-denim-shirt",
      description: "Classic denim shirt in a modern slim fit. 100% cotton denim with chest pockets. Pair with jeans for a double-denim look or chinos for smart casual.",
      mrp: 1999, price: 1299, stock: 35,
      tags: ["denim", "shirt", "blue", "slim", "smart"],
      categorySlugs: ["shirts"],
    },
    {
      title: "Linen Summer Shirt — Pastel Blue",
      slug: "linen-summer-shirt-pastel-blue",
      description: "Light and breathable linen blend shirt. Perfect for summer outings. Relaxed fit with mother-of-pearl buttons.",
      mrp: 1799, price: 1099, stock: 40, isFeatured: true,
      tags: ["linen", "summer", "shirt", "pastel", "breathable"],
      categorySlugs: ["shirts"],
    },
    {
      title: "Classic Straight Fit Jeans",
      slug: "classic-straight-fit-jeans",
      description: "Everyday essential straight-fit jeans. Premium stretch denim with a comfortable rise. Pairs with everything in your wardrobe.",
      mrp: 2299, price: 1499, stock: 45,
      tags: ["jeans", "denim", "straight", "classic", "stretch"],
      categorySlugs: ["jeans"],
    },
    {
      title: "Skinny Fit Black Jeans",
      slug: "skinny-fit-black-jeans",
      description: "Sleek black skinny jeans with a modern silhouette. Super-stretch fabric for all-day comfort. A wardrobe essential.",
      mrp: 2199, price: 1399, stock: 35, isDealOfTheDay: true,
      tags: ["jeans", "black", "skinny", "modern", "stretch"],
      categorySlugs: ["jeans"],
    },
    {
      title: "Chunky White Sneakers",
      slug: "chunky-white-sneakers",
      description: "Turn heads with these chunky white sneakers. EVA foam midsole for cloud-like comfort, rubber outsole for grip. Elevate any outfit.",
      mrp: 3499, price: 2199, stock: 20, isFeatured: true,
      tags: ["sneakers", "white", "chunky", "casual", "trendy"],
      categorySlugs: ["sneakers"],
    },
    {
      title: "Canvas Slip-Ons",
      slug: "canvas-slip-ons",
      description: "Effortless style with these canvas slip-on shoes. Lightweight, comfortable, and perfect for everyday wear. Available in multiple colors.",
      mrp: 1499, price: 899, stock: 60,
      tags: ["sneakers", "slip-on", "canvas", "casual", "lightweight"],
      categorySlugs: ["sneakers"],
    },
    {
      title: "Minimalist Silver Watch",
      slug: "minimalist-silver-watch",
      description: "Elegant minimalist watch with a silver case and leather strap. Japanese quartz movement. Water resistant up to 30m.",
      mrp: 3999, price: 2499, stock: 15, isFeatured: true,
      tags: ["watch", "silver", "minimal", "elegant", "formal"],
      categorySlugs: ["watches"],
    },
    {
      title: "Aviator Sunglasses",
      slug: "aviator-sunglasses",
      description: "Classic aviator sunglasses with UV400 protection. Metal frame with polarized lenses. Looks great on every face shape.",
      mrp: 1999, price: 999, stock: 40,
      tags: ["sunglasses", "aviator", "uv", "polarized", "classic"],
      categorySlugs: ["accessories"],
    },
    {
      title: "Canvas Backpack",
      slug: "canvas-backpack",
      description: "Durable canvas backpack with laptop compartment. Multiple pockets for organization. Padded straps for comfort. Perfect for college or work.",
      mrp: 2999, price: 1799, stock: 25, isDealOfTheDay: true,
      tags: ["bag", "backpack", "canvas", "laptop", "college"],
      categorySlugs: ["bags"],
    },
    {
      title: "Leather Crossbody Bag",
      slug: "leather-crossbody-bag",
      description: "Premium faux leather crossbody bag with adjustable strap. Compact yet spacious. Perfect for outings and travel.",
      mrp: 2499, price: 1499, stock: 30,
      tags: ["bag", "crossbody", "leather", "travel", "compact"],
      categorySlugs: ["bags"],
    },
    {
      title: "Cotton Beanie — Charcoal",
      slug: "cotton-beanie-charcoal",
      description: "Warm cotton beanie for those cool evenings. Ribbed knit with a classic fit. One size fits most.",
      mrp: 799, price: 499, stock: 80, isDealOfTheDay: true,
      tags: ["beanie", "winter", "cotton", "charcoal", "warm"],
      categorySlugs: ["accessories"],
    },
  ];

  for (const productData of productsData) {
    const { categorySlugs, mrp, price, ...rest } = productData;
    const discountPercent = Math.round(((mrp - price) / mrp) * 100);

    const product = await prisma.product.upsert({
      where: { slug: rest.slug },
      update: {},
      create: {
        ...rest,
        mrp: mrp * 100, // paise
        price: price * 100, // paise
        discountPercent,
        images: JSON.stringify(productImages[productsData.indexOf(productData) + 1] || productImages[1]),
        tags: JSON.stringify(rest.tags),
        categoryProducts: {
          create: categorySlugs.map((slug) => ({
            categoryId: categories[slug],
          })),
        },
      },
    });
  }
  console.log("✅ Products created:", productsData.length);

  // ─── Coupons ─────────────────────────────────────────────
  const couponsData = [
    {
      code: "WELCOME20",
      type: "PERCENT",
      value: 20, // percent
      minOrder: 0,
      maxDiscount: 500 * 100, // ₹500 cap in paise
      expiry: new Date("2026-12-31"),
      isActive: true,
    },
    {
      code: "FLAT100",
      type: "FLAT",
      value: 100 * 100, // ₹100 in paise
      minOrder: 499 * 100, // ₹499 min in paise
      expiry: new Date("2026-12-31"),
      usageLimit: 100,
      isActive: true,
    },
    {
      code: "MEGA50",
      type: "PERCENT",
      value: 50, // percent
      minOrder: 999 * 100,
      maxDiscount: 1000 * 100, // ₹1000 cap
      expiry: new Date("2026-10-31"),
      usageLimit: 50,
      isActive: true,
    },
  ];

  for (const couponData of couponsData) {
    await prisma.coupon.upsert({
      where: { code: couponData.code },
      update: {},
      create: couponData,
    });
  }
  console.log("✅ Coupons created:", couponsData.map((c) => c.code).join(", "));

  // ─── Store Settings ──────────────────────────────────────
  await prisma.storeSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      storeName: "Mana Tech Bazar",
      storeDescription: "Your favourite store on Instagram",
      announcementText: "🔥 FLAT 20% OFF on first order — Use code WELCOME20 🔥",
      announcementActive: true,
      whatsappNumber: "917893653255",
      instagramHandle: "@manatechbazar",
      freeShippingThreshold: 499 * 100,
      email: "support@manatechbazar.in",
    },
  });
  console.log("✅ Store settings created");

  console.log("\n🎉 Seed complete!");
  console.log("   Admin login: admin@manatechbazar.in / Admin@2026!");
  console.log("   Customer login: demo@example.com / Shop@2026!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
