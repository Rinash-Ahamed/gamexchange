import "server-only";

import { createHmac, randomBytes } from "node:crypto";

const localSecret = randomBytes(32);
export function sharedSecurityStore() {
  const project = process.env.FIREBASE_PROJECT_ID?.trim();
  return Boolean(project && project !== "your-firebase-project-id");
}

export function signingSecret() {
  const secret = process.env.ENQUIRY_SECRET?.trim();
  if (secret && secret.length >= 32) return Buffer.from(secret);
  if (sharedSecurityStore()) throw new Error("Enquiry signing configuration unavailable.");
  return localSecret;
}

function documentId(key: string) {
  return createHmac("sha256", signingSecret()).update(key).digest("hex");
}

async function bounded<T>(operation: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("Security store timeout")), 5000); }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/** No raw IP, phone number, token or form content is stored. */
export async function sharedLimit(key: string, limit: number, windowMs: number) {
  const { firebaseFirestore } = await import("@/lib/firebase/firestore");
  const db = firebaseFirestore();
  const ref = db.collection("securityRateLimits").doc(documentId(key));
  return bounded(db.runTransaction(async (transaction) => {
    const data = (await transaction.get(ref)).data();
    const now = Date.now();
    const resetAt = typeof data?.resetAt === "number" && data.resetAt > now ? data.resetAt : now + windowMs;
    const count = resetAt === data?.resetAt ? Number(data.count ?? 0) : 0;
    if (count >= limit) return { ok: false, retryAfter: Math.max(1, Math.ceil((resetAt - now) / 1000)) };
    transaction.set(ref, { count: count + 1, resetAt, expiresAt: new Date(resetAt) });
    return { ok: true, retryAfter: 0 };
  }, { maxAttempts: 3 }));
}

/** Atomically consumes a nonce across all instances, regardless of delayed TTL cleanup. */
export async function consumeSharedToken(nonce: string, expiresAt: number) {
  const { firebaseFirestore } = await import("@/lib/firebase/firestore");
  const db = firebaseFirestore();
  const ref = db.collection("securityTokenUses").doc(documentId(`nonce:${nonce}`));
  return bounded(db.runTransaction(async (transaction) => {
    const current = await transaction.get(ref);
    if (current.exists || Date.now() > expiresAt) return false;
    transaction.create(ref, { expiresAt: new Date(expiresAt) });
    return true;
  }, { maxAttempts: 3 }));
}
