"use client";

import { ShoppingCart, Check, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ToastItem {
  id: number;
  message: string;
  icon: React.ReactNode;
}

let toastId = 0;
let listeners: ((toasts: ToastItem[]) => void)[] = [];
let toasts: ToastItem[] = [];

function notify() {
  listeners.forEach((l) => l([...toasts]));
}

export function showToast(message: string, icon?: React.ReactNode) {
  const id = ++toastId;
  const item: ToastItem = {
    id,
    message,
    icon: icon || <ShoppingCart className="h-4 w-4 text-green-400" />,
  };
  toasts = [...toasts, item];
  notify();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }, 3000);
}

export function CartToast() {
  const [list, setList] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (t: ToastItem[]) => setList(t);
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  if (list.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
      {list.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-2xl shadow-green-600/40 animate-slide-up max-w-[90vw]"
          style={{
            animation: "toast-slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
            <Check className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold whitespace-nowrap">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
