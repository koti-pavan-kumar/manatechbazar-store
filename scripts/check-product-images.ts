import { db } from "@/lib/prisma";

async function main() {
  const products = await db.product.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      images: true,
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`\nTotal products: ${products.length}\n`);

  for (const p of products) {
    let images: string[] = [];
    try {
      images = JSON.parse(p.images as string) || [];
    } catch {
      console.log(`❌ ${p.title} (${p.slug}) — UNPARSEABLE images: ${p.images}`);
      continue;
    }
    const httpUrls = images.filter((url: string) => url.startsWith("http://"));
    const httpsUrls = images.filter((url: string) => url.startsWith("https://"));
    
    if (images.length === 0 || httpUrls.length > 0) {
      console.log(`❌ ${p.title} (${p.slug})`);
      console.log(`   Images: ${JSON.stringify(images)}`);
    } else {
      console.log(`✅ ${p.title} — ${httpsUrls.length} images OK`);
    }
  }
}

main().catch(console.error);
