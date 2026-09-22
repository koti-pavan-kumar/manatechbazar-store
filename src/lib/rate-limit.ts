/**
 * In-memory sliding window rate limiter.
 * For production with multiple Vercel instances, swap to Upstash Redis.
 * This works for single-instance deployments (Vercel Hobby = 1 instance).
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < 600_000); // 10 min window
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, 300_000);
}

export interface RateLimitConfig {
  /** Unique key prefix (e.g., "login", "checkout") */
  key: string;
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds (default: 15 minutes) */
  windowMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number; // ms until the oldest request in the window expires
}

/**
 * Check rate limit for a given identifier.
 *
 * @param identifier - Unique identifier (e.g., IP address, email)
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and metadata
 *
 * @example
 * const result = rateLimit("192.168.1.1", {
 *   key: "login",
 *   maxRequests: 5,
 *   windowMs: 15 * 60 * 1000, // 15 minutes
 * });
 * if (!result.allowed) {
 *   return NextResponse.json(
 *     { error: "Too many attempts. Try again later." },
 *     { status: 429, headers: { "Retry-After": String(Math.ceil(result.resetMs / 1000)) } }
 *   );
 * }
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const { key, maxRequests, windowMs = 15 * 60 * 1000 } = config;
  const fullKey = `${key}:${identifier}`;
  const now = Date.now();

  let entry = store.get(fullKey);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(fullKey, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldestTimestamp = entry.timestamps[0];
    const resetMs = windowMs - (now - oldestTimestamp);
    return {
      allowed: false,
      remaining: 0,
      resetMs,
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    resetMs: windowMs,
  };
}

/**
 * Extract client IP from request headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

/**
 * Helper to create a 429 response.
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.ceil(result.resetMs / 1000);
  const waitText =
    retryAfter >= 60
      ? `${Math.ceil(retryAfter / 60)} minute${Math.ceil(retryAfter / 60) > 1 ? "s" : ""}`
      : `${retryAfter} seconds`;
  return Response.json(
    {
      error: `Too many requests. Please try again in ${waitText}.`,
      retryAfter,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil((Date.now() + result.resetMs) / 1000)),
      },
    }
  );
}
