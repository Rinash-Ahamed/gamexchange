import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { DecodedIdToken } from "firebase-admin/auth";
import { firebaseAdminAuth } from "@/lib/firebase/admin";
import { createIdleSession, deleteIdleSession, readIdleSession, touchIdleSession } from "./idle-store";

// A new name deliberately invalidates all legacy password-only cookies.
const COOKIE_NAME = "gamexchange_admin_mfa";
const SESSION_SECONDS = 60 * 60 * 8;

export class AdminAccessError extends Error {}

export function adminAuthConfigured() {
  return Boolean(process.env.FIREBASE_PROJECT_ID?.trim() && process.env.FIREBASE_ADMIN_UIDS?.trim());
}

function approvedUid(uid: string) {
  return (process.env.FIREBASE_ADMIN_UIDS ?? "").split(",").map((entry) => entry.trim()).filter(Boolean).includes(uid);
}

async function approvedUser(token: DecodedIdToken, requireTotp: boolean) {
  if (!approvedUid(token.uid)) throw new AdminAccessError("This account is not approved for admin access.");
  const user = await firebaseAdminAuth().getUser(token.uid);
  if (user.disabled || !user.email || user.email !== token.email) throw new AdminAccessError("Admin account is unavailable.");
  if (requireTotp && (!user.emailVerified || !token.email_verified || token.firebase.sign_in_second_factor !== "totp"
    || !user.multiFactor?.enrolledFactors.some((factor) => factor.factorId === "totp"))) {
    throw new AdminAccessError("Sign in with your password and authenticator code to continue.");
  }
  return user;
}

/** Enrollment checks never create an admin session or grant access to records. */
export async function checkAdminIdentity(idToken: string) {
  const token = await firebaseAdminAuth().verifyIdToken(idToken, true);
  const age = Date.now() / 1000 - token.auth_time;
  if (age < -60 || age > 300) throw new AdminAccessError("Please sign in again to continue.");
  const user = await approvedUser(token, false);
  return { emailVerified: user.emailVerified && Boolean(token.email_verified) };
}

export async function createAdminSession(idToken: string) {
  const auth = firebaseAdminAuth();
  const token = await auth.verifyIdToken(idToken, true);
  const age = Date.now() / 1000 - token.auth_time;
  if (age < -60 || age > 300) throw new AdminAccessError("Please sign in again to continue.");
  await approvedUser(token, true);
  const expiresAt = Date.now() + SESSION_SECONDS * 1000;
  const session = await auth.createSessionCookie(idToken, { expiresIn: SESSION_SECONDS * 1000 });
  await createIdleSession(session, token.uid, expiresAt);
  (await cookies()).set(COOKIE_NAME, session, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export const getAdminSession = cache(async () => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token || !adminAuthConfigured()) return null;
  try {
    const decoded = await firebaseAdminAuth().verifySessionCookie(token, true);
    const user = await approvedUser(decoded, true);
    const idleExpiresAt = await readIdleSession(token, user.uid);
    if (!idleExpiresAt) return null;
    return { uid: user.uid, email: user.email!, expiresAt: decoded.exp * 1000, idleExpiresAt: Math.min(idleExpiresAt, decoded.exp * 1000) };
  } catch {
    return null;
  }
});

export async function clearAdminSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  store.delete(COOKIE_NAME);
  store.delete("gamexchange_admin");
  if (token) await deleteIdleSession(token);
}

export async function recordAdminActivity(idleForMs: number) {
  const session = await getAdminSession();
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!session || !token) return null;
  return touchIdleSession(token, session.uid, idleForMs);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
