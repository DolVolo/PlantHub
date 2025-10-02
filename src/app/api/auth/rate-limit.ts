// Simple in-memory rate limiter (best-effort, resets on serverless cold start)
// Not suitable for production at scale; replace with Redis/Upstash or durable store later.

interface RateWindow {
  hits: number[]; // epoch ms timestamps
}

const buckets = new Map<string, RateWindow>();

function purgeOld(now: number, windowMs: number, win: RateWindow) {
  // Remove entries older than window
  while (win.hits.length && now - win.hits[0] > windowMs) {
    win.hits.shift();
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfterSeconds?: number;
}

export function checkRateLimit(opts: { key: string; limit: number; windowMs: number }): RateLimitResult {
  const { key, limit, windowMs } = opts;
  const now = Date.now();
  let win = buckets.get(key);
  if (!win) {
    win = { hits: [] };
    buckets.set(key, win);
  }
  purgeOld(now, windowMs, win);

  if (win.hits.length >= limit) {
    const retryAfterMs = windowMs - (now - win.hits[0]);
    return {
      allowed: false,
      remaining: 0,
      limit,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  win.hits.push(now);
  return {
    allowed: true,
    remaining: Math.max(0, limit - win.hits.length),
    limit,
  };
}

// Helper for grouped limiting (e.g., apply multiple keys and block if any exceed)
export function enforceAll(results: RateLimitResult[]): RateLimitResult | null {
  return results.find((r) => !r.allowed) ?? null;
}
