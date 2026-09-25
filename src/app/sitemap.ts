import { MetadataRoute } from "next";
import { db } from "@/lib/prisma";
import { STORE } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Always the canonical domain — never derive from NEXTAUTH_URL,
  // which points at the Vercel deployment host (mentor's bug report).
  const baseUrl = STORE.siteUrl;

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    db.category.findMany({
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/offers`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified: new Date(), priority: 0.3 },
    { url: `${baseUrl}/register`, lastModified: new Date(), priority: 0.3 },
  ];

  const productPages = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: p.updatedAt,
    priority: 0.8,
  }));

  const categoryPages = categories.map((c) => ({
    url: `${baseUrl}/category/${c.slug}`,
    lastModified: c.updatedAt,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
