import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, title: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  console.log("Recent products:", JSON.stringify(products, null, 2));
  const total = await prisma.product.count();
  console.log("Total products:", total);
}
main().catch(console.error).finally(() => prisma.$disconnect());
