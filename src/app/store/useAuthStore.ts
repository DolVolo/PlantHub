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
  requestPasswordReset: (email: string) => Promise<{ message: string; token?: string; expiresAt?: string }>;
  resetPassword: (input: { token: string; newPassword: string }) => Promise<AuthUser>;
  logout: () => void;
}

function extractErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === "object" && "message" in data && typeof (data as { message?: unknown }).message === "string") {
      return (data as { message: string }).message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
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
        const message = extractErrorMessage(error, "ไม่สามารถเข้าสู่ระบบได้");
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
        const message = extractErrorMessage(error, "ไม่สามารถสมัครสมาชิกได้");
        set({ error: message, isLoading: false });
        throw error;
      }
    },
    requestPasswordReset: async (email) => {
      set({ isLoading: true, error: undefined });
      try {
        const response = await axios.post<{ message: string; token?: string; expiresAt?: string }>(
          "/api/auth/forgot-password",
          { email }
        );
        set({ isLoading: false });
        return response.data;
      } catch (error) {
        const message = extractErrorMessage(error, "ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้");
        set({ error: message, isLoading: false });
        throw error;
      }
    },
    resetPassword: async ({ token, newPassword }) => {
      set({ isLoading: true, error: undefined });
      try {
        const response = await axios.post<{ message: string; user: AuthUser }>("/api/auth/reset-password", {
          token,
          newPassword,
        });
        set({ user: response.data.user, isLoading: false });
        return response.data.user;
      } catch (error) {
        const message = extractErrorMessage(error, "ไม่สามารถรีเซ็ตรหัสผ่านได้");
        set({ error: message, isLoading: false });
        throw error;
      }
    },
    logout: () => set({ user: null }),
  }))
);
