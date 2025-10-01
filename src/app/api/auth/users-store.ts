import { randomUUID } from "crypto";
import type { AuthUser } from "../../types";

interface AuthRecord {
  user: AuthUser;
  password: string;
}

const authRecords: AuthRecord[] = [
  {
    user: {
      id: "demo-buyer",
      name: "Demo Buyer",
      email: "buyer@planthub.dev",
      role: "buyer",
    },
    password: "password123",
  },
  {
    user: {
      id: "demo-seller",
      name: "Demo Seller",
      email: "seller@planthub.dev",
      role: "seller",
    },
    password: "password123",
  },
];

const resetTokens = new Map<
  string,
  {
    email: string;
    expiresAt: number;
  }
>();

const RESET_TOKEN_TTL_MS = 1000 * 60 * 15; // 15 minutes

function purgeExpiredTokens() {
  const now = Date.now();
  for (const [token, metadata] of resetTokens.entries()) {
    if (metadata.expiresAt <= now) {
      resetTokens.delete(token);
    }
  }
}

export function authenticate(email: string, password: string): AuthUser | null {
  const record = authRecords.find((item) => item.user.email === email);
  if (!record) return null;
  return record.password === password ? record.user : null;
}

export function emailExists(email: string) {
  return authRecords.some((item) => item.user.email === email);
}

export function findUserByEmail(email: string) {
  const record = authRecords.find((item) => item.user.email === email);
  return record?.user ?? null;
}

export function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: AuthUser["role"];
}): AuthUser {
  const user: AuthUser = {
    id: `user-${Date.now()}`,
    name: input.name,
    email: input.email,
    role: input.role,
  };

  authRecords.push({ user, password: input.password });
  return user;
}

export function getUsers() {
  return authRecords.map((item) => item.user);
}

export function issuePasswordResetToken(email: string) {
  const record = authRecords.find((item) => item.user.email === email);
  if (!record) {
    purgeExpiredTokens();
    return null;
  }

  purgeExpiredTokens();
  const token = randomUUID().replace(/-/g, "");
  const expiresAt = Date.now() + RESET_TOKEN_TTL_MS;
  resetTokens.set(token, { email, expiresAt });

  return {
    token,
    expiresAt,
    user: record.user,
  };
}

export function resetPasswordWithToken(token: string, newPassword: string) {
  purgeExpiredTokens();
  const metadata = resetTokens.get(token);
  if (!metadata) {
    return null;
  }

  const record = authRecords.find((item) => item.user.email === metadata.email);
  if (!record) {
    resetTokens.delete(token);
    return null;
  }

  record.password = newPassword;
  resetTokens.delete(token);
  return record.user;
}

export function getResetTokenTTLMinutes() {
  return Math.round(RESET_TOKEN_TTL_MS / 60000);
}
