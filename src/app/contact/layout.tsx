import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

// The contact page is a client component, so its metadata lives here.
export const metadata: Metadata = pageMetadata({
  title: "Contact Us — Mana Tech Bazar",
  description:
    "Get in touch with Mana Tech Bazar on WhatsApp, email or phone. Support for orders, returns and enquiries.",
  path: "/contact",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
