/**
 * A small in-memory rate limiter for /api/theme, so nobody can burn through the AI quota (Gemini, Workers AI…).
 * Per visitor (IP): a few requests per window. Plus a global cap per day as a last line of defence.
 *
 * On Cloudflare each isolate keeps its own memory, so this is best effort. For hard limits, also add a Cloudflare
 * rate limiting rule on /api/theme (free plan) and a daily request quota on the Gemini key in Google Cloud.
 */
export type LimitResult = { ok: true } | { ok: false; retryAfterSeconds: number; scope: "visitor" | "global" };

export function createLimiter({
  perVisitor = 6,
  windowMs = 10 * 60_000,
  globalPerDay = 500,
}: {
  perVisitor?: number;
  windowMs?: number;
  globalPerDay?: number;
} = {}) {
  const hits = new Map<string, number[]>();
  let day = 0;
  let dayCount = 0;

  return function check(visitor: string, now = Date.now()): LimitResult {
    const today = Math.floor(now / 86_400_000);
    if (today !== day) {
      day = today;
      dayCount = 0;
    }
    if (dayCount >= globalPerDay) {
      return { ok: false, retryAfterSeconds: Math.ceil(((today + 1) * 86_400_000 - now) / 1000), scope: "global" };
    }
    const recent = (hits.get(visitor) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= perVisitor) {
      hits.set(visitor, recent);
      return {
        ok: false,
        retryAfterSeconds: Math.ceil((windowMs - (now - (recent[0] ?? now))) / 1000),
        scope: "visitor",
      };
    }
    recent.push(now);
    hits.set(visitor, recent);
    dayCount++;
    // Keep memory bounded: forget visitors with no recent hits.
    if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
    return { ok: true };
  };
}

/** The visitor's IP as Cloudflare (or a proxy) reports it; "local" in dev. */
export function visitorKey(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"
  );
}
