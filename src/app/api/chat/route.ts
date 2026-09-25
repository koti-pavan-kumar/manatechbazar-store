import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { formatPrice, safeJsonParse } from "@/lib/utils";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: the chatbot calls a paid LLM API upstream — without
  // this, bots could drain the free quota in minutes.
  const ip = getClientIp(req);
  const rl = rateLimit(ip, {
    key: "chat",
    maxRequests: 20,
    windowMs: 60 * 1000,
  });
  if (!rl.allowed) {
    return rateLimitResponse(rl);
  }

  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Search products based on the query
    const searchTerms = message.toLowerCase().split(" ").filter((w: string) => w.length > 2);
    const products = await db.product.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: message } },
          { description: { contains: message } },
          ...searchTerms.map((term: string) => ({
            OR: [
              { title: { contains: term } },
              { description: { contains: term } },
              { tags: { contains: term } },
            ],
          })),
        ],
      },
      take: 5,
      include: { categoryProducts: { include: { category: true } } },
    });

    // Build context from catalog
    const catalogContext = products.length > 0
      ? products.map((p) => {
          const images = safeJsonParse(p.images, []);
          const cats = p.categoryProducts.map((cp) => cp.category.name).join(", ");
          return `- ${p.title} (${cats}): Market price ${formatPrice(p.mrp)}, Price ${formatPrice(p.price)}, ${p.discountPercent}% off, Stock: ${p.stock}, ID: ${p.id}`;
        }).join("\n")
      : "No products found matching the query.";

    const systemPrompt = `You are the friendly shopping assistant for an Indian online store called "Mana Tech Bazar" (Instagram: @manatechbazar). You help customers find products, answer questions about prices, stock, and categories.

RULES:
- ONLY answer based on the catalog data provided below. NEVER make up products or prices.
- Always respond in a friendly, helpful tone.
- Use Indian English (Hindi-English mix is fine).
- When mentioning prices, use ₹ symbol.
- If a product is out of stock, suggest similar alternatives from the catalog.
- Keep responses concise (2-4 sentences max).
- If asked about shipping: Free delivery above ₹499, otherwise ₹49 shipping.
- Payment methods: UPI, Cards, Net Banking and Wallets (via Razorpay). We do not offer Cash on Delivery.
- Direct customers to buy through the website checkout, not through WhatsApp.

CATALOG DATA:
${catalogContext}`;

    // Try Groq API (free tier)
    if (process.env.GROQ_API_KEY) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't understand that.";

        return NextResponse.json({
          reply,
          products: products.map((p) => ({
            id: p.id,
            title: p.title,
            price: p.price,
            mrp: p.mrp,
            slug: p.slug,
            image: safeJsonParse(p.images, [])[0],
          })),
        });
      }
    }

    // Fallback: simple template response
    let reply = "";
    if (products.length > 0) {
      reply = `I found ${products.length} product(s) that might interest you:\n\n`;
      products.forEach((p) => {
        reply += `• **${p.title}** — ${formatPrice(p.price)} (${p.discountPercent}% off)\n`;
      });
      reply += "\nWant to know more about any of these? Just ask! 😊";
    } else {
      reply = "I couldn't find products matching your query. Try browsing our categories or searching with different keywords! 🔍";
    }

    return NextResponse.json({
      reply,
      products: products.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        mrp: p.mrp,
        slug: p.slug,
        image: safeJsonParse(p.images, [])[0],
      })),
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { reply: "Sorry, I'm having trouble right now. Please try again or browse our products directly! 😊", products: [] },
      { status: 200 } // Return 200 so the UI still shows the error message gracefully
    );
  }
}
