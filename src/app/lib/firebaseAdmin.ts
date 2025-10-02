// Firebase Admin SDK initialization (server-side only)
// Use this in Next.js Route Handlers or Server Actions for privileged operations.

import { cert, getApps, initializeApp, type App as AdminApp } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { getStorage as getAdminStorage } from "firebase-admin/storage";

const projectId = process.env.FIREBASE_PROJECT_ID;

// Service account JSON fields (never expose these on client!)
interface ServiceAccountLike {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
}

const serviceAccount: ServiceAccountLike = {
  projectId: projectId,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

export function getFirebaseAdminApp(): AdminApp {
  if (!getApps().length) {
    if (!serviceAccount.clientEmail || !serviceAccount.privateKey || !serviceAccount.projectId) {
      console.warn("[Firebase-Admin] Missing service account fields. Admin SDK not fully initialized.");
      console.warn(
        "[Firebase-Admin] Debug info:",
        JSON.stringify(
          {
            hasProjectId: !!serviceAccount.projectId,
            hasClientEmail: !!serviceAccount.clientEmail,
            privateKeyLength: serviceAccount.privateKey?.length ?? 0,
            privateKeyFirstLine: serviceAccount.privateKey?.split("\n")[0] ?? null,
          },
          null,
          2,
        ),
      );
    } else {
      initializeApp({
        credential: cert({
          projectId: serviceAccount.projectId,
          clientEmail: serviceAccount.clientEmail,
          privateKey: serviceAccount.privateKey,
        }),
        projectId,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      });
    }
  }
  return getApps()[0] as AdminApp;
}

export const adminAuth = () => getAdminAuth(getFirebaseAdminApp());
export const adminFirestore = () => getAdminFirestore(getFirebaseAdminApp());
export const adminStorage = () => getAdminStorage(getFirebaseAdminApp());
