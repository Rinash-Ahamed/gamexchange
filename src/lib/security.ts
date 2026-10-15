import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * Secret for signing form tokens. Set ENQUIRY_SECRET in production (required when more than one
 * server instance runs, so every instance can verify tokens issued by another). Without it we
 * fall back to a per-process random secret: safe, but tokens die on restart / are instance-local.
 */
const secret = process.env.ENQUIRY_SECRET ? Buffer.from(process.env.ENQUIRY_SECRET) : randomBytes(32);

const MIN_AGE_MS = 2_000; // people can't fill a form faster than this
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

const sign = (payload: string) => createHmac("sha256", secret).update(payload).digest("base64url");

/** Single-use form token: `<issuedAt>.<nonce>.<hmac>`. */
export function issueToken(now = Date.now()) {
  const payload = `${now}.${randomBytes(9).toString("base64url")}`;
  return `${payload}.${sign(payload)}`;
}

const used = new Map<string, number>();

export type TokenResult = "ok" | "missing" | "invalid" | "too-fast" | "expired" | "replayed";

export function verifyToken(token: unknown, now = Date.now()): TokenResult {
  if (typeof token !== "string" || token.length === 0) return "missing";
  const parts = token.split(".");
  if (parts.length !== 3) return "invalid";
  const [issued, nonce, mac] = parts as [string, string, string];
  const expected = sign(`${issued}.${nonce}`);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return "invalid";

  const age = now - Number(issued);
  if (!Number.isFinite(age) || age < 0) return "invalid";
  if (age < MIN_AGE_MS) return "too-fast";
  if (age > MAX_AGE_MS) return "expired";

  for (const [k, t] of used) if (now - t > MAX_AGE_MS) used.delete(k);
  if (used.has(nonce)) return "replayed";
  used.set(nonce, now);
  return "ok";
}

/**
 * Same-origin check for state-changing requests. Browsers always send Origin on cross-site
 * POSTs; we accept only an exact host match, or Sec-Fetch-Site: same-origin when Origin is absent.
 * This stops cross-site form posts (CSRF); it is not bot protection. That is the token,
 * honeypot and rate limits.
 */
export function isSameOrigin(req: NextRequest) {
  const host = req.headers.get("host");
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  return req.headers.get("sec-fetch-site") === "same-origin";
}

/**
 * Client key for rate limiting. The RIGHTMOST X-Forwarded-For entry is the one appended by the
 * nearest trusted proxy; leftmost entries are client-supplied and trivially spoofed.
 */
export function clientKey(req: NextRequest) {
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",").at(-1)?.trim() || "unknown";
  return "unknown";
}
