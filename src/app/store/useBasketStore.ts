"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { BasketItem, TreeProduct } from "../types";

interface BasketState {
  items: BasketItem[];
  addItem: (product: TreeProduct, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearBasket: () => void;
  hydrate: (items: BasketItem[]) => void;
}

export const useBasketStore = create<BasketState>()(
  devtools((set) => ({
    items: [],
    addItem: (product, quantity) => {
      set((state) => {
        const existing = state.items.find((item) => item.productId === product.id);
        if (existing) {
          return {
            items: state.items.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: Math.min(product.inStock, item.quantity + quantity) }
                : item,
            ),
          };
        }
        return {
          items: [...state.items, { productId: product.id, quantity: Math.min(product.inStock, quantity) }],
        };
      });
    },
    removeItem: (productId) => {
      set((state) => ({ items: state.items.filter((item) => item.productId !== productId) }));
    },
    updateQuantity: (productId, quantity) => {
      set((state) => ({
        items: state.items.map((item) =>
          item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item,
        ),
      }));
    },
    clearBasket: () => set({ items: [] }),
    hydrate: (items) => set({ items }),
  }))
);
