"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./store/auth-context";
import { BasketProvider } from "./store/basket-context";
import { ProductProvider } from "./store/product-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ProductProvider>
      <AuthProvider>
        <BasketProvider>{children}</BasketProvider>
      </AuthProvider>
    </ProductProvider>
  );
}
