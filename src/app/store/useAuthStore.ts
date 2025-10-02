"use client";

import axios from "axios";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { AuthUser } from "../types";
import { 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  type User
} from "firebase/auth";
import { firebaseAuth } from "../lib/firebaseClient";

// Toggle between Firebase client auth (true) or API-based auth (false)
const USE_FIREBASE_CLIENT = typeof window !== "undefined" && !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

interface AuthState {
  user: AuthUser | null;
  firebaseUser: User | null;
  isLoading: boolean;
  error?: string;
  initialized: boolean;
  login: (credentials: { email: string; password: string }) => Promise<AuthUser>;
  register: (input: { name: string; email: string; password: string; role?: AuthUser["role"] }) => Promise<AuthUser>;
  requestPasswordReset: (email: string) => Promise<{ message: string; token?: string; expiresAt?: string }>;
  resetPassword: (input: { token: string; newPassword: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null, firebaseUser: User | null) => void;
  setInitialized: (initialized: boolean) => void;
  updateUserProfile: (userId: string, updates: { name?: string; profileImageUrl?: string }) => Promise<AuthUser>;
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
    firebaseUser: null,
    isLoading: true, // Start with loading true to check auth state
    error: undefined,
    initialized: false,
    
    setUser: (user, firebaseUser) => {
      set({ user, firebaseUser });
    },
    
    setInitialized: (initialized) => {
      set({ initialized, isLoading: false });
    },
    
    login: async ({ email, password }) => {
      set({ isLoading: true, error: undefined });
      try {
        if (USE_FIREBASE_CLIENT) {
          // Firebase client-side authentication
          const auth = firebaseAuth();
          const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
          const token = await credential.user.getIdTokenResult();
          
          const user: AuthUser = {
            id: credential.user.uid,
            email: credential.user.email!,
            name: credential.user.displayName || "User",
            role: (token.claims.role as AuthUser["role"]) || "buyer",
          };
          
          set({ user, firebaseUser: credential.user, isLoading: false });
          console.info("[Auth] Firebase sign-in success:", user.id);
          return user;
        } else {
          // Fallback: API-based auth
          const response = await axios.post<AuthUser>("/api/auth/login", { email, password });
          set({ user: response.data, isLoading: false });
          return response.data;
        }
      } catch (error) {
        const message = extractErrorMessage(error, "ไม่สามารถเข้าสู่ระบบได้");
        set({ error: message, isLoading: false });
        throw error;
      }
    },
    
    register: async ({ name, email, password, role = "buyer" }) => {
      set({ isLoading: true, error: undefined });
      try {
        // Always call API first to create user in Firestore with role
        const response = await axios.post<AuthUser>("/api/auth/register", { name, email, password, role });
        
        if (USE_FIREBASE_CLIENT) {
          // Then sign in with Firebase client
          const auth = firebaseAuth();
          const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
          set({ user: response.data, firebaseUser: credential.user, isLoading: false });
          console.info("[Auth] Firebase registration + sign-in success:", response.data.id);
        } else {
          set({ user: response.data, isLoading: false });
        }
        
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
        // Always use API route for password reset (Firebase Admin SDK + SMTP)
        // This ensures emails are sent through our configured SMTP transport
        const response = await axios.post<{ message: string; token?: string; expiresAt?: string; resetUrl?: string; emailDelivered?: boolean }>(
          "/api/auth/forgot-password",
          { email: email.trim().toLowerCase() }
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
        // Custom token-based reset (for non-Firebase flow)
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
    
    logout: async () => {
      if (USE_FIREBASE_CLIENT) {
        const auth = firebaseAuth();
        await signOut(auth);
        console.info("[Auth] Firebase sign-out");
      }
      set({ user: null, firebaseUser: null });
    },
    
    updateUserProfile: async (userId, updates) => {
      set({ isLoading: true, error: undefined });
      try {
        const response = await axios.put<AuthUser>(`/api/users/${userId}/update`, updates);
        
        // Update local state with new user data
        set((state) => ({
          user: response.data,
          isLoading: false,
        }));
        
        console.info("[Auth] Profile updated:", response.data);
        return response.data;
      } catch (error) {
        const message = extractErrorMessage(error, "ไม่สามารถอัปเดตโปรไฟล์ได้");
        set({ error: message, isLoading: false });
        throw error;
      }
    },
  }))
);

// Initialize auth state listener on client side
if (USE_FIREBASE_CLIENT && typeof window !== "undefined") {
  const auth = firebaseAuth();
  
  onAuthStateChanged(auth, async (firebaseUser) => {
    const store = useAuthStore.getState();
    
    if (firebaseUser) {
      try {
        // Get user token and custom claims
        const token = await firebaseUser.getIdTokenResult();
        
        // Fetch full user profile from Firestore via API
        const response = await axios.get<AuthUser>(`/api/users/${firebaseUser.uid}`);
        
        const user: AuthUser = {
          ...response.data,
          role: (token.claims.role as AuthUser["role"]) || response.data.role || "buyer",
        };
        
        store.setUser(user, firebaseUser);
        console.info("[Auth] Session restored:", user.id);
      } catch (error) {
        console.error("[Auth] Failed to restore session:", error);
        store.setUser(null, null);
      }
    } else {
      store.setUser(null, null);
      console.info("[Auth] No active session");
    }
    
    store.setInitialized(true);
  });
}
