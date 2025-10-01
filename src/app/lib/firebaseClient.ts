// Firebase client SDK initialization (runs in the browser)
// Use this for auth (client side), Firestore read (public data), etc.

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import type { FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Strongly typed Firebase client config
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function getFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn(
        "[Firebase] Missing required public config values. Check your NEXT_PUBLIC_FIREBASE_* env vars.",
      );
    }
    initializeApp(firebaseConfig);
  }
  return getApps()[0]!;
}

export const firebaseAuth = () => getAuth(getFirebaseApp());
export const firestore = () => getFirestore(getFirebaseApp());
