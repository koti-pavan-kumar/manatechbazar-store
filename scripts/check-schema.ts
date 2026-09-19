import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  // Check if freeShipping field exists on a product
  const product = await prisma.product.findFirst({
    select: { id: true, title: true } as any,
  });
  console.log("Product keys:", Object.keys(product || {}));
  
  // Try to query with freeShipping
  try {
    const p = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'Product' AND column_name = 'freeShipping'`;
    console.log("Column exists:", p);
  } catch (e: any) {
    console.log("Error checking column:", e.message);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
