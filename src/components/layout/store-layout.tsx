"use client";

import { Header } from "./header";
import { Footer } from "./footer";
import { BottomNav } from "./bottom-nav";
import { WhatsAppButtonLazy } from "./whatsapp-button-lazy";
import { ChatWidgetLazy } from "@/components/chat-widget-lazy";
import { NavLoading } from "@/components/nav-loading";
import { CartToast } from "@/components/cart-toast";

export function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col w-full max-w-full overflow-x-clip">
      <NavLoading />
      <Header />
      <main className="flex-1 pb-20 lg:pb-0 w-full overflow-x-clip">{children}</main>
      <Footer />
      <BottomNav />
      <WhatsAppButtonLazy />
      <ChatWidgetLazy />
      <CartToast />
    </div>
  );
}
