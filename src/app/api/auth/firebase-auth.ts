// Firebase Authentication helpers for API routes (server-side)
import { adminAuth, adminFirestore } from "../../lib/firebaseAdmin";
import type { AuthUser } from "../../types";

/**
 * Create a new user in Firebase Auth + Firestore
 */
export async function createFirebaseUser(input: {
  email: string;
  password: string;
  name: string;
  role: AuthUser["role"];
}): Promise<AuthUser> {
  try {
    // Create Firebase Auth user
    const userRecord = await adminAuth().createUser({
      email: input.email,
      password: input.password,
      displayName: input.name,
    });

    // Set custom claims for role-based access
    await adminAuth().setCustomUserClaims(userRecord.uid, {
      role: input.role,
    });

    // Store extended profile in Firestore
    const userProfile: AuthUser = {
      id: userRecord.uid,
      email: input.email,
      name: input.name,
      role: input.role,
    };

    await adminFirestore()
      .collection("users")
      .doc(userRecord.uid)
      .set({
        ...userProfile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    return userProfile;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "auth/email-already-exists") {
        throw new Error("อีเมลนี้ถูกใช้งานแล้ว");
      }
    }
    console.error("[Firebase Auth] Create user failed:", error);
    throw new Error("ไม่สามารถสร้างบัญชีได้ กรุณาลองใหม่อีกครั้ง");
  }
}

/**
 * Verify user credentials (for login)
 * Note: Firebase Admin SDK doesn't have signInWithEmailAndPassword
 * Client should use Firebase Auth client SDK instead
 */
export async function verifyFirebaseUser(email: string): Promise<AuthUser | null> {
  try {
    const userRecord = await adminAuth().getUserByEmail(email);
    const userDoc = await adminFirestore().collection("users").doc(userRecord.uid).get();

    if (!userDoc.exists) {
      return null;
    }

    const data = userDoc.data();
    return {
      id: userRecord.uid,
      email: userRecord.email!,
      name: data?.name || userRecord.displayName || "Unknown",
      role: data?.role || "buyer",
    };
  } catch (error) {
    console.error("[Firebase Auth] Verify user failed:", error);
    return null;
  }
}

/**
 * Get user profile from Firestore by UID
 */
export async function getFirebaseUserById(uid: string): Promise<AuthUser | null> {
  try {
    const userDoc = await adminFirestore().collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return null;
    }

    const data = userDoc.data();
    return {
      id: uid,
      email: data?.email || "",
      name: data?.name || "",
      role: data?.role || "buyer",
    };
  } catch (error) {
    console.error("[Firebase] Get user failed:", error);
    return null;
  }
}

/**
 * Get user by email from Firebase
 */
export async function getFirebaseUserByEmail(email: string): Promise<AuthUser | null> {
  try {
    const userRecord = await adminAuth().getUserByEmail(email);
    const userDoc = await adminFirestore().collection("users").doc(userRecord.uid).get();

    if (!userDoc.exists) {
      return null;
    }

    const data = userDoc.data();
    return {
      id: userRecord.uid,
      email: userRecord.email!,
      name: data?.name || userRecord.displayName || "Unknown",
      role: data?.role || "buyer",
    };
  } catch (error) {
    const errorWithCode = error as { code?: string };
    if (errorWithCode.code === "auth/user-not-found") {
      return null;
    }
    console.error("[Firebase] Get user by email failed:", error);
    return null;
  }
}

/**
 * Update user profile in Firestore
 */
export async function updateFirebaseUser(
  uid: string,
  updates: Partial<Pick<AuthUser, "name" | "role">>,
): Promise<void> {
  try {
    await adminFirestore()
      .collection("users")
      .doc(uid)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });
  } catch (error) {
    console.error("[Firebase] Update user failed:", error);
    throw new Error("ไม่สามารถอัปเดตข้อมูลได้");
  }
}
