"use client";

import { Header } from "./header";
import { Footer } from "./footer";
import { BottomNav } from "./bottom-nav";
import { WhatsAppButton } from "./whatsapp-button";
import { ChatWidget } from "@/components/chat-widget";

export function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <Footer />
      <BottomNav />
      <WhatsAppButton />
      <ChatWidget />
    </div>
  );
}
