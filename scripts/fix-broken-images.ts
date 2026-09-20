import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Map of broken image URLs → working replacements (all tested returning HTTP 200)
const replacements: Record<string, string> = {
  // Magnetic Building Blocks Set → building blocks toy
  "photo-1587654780291-39c9404d7dd0": "photo-1567789884554-0b844b597180",
  // Plush Teddy Bear → stuffed animal
  "photo-1559715541-e5e34874cc6e": "photo-1563396983906-b3795482a59a",
  // 1000 Piece Jigsaw Puzzle → puzzle game
  "photo-1606503153255-59d8b2e4b9e4": "photo-1568393691622-c7ba131d63b4",
  // RC Helicopter / Mini Drone → drone
  "photo-1521405924368-64c5b84be36b": "photo-1507582020474-9a35b7d455d9",
  // RC Racing Car → toy car
  "photo-1577401239170-897c650e3e44": "photo-1516035069371-29a1b244cc32",
  // LED Desk Lamp → desk lamp
  "photo-1507473885765-e6ed057ab6fe": "photo-1608043152269-423dbba4e7e1",
  // Silver Toe Rings → jewellery
  "photo-1515562141589-67f0d569b40e": "photo-1535632066927-ab7c9ab60908",
  // Pearl Bracelet → bracelet jewellery
  "photo-1584568694244-44cb124eb2d7": "photo-1523275335684-37898b6baf30",
};

async function main() {
  const products = await db.product.findMany({
    select: { id: true, title: true, images: true },
  });

  let fixed = 0;
  for (const product of products) {
    let images: string[] = [];
    try {
      images = JSON.parse(product.images || "[]");
    } catch {
      images = [product.images || ""];
    }

    let changed = false;
    const newImages = images.map((url) => {
      for (const [broken, working] of Object.entries(replacements)) {
        if (url.includes(broken) && url !== working) {
          const newUrl = url.replace(broken, working);
          console.log(`  Fixed: ${product.title} → ${broken} → ${working}`);
          changed = true;
          return newUrl;
        }
      }
      return url;
    });

    if (changed) {
      await db.product.update({
        where: { id: product.id },
        data: { images: JSON.stringify(newImages) },
      });
      fixed++;
    }
  }

  console.log(`\nFixed ${fixed} products with broken images`);
  await db.$disconnect();
}

main().catch(console.error);
