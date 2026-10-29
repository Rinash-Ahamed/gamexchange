import "server-only";

import { getStorage } from "firebase-admin/storage";
import { firebaseAdminApp } from "./admin";

/** Callers retain their own safe, user-facing configuration errors. */
export function firebaseStorageBucket(configurationError: () => Error) {
  const name = process.env.FIREBASE_STORAGE_BUCKET?.trim();
  if (!name || name.startsWith("gs://") || name.includes("/")) throw configurationError();
  return getStorage(firebaseAdminApp()).bucket(name);
}
