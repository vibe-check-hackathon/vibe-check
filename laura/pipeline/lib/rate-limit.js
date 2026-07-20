// Fixed-window rate limiting, in-memory — matches the existing session-store
// pattern (AGENTS.md: demo-stage, single process; a real deploy needs a
// shared store across processes, same caveat as sessions in accounts.js).
//
// Zero-dependency by policy (AGENTS.md §29): no external limiter package.

const windows = new Map(); // key -> { count, resetAt }

/**
 * @param {string} key - identifies who's being limited (e.g. "login:1.2.3.4")
 * @param {{max: number, windowMs: number}} opts
 * @returns {{allowed: boolean, retryAfterSeconds: number}}
 */
export function checkRateLimit(key, { max, windowMs }) {
  const now = Date.now();
  const entry = windows.get(key);
  if (!entry || entry.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  entry.count += 1;
  if (entry.count > max) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Best-effort client identifier: X-Forwarded-For (Render sits behind a
 * proxy) first, falling back to the raw socket address. Not spoof-proof —
 * good enough to slow casual abuse, not a substitute for a real WAF. */
export function clientIp(req) {
  const forwarded = req.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress ?? "unknown";
}
