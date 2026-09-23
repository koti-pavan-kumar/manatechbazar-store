"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/stores/cart";
import { useWishlistStore } from "@/stores/wishlist";
import { showToast } from "@/components/cart-toast";
import { PackageX } from "lucide-react";

/**
 * Keeps the local cart & wishlist in sync with the live catalog.
 *
 * Cart/wishlist are localStorage snapshots, so when the admin deletes
 * (or hides) a product the stale copy would otherwise live on forever.
 * On every page load we ask the server which IDs are still alive and:
 *   - remove deleted / deactivated products from cart + wishlist
 *   - refresh price, stock, title, image on surviving items
 *   - clamp quantity to current stock
 */
export function CartSync() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const cart = useCartStore.getState();
    const wishlist = useWishlistStore.getState();
    const ids = [
      ...new Set([...cart.items.map((i) => i.id), ...wishlist.items.map((i) => i.id)]),
    ];
    if (ids.length === 0) return;

    (async () => {
      try {
        const res = await fetch("/api/products/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        });
        if (!res.ok) return;
        const data = await res.json();
        const alive: Record<string, any> = data.products || {};

        const c = useCartStore.getState();
        const w = useWishlistStore.getState();

        // ── Cart: drop dead items, refresh the living ──────────────
        const deadCart = c.items.filter((i) => !alive[i.id]);
        const nextCartItems = c.items
          .filter((i) => alive[i.id])
          .map((i) => {
            const fresh = alive[i.id];
            const stock = fresh.stock;
            return {
              ...i,
              title: fresh.title,
              slug: fresh.slug,
              price: fresh.price,
              mrp: fresh.mrp,
              image: fresh.image || i.image,
              stock,
              freeShipping: fresh.freeShipping,
              quantity: stock > 0 ? Math.min(i.quantity, stock) : i.quantity,
            };
          });

        // ── Wishlist: drop dead items, refresh the living ──────────
        const deadWishlist = w.items.filter((i) => !alive[i.id]);
        const nextWishlistItems = w.items
          .filter((i) => alive[i.id])
          .map((i) => {
            const fresh = alive[i.id];
            return {
              ...i,
              title: fresh.title,
              slug: fresh.slug,
              price: fresh.price,
              mrp: fresh.mrp,
              image: fresh.image || i.image,
            };
          });

        if (deadCart.length > 0 || nextCartItems.length !== c.items.length) {
          useCartStore.setState({ items: nextCartItems });
        } else if (
          JSON.stringify(nextCartItems.map((i) => [i.id, i.price, i.stock, i.title])) !==
          JSON.stringify(c.items.map((i) => [i.id, i.price, i.stock, i.title]))
        ) {
          useCartStore.setState({ items: nextCartItems });
        }

        if (deadWishlist.length > 0 || nextWishlistItems.length !== w.items.length) {
          useWishlistStore.setState({ items: nextWishlistItems });
        } else if (
          JSON.stringify(nextWishlistItems.map((i) => [i.id, i.price, i.title])) !==
          JSON.stringify(w.items.map((i) => [i.id, i.price, i.title]))
        ) {
          useWishlistStore.setState({ items: nextWishlistItems });
        }

        const removed = deadCart.length + deadWishlist.length;
        if (removed > 0) {
          showToast(
            removed === 1
              ? "1 item was removed — no longer available"
              : `${removed} items were removed — no longer available`,
            <PackageX className="h-4 w-4 text-white" />
          );
        }
      } catch {
        // Offline / API hiccup — keep the snapshot, retry next load
      }
    })();
  }, []);

  return null;
}
