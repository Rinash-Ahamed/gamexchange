type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Fixed-window limiter held in server memory. Good for a single Node process; on serverless or
 * multi-instance hosting, back this with a shared store (e.g. Redis/Upstash) behind the same API.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();

  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true as const, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) return { ok: false as const, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  return { ok: true as const, retryAfter: 0 };
}
