"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

export function WhatsAppButton() {
  const pathname = usePathname();
  // On product pages the sticky Buy bar occupies the space right above the
  // bottom nav, so lift the FAB above it instead of letting it cover Buy Now.
  const overStickyBar = /^\/products\/[^/]+/.test(pathname ?? "");

  return (
    <a
      href="https://wa.me/917893653255?text=Hi%20Mohan!%20I%20need%20help"
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed right-4 z-50 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-all hover:scale-110 flex items-center justify-center lg:bottom-6 lg:right-6 ${
        overStickyBar ? "bottom-[132px]" : "bottom-[76px]"
      }`}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
