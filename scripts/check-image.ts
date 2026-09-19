import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const product = await prisma.product.findFirst({
    where: { slug: "keychain" },
    select: { title: true, images: true },
  });
  console.log("Product:", JSON.stringify(product, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
