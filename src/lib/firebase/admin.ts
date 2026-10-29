import "server-only";

import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

export function firebaseAdminApp() {
  const existing = getApps().find((app) => app.name === "[DEFAULT]");
  if (existing) return existing;
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!projectId) throw new Error("FIREBASE_PROJECT_ID is required.");
  if (process.env.FIREBASE_USE_APPLICATION_DEFAULT_CREDENTIALS === "true") {
    return initializeApp({ credential: applicationDefault(), projectId });
  }
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
  if (!clientEmail || !privateKey) throw new Error("Firebase server credentials are not configured.");
  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
}

export const firebaseAdminAuth = () => getAuth(firebaseAdminApp());
