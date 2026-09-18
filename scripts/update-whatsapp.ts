import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  await prisma.storeSetting.update({
    where: { id: "singleton" },
    data: { whatsappNumber: "917893653255" },
  });
  console.log("✅ WhatsApp number updated in database");
}
main().catch(console.error).finally(() => prisma.$disconnect());
