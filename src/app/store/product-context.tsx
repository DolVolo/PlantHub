"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { initialTreeProducts } from "../data/products";
import type { TreeProduct } from "../types";

interface ProductContextValue {
  products: TreeProduct[];
  addProduct: (product: TreeProduct) => void;
  updateProduct: (id: string, updates: Partial<TreeProduct>) => void;
  getProductBySlug: (slug: string) => TreeProduct | undefined;
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<TreeProduct[]>(initialTreeProducts);

  const addProduct = useCallback((product: TreeProduct) => {
    setProducts((prev) => {
      if (prev.some((item) => item.id === product.id || item.slug === product.slug)) {
        return prev;
      }
      return [...prev, product];
    });
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<TreeProduct>) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              ...updates,
              deliveryOptions: updates.deliveryOptions ?? product.deliveryOptions,
            }
          : product,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({
      products,
      addProduct,
      updateProduct,
      getProductBySlug: (slug: string) => products.find((item) => item.slug === slug),
    }),
    [addProduct, products, updateProduct],
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProductContext() {
  const ctx = useContext(ProductContext);
  if (!ctx) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return ctx;
}
