"use client";

import { getApps, initializeApp } from "firebase/app";
import { browserPopupRedirectResolver, browserSessionPersistence, inMemoryPersistence, initializeAuth } from "firebase/auth";
import { firebaseBrowserConfig, firebaseClientConfigured } from "./browser-config";

let auth: ReturnType<typeof initializeAuth> | undefined;
/** A separate app/auth instance keeps shopper sign-in independent of admin MFA. */
export function customerClientAuth() {
  if (!firebaseClientConfigured) throw new Error("Customer sign-in is temporarily unavailable.");
  if (!auth) {
    const app = getApps().find((entry) => entry.name === "gamexchange-customer") ?? initializeApp(firebaseBrowserConfig, "gamexchange-customer");
    auth = initializeAuth(app, { persistence: [browserSessionPersistence, inMemoryPersistence], popupRedirectResolver: browserPopupRedirectResolver });
  }
  return auth;
}
