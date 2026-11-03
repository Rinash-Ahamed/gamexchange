"use client";

import { useEffect, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { customerClientAuth } from "@/lib/firebase/customer-client";
import { firebaseClientConfigured } from "@/lib/firebase/client";
import { customerSignInError } from "@/lib/firebase/customer-errors";

export function useCustomer() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!firebaseClientConfigured) return;
    return onAuthStateChanged(customerClientAuth(), (next) => { setUser(next); setReady(true); }, () => { setError("Sign-in is temporarily unavailable. Refresh to try again."); setReady(true); });
  }, []);
  async function login() {
    setBusy(true); setError("");
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(customerClientAuth(), provider);
    } catch (caught) {
      setError(customerSignInError(caught));
    } finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true); setError("");
    try { await signOut(customerClientAuth()); }
    catch { setError("Sign-out could not finish. Please try again."); }
    finally { setBusy(false); }
  }
  return { user, ready: ready || !firebaseClientConfigured, available: firebaseClientConfigured, busy, error, login, logout };
}
