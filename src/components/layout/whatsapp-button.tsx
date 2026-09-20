"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/917893653255?text=Hi%20Mohan!%20I%20need%20help"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[76px] right-4 lg:bottom-6 lg:right-6 z-50 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-all hover:scale-110 flex items-center justify-center"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
