"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeJsonParse } from "@/lib/utils";

export interface CartProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  mrp: number;
  image: string;
  stock: number;
  freeShipping?: boolean;
  variantId?: string;
  variantLabel?: string;
  quantity: number;
}

interface CartStore {
  items: CartProduct[];
  couponCode: string | null;
  discount: number;

  addItem: (item: Omit<CartProduct, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;

  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      discount: 0,

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.id === item.id && i.variantId === item.variantId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.variantId === item.variantId
                  ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock) }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity }],
          };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.id === productId && i.variantId === (variantId || undefined))
          ),
        }));
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === productId && i.variantId === (variantId || undefined)
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [], couponCode: null, discount: 0 }),

      applyCoupon: (code, discount) => set({ couponCode: code, discount }),
      removeCoupon: () => set({ couponCode: null, discount: 0 }),

      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: "mohan-cart",
    }
  )
);
