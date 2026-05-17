import rateLimit from "express-rate-limit";

/**
 * Rate limiters for the routes that get abused. Each limiter is
 * applied as middleware on the specific route mount (see index.js).
 * We don't apply a global limiter because the chat polling fallback
 * and frequent in-app fetches would flag legitimate users.
 *
 * Key choices:
 *   - keyGenerator falls back to req.ip — express's default behavior
 *     works fine behind a properly-trusted proxy. If we deploy behind
 *     Cloudflare or a load balancer, set `app.set('trust proxy', 1)`
 *     in index.js so req.ip resolves to the real client IP.
 *   - `standardHeaders: 'draft-7'` writes the RFC 6585 RateLimit-*
 *     headers so clients can introspect remaining quota.
 *   - `legacyHeaders: false` skips the older X-RateLimit-* headers
 *     to avoid duplicating data.
 */

const isDev = process.env.NODE_ENV !== "production";

/**
 * Auth bucket: stop brute-force on /signup, /login, /forgot. 10
 * attempts per IP per 15 minutes is generous enough that a real user
 * recovering from a typo isn't locked out, tight enough that an
 * attacker can't iterate a wordlist.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: isDev ? 100 : 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many auth attempts. Try again in a few minutes." },
});

/**
 * Write bucket for resource-creating endpoints (post a job, send a
 * connection-saving toggle, leave a review, etc.). Allows
 * meaningful use without enabling spam.
 */
export const writeLimiter = rateLimit({
  windowMs: 60_000,
  limit: isDev ? 1000 : 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Slow down — you're sending too many requests." },
});

/**
 * Search bucket: search is a perf-sensitive endpoint. Cap it
 * tighter than the write bucket since each call hits regex queries
 * across multiple collections.
 */
export const searchLimiter = rateLimit({
  windowMs: 60_000,
  limit: isDev ? 500 : 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many searches in a short window." },
});
