import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductDetailContent } from "./product-detail-content";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      variants: true,
      categoryProducts: { include: { category: true } },
      reviews: { include: { user: { select: { name: true, image: true } } } },
    },
  });
  return product;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };

  const images = typeof product.images === "string" ? JSON.parse(product.images) : product.images;
  const description = product.description.slice(0, 160);

  // Absolute og:url + per-product og:image + canonical → rich preview
  // when the link is shared on Instagram, WhatsApp, Twitter, etc.
  return pageMetadata({
    title: product.title,
    description,
    path: `/products/${product.slug}`,
    image: images[0],
    imageAlt: product.title,
  });
}

export default async function ProductPage(props: Props) {
  const { slug } = await props.params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await db.product.findMany({
    where: {
      isActive: true,
      id: { not: product.id },
      categoryProducts: {
        some: {
          categoryId: { in: product.categoryProducts.map((cp) => cp.categoryId) },
        },
      },
    },
    take: 4,
  });

  return <ProductDetailContent product={product} related={related} />;
}
