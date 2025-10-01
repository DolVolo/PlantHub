"use client";

import { useEffect } from "react";
import { useProductStore } from "../store/useProductStore";

export function useProducts(autoFetch: boolean = true) {
  const products = useProductStore((state) => state.products);
  const status = useProductStore((state) => state.status);
  const error = useProductStore((state) => state.error);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const addProduct = useProductStore((state) => state.addProduct);
  const updateProduct = useProductStore((state) => state.updateProduct);
  const getProductBySlug = useProductStore((state) => state.getProductBySlug);

  useEffect(() => {
    if (!autoFetch) return;
    if (status === "idle") {
      fetchProducts().catch((error) => console.error("Failed to fetch products", error));
    }
  }, [autoFetch, fetchProducts, status]);

  
  return {
    products,
    status,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    getProductBySlug,
  } as const;
}
