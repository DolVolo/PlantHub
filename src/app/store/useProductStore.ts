"use client";

import axios from "axios";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { TreeProduct } from "../types";

export type ProductStatus = "idle" | "loading" | "success" | "error";

interface ProductState {
  products: TreeProduct[];
  status: ProductStatus;
  error?: string;
  fetchProducts: (options?: { force?: boolean }) => Promise<void>;
  addProduct: (product: TreeProduct) => Promise<TreeProduct>;
  updateProduct: (id: string, updates: Partial<TreeProduct>) => void;
  getProductBySlug: (slug: string) => TreeProduct | undefined;
}

export const useProductStore = create<ProductState>()(
  devtools((set, get) => ({
    products: [],
    status: "idle",
    error: undefined,
    fetchProducts: async ({ force } = {}) => {
      const { status } = get();
      if (!force && (status === "loading" || status === "success")) {
        return;
      }

      set({ status: "loading", error: undefined });
      try {
        const response = await axios.get<TreeProduct[]>("/api/products");
        set({ products: response.data, status: "success" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "ไม่สามารถโหลดรายการสินค้าได้";
        set({ status: "error", error: message });
      }
    },
    addProduct: async (product) => {
      try {
        const response = await axios.post<TreeProduct>("/api/products", product);
        set((state) => ({ products: [...state.products, response.data] }));
        return response.data;
      } catch (error) {
        const message = error instanceof Error ? error.message : "ไม่สามารถเพิ่มสินค้าได้";
        set({ error: message });
        throw error;
      }
    },
    updateProduct: (id, updates) => {
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id
            ? {
                ...product,
                ...updates,
                deliveryOptions: updates.deliveryOptions ?? product.deliveryOptions,
              }
            : product,
        ),
      }));
    },
    getProductBySlug: (slug: string) => {
      const { products } = get();
      return products.find((product) => product.slug === slug);
    },
  }))
);
