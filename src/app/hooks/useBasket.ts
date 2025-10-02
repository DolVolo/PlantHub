"use client";

import { useEffect, useMemo, useRef } from "react";
import { useBasketStore } from "../store/useBasketStore";
import { useProductStore } from "../store/useProductStore";

const STORAGE_KEY = "planthub-basket";

export function useBasket() {
  const items = useBasketStore((state) => state.items);
  const addItem = useBasketStore((state) => state.addItem);
  const removeItem = useBasketStore((state) => state.removeItem);
  const updateQuantity = useBasketStore((state) => state.updateQuantity);
  const clearBasket = useBasketStore((state) => state.clearBasket);
  const hydrate = useBasketStore((state) => state.hydrate);
  const products = useProductStore((state) => state.products);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (hasHydratedRef.current) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        hasHydratedRef.current = true;
        return;
      }
      const parsed = JSON.parse(raw) as { items?: unknown };
      if (Array.isArray(parsed.items)) {
        const filtered = parsed.items.filter(
          (item): item is { productId: string; quantity: number } =>
            !!item && typeof item.productId === "string" && typeof item.quantity === "number" && item.quantity > 0,
        );
        hydrate(filtered);
      }
    } catch (error) {
      console.warn("Failed to hydrate basket from storage", error);
    } finally {
      hasHydratedRef.current = true;
    }
  }, [hydrate]);

  useEffect(() => {
    if (!hasHydratedRef.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const product = products.find((product) => product.id === item.productId);
      if (!product) return total;
      return total + product.price * item.quantity;
    }, 0);
  }, [items, products]);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearBasket,
    subtotal,
  } as const;
}
