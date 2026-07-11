/**
 * In-memory sliding-window rate limiter (per serverless instance).
 * For multi-region horizontal scale, replace the Map with Upstash Redis
 * keeping the same check() contract.
 */
type Bucket = { count: number; reset: number };
const store = new Map<string, Bucket>();

export function rateLimit(key: string, limit = 40, windowMs = 60_000): { ok: boolean; remaining: number } {
  const now = Date.now();
  const b = store.get(key);
  if (!b || b.reset < now) {
    store.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  b.count += 1;
  if (store.size > 10_000) for (const [k, v] of store) if (v.reset < now) store.delete(k);
  return { ok: b.count <= limit, remaining: Math.max(0, limit - b.count) };
}
