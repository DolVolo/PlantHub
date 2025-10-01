"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import type { BasketItem, TreeProduct } from "../types";
import { useProductContext } from "./product-context";

interface BasketState {
  items: BasketItem[];
}

interface BasketContextValue extends BasketState {
  addItem: (product: TreeProduct, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearBasket: () => void;
  subtotal: number;
}

const BasketContext = createContext<BasketContextValue | undefined>(undefined);

type BasketAction =
  | { type: "ADD"; payload: { productId: string; quantity: number } }
  | { type: "REMOVE"; payload: { productId: string } }
  | { type: "UPDATE"; payload: { productId: string; quantity: number } }
  | { type: "CLEAR" };

function basketReducer(state: BasketState, action: BasketAction): BasketState {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find((item) => item.productId === action.payload.productId);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.productId === action.payload.productId
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item,
          ),
        };
      }
      return {
        items: [...state.items, { productId: action.payload.productId, quantity: action.payload.quantity }],
      };
    }
    case "REMOVE":
      return {
        items: state.items.filter((item) => item.productId !== action.payload.productId),
      };
    case "UPDATE":
      return {
        items: state.items.map((item) =>
          item.productId === action.payload.productId
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item,
        ),
      };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

const STORAGE_KEY = "planthub-basket";

function loadInitialState(): BasketState {
  if (typeof window === "undefined") {
    return { items: [] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as BasketState;
    if (!Array.isArray(parsed.items)) return { items: [] };
    return { items: parsed.items.filter((item) => typeof item.productId === "string" && item.quantity > 0) };
  } catch (error) {
    console.warn("Failed to parse basket state", error);
    return { items: [] };
  }
}

export function BasketProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(basketReducer, undefined, loadInitialState);
  const { products } = useProductContext();

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addItem = useCallback(
    (product: TreeProduct, quantity: number) => {
      dispatch({ type: "ADD", payload: { productId: product.id, quantity } });
    },
    [],
  );

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: "REMOVE", payload: { productId } });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: "UPDATE", payload: { productId, quantity } });
  }, []);

  const clearBasket = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const subtotal = useMemo(() => {
    return state.items.reduce((total, item) => {
      const product = products.find((product) => product.id === item.productId);
      if (!product) return total;
      return total + product.price * item.quantity;
    }, 0);
  }, [products, state.items]);

  const value = useMemo(
    () => ({
      ...state,
      addItem,
      removeItem,
      updateQuantity,
      clearBasket,
      subtotal,
    }),
    [addItem, removeItem, state, subtotal, updateQuantity, clearBasket],
  );

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useBasketContext() {
  const ctx = useContext(BasketContext);
  if (!ctx) {
    throw new Error("useBasketContext must be used within a BasketProvider");
  }
  return ctx;
}
