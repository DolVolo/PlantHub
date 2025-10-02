"use client";

import axios from "axios";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Shop } from "../types";

export type ShopStatus = "idle" | "loading" | "success" | "error";

interface ShopState {
  shops: Shop[];
  currentShop: Shop | null;
  status: ShopStatus;
  error?: string;
  fetchShops: (ownerId?: string) => Promise<void>;
  fetchShopById: (id: string) => Promise<Shop | null>;
  createShop: (shop: Omit<Shop, "id" | "createdAt" | "updatedAt" | "rating" | "totalSales">) => Promise<Shop>;
  updateShop: (id: string, updates: Partial<Shop>) => Promise<Shop>;
  deleteShop: (id: string) => Promise<void>;
}

export const useShopStore = create<ShopState>()(
  devtools((set, get) => ({
    shops: [],
    currentShop: null,
    status: "idle",
    error: undefined,

    fetchShops: async (ownerId) => {
      set({ status: "loading", error: undefined });
      try {
        const url = ownerId ? `/api/shops?ownerId=${ownerId}` : "/api/shops";
        const response = await axios.get<Shop[]>(url);
        set({ shops: response.data, status: "success" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลร้านค้าได้";
        set({ status: "error", error: message });
      }
    },

    fetchShopById: async (id) => {
      set({ status: "loading", error: undefined });
      try {
        const response = await axios.get<Shop>(`/api/shops/${id}`);
        set({ currentShop: response.data, status: "success" });
        return response.data;
      } catch (error) {
        const message = error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลร้านค้าได้";
        set({ status: "error", error: message });
        return null;
      }
    },

    createShop: async (shop) => {
      try {
        const response = await axios.post<Shop>("/api/shops", shop);
        set((state) => ({ 
          shops: [...state.shops, response.data],
          currentShop: response.data,
        }));
        return response.data;
      } catch (error) {
        const message = error instanceof Error ? error.message : "ไม่สามารถสร้างร้านค้าได้";
        set({ error: message });
        throw error;
      }
    },

    updateShop: async (id, updates) => {
      try {
        const response = await axios.put<Shop>(`/api/shops/${id}`, updates);
        set((state) => ({
          shops: state.shops.map((shop) =>
            shop.id === id ? response.data : shop
          ),
          currentShop: state.currentShop?.id === id ? response.data : state.currentShop,
        }));
        return response.data;
      } catch (error) {
        const message = error instanceof Error ? error.message : "ไม่สามารถอัปเดตร้านค้าได้";
        set({ error: message });
        throw error;
      }
    },

    deleteShop: async (id) => {
      try {
        await axios.delete(`/api/shops/${id}`);
        set((state) => ({
          shops: state.shops.filter((shop) => shop.id !== id),
          currentShop: state.currentShop?.id === id ? null : state.currentShop,
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : "ไม่สามารถลบร้านค้าได้";
        set({ error: message });
        throw error;
      }
    },
  }))
);
