"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#fff",
              borderRadius: "12px",
              fontSize: "14px",
              padding: "12px 16px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        />
      </SessionProvider>
    </ThemeProvider>
  );
}
