"use client";

import axios from "axios";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { AuthUser } from "../types";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error?: string;
  login: (credentials: { email: string; password: string }) => Promise<AuthUser>;
  register: (input: { name: string; email: string; password: string; role?: AuthUser["role"] }) => Promise<AuthUser>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    user: null,
    isLoading: false,
    error: undefined,
    login: async ({ email, password }) => {
      set({ isLoading: true, error: undefined });
      try {
        const response = await axios.post<AuthUser>("/api/auth/login", { email, password });
        set({ user: response.data, isLoading: false });
        return response.data;
      } catch (error) {
        const message = error instanceof Error ? error.message : "ไม่สามารถเข้าสู่ระบบได้";
        set({ error: message, isLoading: false });
        throw error;
      }
    },
    register: async ({ name, email, password, role = "buyer" }) => {
      set({ isLoading: true, error: undefined });
      try {
        const response = await axios.post<AuthUser>("/api/auth/register", { name, email, password, role });
        set({ user: response.data, isLoading: false });
        return response.data;
      } catch (error) {
        const message = error instanceof Error ? error.message : "ไม่สามารถสมัครสมาชิกได้";
        set({ error: message, isLoading: false });
        throw error;
      }
    },
    logout: () => set({ user: null }),
  }))
);
