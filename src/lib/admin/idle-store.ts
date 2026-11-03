import "server-only";

import { createHash } from "node:crypto";
import { firebaseFirestore } from "@/lib/firebase/firestore";
import { adminIdleDeadline, adminIdleRecordValid } from "./idle-policy";

// Never persist the bearer cookie. Each browser session has independent inactivity state.
const sessionRef = (cookie: string) => firebaseFirestore().collection("adminSessions").doc(createHash("sha256").update(cookie).digest("hex"));

export async function createIdleSession(cookie: string, uid: string, expiresAt: number) {
  await sessionRef(cookie).set({ uid, lastActiveAt: Date.now(), expiresAt });
}

export async function readIdleSession(cookie: string, uid: string) {
  const record = (await sessionRef(cookie).get()).data();
  if (!adminIdleRecordValid(record, uid, Date.now())) return null;
  return adminIdleDeadline(record!.lastActiveAt, record!.expiresAt);
}

export async function touchIdleSession(cookie: string, uid: string, idleForMs: number) {
  const ref = sessionRef(cookie);
  return firebaseFirestore().runTransaction(async (transaction) => {
    const record = (await transaction.get(ref)).data();
    const now = Date.now();
    // Check inside the transaction: a timed-out/deleted session cannot be revived.
    if (!adminIdleRecordValid(record, uid, now)) return null;
    const lastActiveAt = Math.max(record!.lastActiveAt, now - idleForMs);
    transaction.update(ref, { lastActiveAt });
    return adminIdleDeadline(lastActiveAt, record!.expiresAt);
  });
}

export async function deleteIdleSession(cookie: string) {
  await sessionRef(cookie).delete();
}
