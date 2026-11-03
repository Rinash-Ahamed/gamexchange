"use client";

import { getApps, initializeApp } from "firebase/app";
import { browserPopupRedirectResolver, browserSessionPersistence, inMemoryPersistence, initializeAuth } from "firebase/auth";
import { firebaseClientConfigured } from "./client";

let auth: ReturnType<typeof initializeAuth> | undefined;
/** A separate app/auth instance keeps shopper sign-in independent of admin MFA. */
export function customerClientAuth() {
  if (!firebaseClientConfigured) throw new Error("Customer sign-in is temporarily unavailable.");
  if (!auth) {
    const app = getApps().find((entry) => entry.name === "gamexchange-customer") ?? initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }, "gamexchange-customer");
    auth = initializeAuth(app, { persistence: [browserSessionPersistence, inMemoryPersistence], popupRedirectResolver: browserPopupRedirectResolver });
  }
  return auth;
}
