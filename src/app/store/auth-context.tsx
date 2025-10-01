"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import type { AuthUser } from "../types";

interface AuthContextValue {
  user: AuthUser | null;
  login: (credentials: { email: string; password: string }) => Promise<AuthUser>;
  logout: () => void;
  register: (input: { name: string; email: string; password: string; role?: AuthUser["role"] }) => Promise<AuthUser>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const fakeNetwork = () => new Promise((resolve) => setTimeout(resolve, 600));

  const login = useCallback(async ({ email }: { email: string; password: string }) => {
    await fakeNetwork();
    const authUser: AuthUser = {
      id: `user-${email}`,
      name: email.split("@")[0] ?? "Planter",
      email,
      role: "buyer",
    };
    setUser(authUser);
    return authUser;
  }, []);

  const register = useCallback(
    async ({ name, email, role = "buyer" }: { name: string; email: string; password: string; role?: AuthUser["role"] }) => {
      await fakeNetwork();
      const authUser: AuthUser = {
        id: `user-${email}`,
        name,
        email,
        role,
      };
      setUser(authUser);
      return authUser;
    },
    [],
  );

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo(() => ({ user, login, logout, register }), [login, logout, register, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
}
