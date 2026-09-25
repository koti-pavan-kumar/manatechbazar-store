import type { Metadata } from "next";
import { STORE } from "./constants";

/**
 * Fallback social-share image for pages without their own
 * (home page hero collage). Absolute URL — required by
 * Instagram / WhatsApp / Twitter scrapers.
 */
export const DEFAULT_OG_IMAGE = `${STORE.siteUrl}/slide-gadgets.png`;

/** Build an absolute URL on the canonical domain. */
export function absoluteUrl(path: string = "/"): string {
  return `${STORE.siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

interface PageMetaInput {
  /** Page title (template from the root layout is applied). */
  title?: string;
  description?: string;
  /** Path on the canonical domain, e.g. "/products/blue-watch". */
  path?: string;
  /** Absolute image URL to show in share previews (og:image). */
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
}

/**
 * One place that always emits:
 *  - <link rel="canonical">  (absolute)
 *  - og:url + og:image + og:site_name
 *  - twitter:card summary_large_image
 * so shared links render as a rich card instead of a bare link.
 */
export function pageMetadata({
  title,
  description,
  path = "/",
  image,    imageAlt,
    type = "website",
  }: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image || DEFAULT_OG_IMAGE;
  const images = [{ url: ogImage, alt: imageAlt || STORE.name }];

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: { canonical: url },
    openGraph: {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      url,
      siteName: STORE.name,
      locale: "en_IN",
      type,
      images,
    },
    twitter: {
      card: "summary_large_image",
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images: [ogImage],
    },
  };
}
