"use client";

import { getApps, initializeApp } from "firebase/app";
import { inMemoryPersistence, initializeAuth } from "firebase/auth";

import { firebaseBrowserConfig, firebaseClientConfigured } from "./browser-config";
export { firebaseClientConfigured } from "./browser-config";

let auth: ReturnType<typeof initializeAuth> | undefined;
export function firebaseClientAuth() {
  if (!firebaseClientConfigured) throw new Error("Firebase browser configuration is missing. Add the NEXT_PUBLIC_FIREBASE_* variables and restart the server.");
  if (!auth) {
    const app = getApps().find((entry) => entry.name === "gamexchange-admin") ?? initializeApp(firebaseBrowserConfig, "gamexchange-admin");
    auth = initializeAuth(app, { persistence: inMemoryPersistence });
  }
  return auth;
}
