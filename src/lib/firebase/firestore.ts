import "server-only";

import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { firebaseAdminApp } from "./admin";

let database: Firestore | undefined;

export function firebaseFirestore() {
  if (database) return database;
  const id = process.env.FIREBASE_DATABASE_ID?.trim();
  database = id ? getFirestore(firebaseAdminApp(), id) : getFirestore(firebaseAdminApp());
  return database;
}
