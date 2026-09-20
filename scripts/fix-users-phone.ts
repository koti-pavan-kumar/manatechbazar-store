import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // Use raw SQL to find and update users with NULL phone
  const users = await db.$queryRawUnsafe(`
    SELECT id, name, email, role FROM "User" WHERE phone IS NULL
  `) as any[];

  console.log(`Found ${users.length} users without phone numbers`);

  for (const user of users) {
    let phone: string;
    if (user.role === "ADMIN") {
      phone = "9000000001";
    } else {
      const hash = (user.email || "user").split("@")[0].replace(/[^0-9]/g, "");
      phone = `90${hash.slice(0, 8).padEnd(8, "0")}`;
    }

    // Ensure uniqueness
    const existing = await db.$queryRawUnsafe(
      `SELECT id FROM "User" WHERE phone = $1 AND id != $2`,
      phone, user.id
    ) as any[];
    
    if (existing.length > 0) {
      phone = phone + String(Math.floor(Math.random() * 9) + 1);
    }

    await db.$queryRawUnsafe(
      `UPDATE "User" SET phone = $1 WHERE id = $2`,
      phone, user.id
    );
    console.log(`  ✅ ${user.name} (${user.role}) → phone: ${phone}`);
  }

  console.log("\nAll users now have phone numbers.");
  await db.$disconnect();
}

main().catch(console.error);
