type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

/**
 * Fixed-window limiter held in server memory. Good for a single Node process; on serverless or
 * multi-instance hosting, back this with a shared store (e.g. Redis/Upstash) behind the same API.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();

  if (buckets.size >= MAX_BUCKETS) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    // Do not evict active buckets: that would let new client IDs bypass existing limits.
    if (!bucket && buckets.size >= MAX_BUCKETS) return { ok: false as const, retryAfter: 60 };
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true as const, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) return { ok: false as const, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  return { ok: true as const, retryAfter: 0 };
}
