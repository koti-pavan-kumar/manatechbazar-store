import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Adding new categories and products...");

  // ─── New Categories ──────────────────────────────────────
  const categoryData = [
    { name: "Gadgets", slug: "gadgets", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", sortOrder: 8 },
    { name: "Home & Kitchen", slug: "home-kitchen", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80", sortOrder: 9 },
    { name: "Jewellery", slug: "jewellery", image: "https://images.unsplash.com/photo-1515562141589-67f0d569b40e?w=400&q=80", sortOrder: 10 },
    { name: "Toys & Games", slug: "toys-games", image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&q=80", sortOrder: 11 },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      categories[cat.slug] = existing.id;
    } else {
      const created = await prisma.category.create({ data: cat });
      categories[cat.slug] = created.id;
      console.log(`  ✅ Category: ${cat.name}`);
    }
  }

  // Also get existing categories
  const existingCats = await prisma.category.findMany();
  for (const c of existingCats) {
    if (!categories[c.slug]) categories[c.slug] = c.id;
  }

  // ─── Products: Gadgets (Slide 1) ─────────────────────────
  const gadgets = [
    {
      title: "Polarized Aviator Sunglasses",
      slug: "polarized-aviator-sunglasses",
      description: "Classic aviator sunglasses with UV400 polarized lenses. Metal frame, lightweight design. Perfect for everyday wear and driving.",
      mrp: 999, price: 149, stock: 80, isFeatured: true,
      images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80"],
      tags: ["sunglasses", "aviator", "uv", "polarized"],
      categorySlugs: ["gadgets", "accessories"],
    },
    {
      title: "Portable Mini Hand Fan",
      slug: "portable-mini-hand-fan",
      description: "Rechargeable USB mini hand fan with 3 speed settings. Compact and lightweight — perfect for summer. Lasts up to 6 hours on full charge.",
      mrp: 599, price: 199, stock: 100,
      images: ["https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&q=80"],
      tags: ["fan", "portable", "rechargeable", "summer"],
      categorySlugs: ["gadgets"],
    },
    {
      title: "Smart Digital Watch",
      slug: "smart-digital-watch",
      description: "Multi-function digital watch with heart rate monitor, step counter, and notifications. Water resistant IP67. 7-day battery life.",
      mrp: 2999, price: 499, stock: 40, isFeatured: true,
      images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"],
      tags: ["watch", "smart", "digital", "fitness"],
      categorySlugs: ["gadgets", "watches"],
    },
    {
      title: "Canvas Sneakers — Unisex",
      slug: "canvas-sneakers-unisex",
      description: "Lightweight canvas sneakers for men and women. Rubber sole with cushioned insole. Available in multiple colors.",
      mrp: 1299, price: 399, stock: 60, isFeatured: true,
      images: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80"],
      tags: ["sneakers", "canvas", "unisex", "casual"],
      categorySlugs: ["gadgets", "sneakers"],
    },
    {
      title: "Wireless Bluetooth Earbuds",
      slug: "wireless-bluetooth-earbuds",
      description: "TWS wireless earbuds with active noise cancellation. 30-hour battery with case. IPX5 waterproof. Crystal clear sound quality.",
      mrp: 1999, price: 349, stock: 50, isFeatured: true,
      images: ["https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&q=80"],
      tags: ["earbuds", "wireless", "bluetooth", "anc"],
      categorySlugs: ["gadgets"],
    },
    {
      title: "Portable Bluetooth Speaker",
      slug: "portable-bluetooth-speaker",
      description: "Mini portable speaker with 360° surround sound. IPX7 waterproof. 12-hour playback. Perfect for outdoor adventures.",
      mrp: 1799, price: 449, stock: 35,
      images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80"],
      tags: ["speaker", "bluetooth", "portable", "waterproof"],
      categorySlugs: ["gadgets"],
    },
  ];

  // ─── Products: Home & Kitchen (Slide 2) ──────────────────
  const homeKitchen = [
    {
      title: "Stainless Steel Spoon Set (6 pcs)",
      slug: "stainless-steel-spoon-set",
      description: "Premium stainless steel dessert spoon set. Mirror polished, rust resistant. Ergonomic design for comfortable grip.",
      mrp: 599, price: 149, stock: 120,
      images: ["https://images.unsplash.com/photo-1584568694244-44cb124eb2d7?w=600&q=80"],
      tags: ["spoon", "steel", "kitchen", "dining"],
      categorySlugs: ["home-kitchen"],
    },
    {
      title: "Jet Flame Lighter",
      slug: "jet-flame-lighter",
      description: "Windproof jet flame lighter with adjustable flame. Refillable butane gas. Perfect for kitchen, BBQ, candles.",
      mrp: 499, price: 129, stock: 90,
      images: ["https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&q=80"],
      tags: ["lighter", "jet", "windproof", "kitchen"],
      categorySlugs: ["home-kitchen"],
    },
    {
      title: "Portable Camping Gas Stove",
      slug: "portable-camping-gas-stove",
      description: "Mini portable butane gas stove for camping and outdoor cooking. Foldable design. 2000W output. Auto-ignition.",
      mrp: 1999, price: 599, stock: 25, isFeatured: true,
      images: ["https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80"],
      tags: ["stove", "camping", "portable", "gas"],
      categorySlugs: ["home-kitchen"],
    },
    {
      title: "Silicone Kitchen Utensil Set",
      slug: "silicone-kitchen-utensil-set",
      description: "6-piece heat-resistant silicone utensil set with wooden handles. Non-stick friendly. Includes spatula, ladle, tongs, and more.",
      mrp: 999, price: 299, stock: 45,
      images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80"],
      tags: ["utensil", "silicone", "kitchen", "cooking"],
      categorySlugs: ["home-kitchen"],
    },
    {
      title: "LED Desk Lamp with USB Charging",
      slug: "led-desk-lamp-usb",
      description: "Adjustable LED desk lamp with 3 brightness levels and USB charging port. Eye-care technology. Touch control.",
      mrp: 1499, price: 399, stock: 30, isFeatured: true,
      images: ["https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&q=80"],
      tags: ["lamp", "led", "desk", "usb"],
      categorySlugs: ["home-kitchen"],
    },
  ];

  // ─── Products: Jewellery (Slide 3) ───────────────────────
  const jewellery = [
    {
      title: "Gold Plated Jhumka Earrings",
      slug: "gold-plated-jhumka-earrings",
      description: "Traditional gold-plated jhumka earrings with intricate design. Lightweight and comfortable for all-day wear.",
      mrp: 999, price: 199, stock: 60, isFeatured: true,
      images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80"],
      tags: ["earrings", "jhumka", "gold", "traditional"],
      categorySlugs: ["jewellery", "accessories"],
    },
    {
      title: "Kundan Necklace Set",
      slug: "kundan-necklace-set",
      description: "Beautiful Kundan necklace set with matching earrings. Perfect for weddings and festivals. Premium quality with gold polish.",
      mrp: 2999, price: 499, stock: 20, isFeatured: true,
      images: ["https://images.unsplash.com/photo-1515562141589-67f0d569b40e?w=600&q=80"],
      tags: ["necklace", "kundan", "wedding", "gold"],
      categorySlugs: ["jewellery"],
    },
    {
      title: "Silver Toe Rings (Pack of 6)",
      slug: "silver-toe-rings-pack",
      description: "Oxidized silver-plated toe rings. Adjustable size. Beautiful traditional designs. Pack of 6 pairs.",
      mrp: 599, price: 149, stock: 80,
      images: ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80"],
      tags: ["toe-rings", "silver", "traditional", "pack"],
      categorySlugs: ["jewellery"],
    },
    {
      title: "Pearl Bracelet — Rose Gold",
      slug: "pearl-bracelet-rose-gold",
      description: "Elegant faux pearl bracelet with rose gold chain. Minimalist design suitable for daily and party wear.",
      mrp: 799, price: 199, stock: 50,
      images: ["https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&q=80"],
      tags: ["bracelet", "pearl", "rose-gold", "elegant"],
      categorySlugs: ["jewellery"],
    },
    {
      title: "oxidised Silver Bangles Set",
      slug: "oxidised-silver-bangles-set",
      description: "Set of 12 oxidized silver bangles with traditional patterns. Lightweight and skin-friendly. Perfect for ethnic outfits.",
      mrp: 899, price: 249, stock: 40,
      images: ["https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&q=80"],
      tags: ["bangles", "oxidised", "silver", "traditional"],
      categorySlugs: ["jewellery"],
    },
  ];

  // ─── Products: Toys & Games (Slide 4) ────────────────────
  const toys = [
    {
      title: "Speed Rubik's Cube 3x3",
      slug: "speed-rubiks-cube-3x3",
      description: "Professional speed Rubik's cube with smooth rotation. Anti-pop design. Perfect for beginners and speedcubers.",
      mrp: 599, price: 149, stock: 100, isFeatured: true,
      images: ["https://images.unsplash.com/photo-1577401239170-897c650e3e44?w=600&q=80"],
      tags: ["rubik", "cube", "puzzle", "speed"],
      categorySlugs: ["toys-games"],
    },
    {
      title: "RC Racing Car — High Speed",
      slug: "rc-racing-car",
      description: "Remote control racing car with 2.4GHz frequency. 30km/h top speed. Rechargeable battery. Anti-skid tires.",
      mrp: 2499, price: 599, stock: 25, isFeatured: true,
      images: ["https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600&q=80"],
      tags: ["rc-car", "remote-control", "racing", "toy"],
      categorySlugs: ["toys-games"],
    },
    {
      title: "RC Helicopter — Mini Drone",
      slug: "rc-helicopter-mini",
      description: "Mini remote control helicopter with gyro stabilization. 3.5 channel control. LED lights. Great for indoor play.",
      mrp: 1499, price: 349, stock: 30,
      images: ["https://images.unsplash.com/photo-1521405924368-64c5b84be36b?w=600&q=80"],
      tags: ["helicopter", "rc", "drone", "mini"],
      categorySlugs: ["toys-games"],
    },
    {
      title: "1000 Piece Jigsaw Puzzle",
      slug: "1000-piece-jigsaw-puzzle",
      description: "Premium quality 1000 piece jigsaw puzzle. Beautiful landscape design. Thick cardboard pieces. Completed size: 70x50cm.",
      mrp: 999, price: 249, stock: 40,
      images: ["https://images.unsplash.com/photo-1606503153255-59d8b2e4b9e4?w=600&q=80"],
      tags: ["puzzle", "jigsaw", "1000-piece", "brain-teaser"],
      categorySlugs: ["toys-games"],
    },
    {
      title: "Plush Teddy Bear — 12 inch",
      slug: "plush-teddy-bear-12inch",
      description: "Soft and cuddly plush teddy bear. 12 inches tall. Hypoallergenic material. Perfect gift for kids.",
      mrp: 799, price: 249, stock: 50,
      images: ["https://images.unsplash.com/photo-1559715541-e5e34874cc6e?w=600&q=80"],
      tags: ["teddy", "bear", "plush", "soft-toy"],
      categorySlugs: ["toys-games"],
    },
    {
      title: "Magnetic Building Blocks Set (60 pcs)",
      slug: "magnetic-building-blocks-60",
      description: "Magnetic tiles building blocks set with 60 pieces. STEM educational toy. Develops creativity and spatial thinking.",
      mrp: 1999, price: 499, stock: 20, isFeatured: true,
      images: ["https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=600&q=80"],
      tags: ["magnetic", "building", "stem", "educational"],
      categorySlugs: ["toys-games"],
    },
  ];

  const allProducts = [...gadgets, ...homeKitchen, ...jewellery, ...toys];

  for (const productData of allProducts) {
    const existing = await prisma.product.findUnique({ where: { slug: productData.slug } });
    if (existing) {
      console.log(`  ⏭️  Already exists: ${productData.title}`);
      continue;
    }

    const { categorySlugs, mrp, price, images, ...rest } = productData;
    const discountPercent = Math.round(((mrp - price) / mrp) * 100);

    const product = await prisma.product.create({
      data: {
        ...rest,
        mrp: mrp * 100,
        price: price * 100,
        discountPercent,
        images: JSON.stringify(images),
        tags: JSON.stringify(rest.tags),
        freeShipping: price >= 299,
        categoryProducts: {
          create: categorySlugs.map((slug) => ({
            categoryId: categories[slug],
          })).filter((cp) => cp.categoryId),
        },
      },
    });
    console.log(`  ✅ Product: ${product.title} — ₹${price} (${discountPercent}% off)`);
  }

  const totalProducts = await prisma.product.count();
  console.log(`\n🎉 Done! Total products: ${totalProducts}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
