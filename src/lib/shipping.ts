import { STORE } from "@/lib/constants";

export const FREE_SHIPPING_THRESHOLD_PAISE = STORE.minOrderForFreeShipping * 100;
export const DEFAULT_DELIVERY_CHARGE_PAISE = 4900; // ₹49

interface ShippingItem {
  freeShipping?: boolean;
  deliveryCharge?: number;
}

/**
 * Delivery charge for a cart, in paise.
 *
 * Rules (kept identical in cart page, checkout page, and /api/checkout):
 * - A cart at/above the free-shipping threshold is always free.
 * - Otherwise every non-free product contributes its own deliveryCharge;
 *   free-shipping products contribute nothing.
 * - All items ship in one parcel, so the charge is the highest single
 *   product charge in the cart (never a sum).
 */
export function computeShipping(subtotalPaise: number, items: ShippingItem[]): number {
  if (subtotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE) return 0;
  let charge = 0;
  for (const item of items) {
    if (item.freeShipping) continue;
    charge = Math.max(charge, item.deliveryCharge ?? DEFAULT_DELIVERY_CHARGE_PAISE);
  }
  return charge;
}
