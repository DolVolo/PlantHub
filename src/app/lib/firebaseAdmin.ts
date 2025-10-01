// Firebase Admin SDK initialization (server-side only)
// Use this in Next.js Route Handlers or Server Actions for privileged operations.

import { cert, getApps, initializeApp, type App as AdminApp } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;

// Service account JSON fields (never expose these on client!)
const serviceAccount = {
  projectId: projectId,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Private key may contain literal '\n' characters when pasted from env var; convert them.
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

export function getFirebaseAdminApp(): AdminApp {
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount as any),
      projectId,
    });
  }
  return getApps()[0] as AdminApp;
}

export const adminAuth = () => getAdminAuth(getFirebaseAdminApp());
export const adminFirestore = () => getAdminFirestore(getFirebaseAdminApp());
