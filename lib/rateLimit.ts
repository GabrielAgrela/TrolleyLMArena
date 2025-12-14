/**
 * In-memory rate limiter for API routes
 * Uses a sliding window approach with IP-based tracking
 */

type RateLimitConfig = {
    windowMs: number;  // Time window in milliseconds
    maxRequests: number;  // Max requests per window
};

type RateLimitEntry = {
    count: number;
    resetAt: number;
};

// In-memory store (use Redis for multi-instance deployments)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 60000; // 1 minute
let lastCleanup = Date.now();

function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;

    lastCleanup = now;
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetAt < now) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (usually IP address)
 * @param config - Rate limit configuration
 * @returns Object with isLimited flag and remaining requests
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig = { windowMs: 60000, maxRequests: 10 }
): { isLimited: boolean; remaining: number; resetAt: number } {
    cleanup();

    const now = Date.now();
    const key = identifier;
    const existing = rateLimitStore.get(key);

    // Initialize or reset if window expired
    if (!existing || existing.resetAt < now) {
        const entry: RateLimitEntry = {
            count: 1,
            resetAt: now + config.windowMs
        };
        rateLimitStore.set(key, entry);
        return {
            isLimited: false,
            remaining: config.maxRequests - 1,
            resetAt: entry.resetAt
        };
    }

    // Increment count
    existing.count++;

    // Check if over limit
    if (existing.count > config.maxRequests) {
        return {
            isLimited: true,
            remaining: 0,
            resetAt: existing.resetAt
        };
    }

    return {
        isLimited: false,
        remaining: config.maxRequests - existing.count,
        resetAt: existing.resetAt
    };
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }

    // Fallback for local development
    return '127.0.0.1';
}

/**
 * Rate limit configuration presets
 */
export const RATE_LIMITS = {
    // Standard API calls
    standard: { windowMs: 60000, maxRequests: 60 },
    // Admin mutation operations (POST, PATCH, DELETE)
    adminMutation: { windowMs: 60000, maxRequests: 10 },
    // Heavy operations (LLM runs)
    heavy: { windowMs: 300000, maxRequests: 5 }
} as const;
