import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({ select: { id: true, title: true, images: true } });
  for (const product of products) {
    const images = JSON.parse(product.images);
    const fixed = images.map((url: string) => url.replace("http://", "https://"));
    const fixedStr = JSON.stringify(fixed);
    if (fixedStr !== product.images) {
      await prisma.product.update({ where: { id: product.id }, data: { images: fixedStr } });
      console.log(`Fixed: ${product.title}`);
    }
  }
  console.log("Done!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
