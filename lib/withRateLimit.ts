/**
 * Higher-order function to wrap API route handlers with rate limiting
 */

import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIP, RATE_LIMITS } from './rateLimit';

type RateLimitConfig = {
    windowMs: number;
    maxRequests: number;
};

type RouteHandler = (req: Request, ctx?: { params: Promise<Record<string, string>> }) => Promise<Response>;

/**
 * Wrap an API route handler with rate limiting
 * 
 * @param handler - The original route handler
 * @param config - Rate limit configuration (defaults to standard)
 * @param keyPrefix - Optional prefix for the rate limit key (defaults to 'api')
 * @returns Wrapped handler that applies rate limiting
 * 
 * @example
 * ```typescript
 * export const GET = withRateLimit(async (req) => {
 *     // Your handler logic
 *     return NextResponse.json({ data: 'hello' });
 * }, RATE_LIMITS.standard);
 * ```
 */
export function withRateLimit(
    handler: RouteHandler,
    config: RateLimitConfig = RATE_LIMITS.standard,
    keyPrefix: string = 'api'
): RouteHandler {
    return async (req: Request, ctx?: { params: Promise<Record<string, string>> }): Promise<Response> => {
        const ip = getClientIP(req);
        const url = new URL(req.url);
        const key = `${keyPrefix}:${url.pathname}:${req.method}:${ip}`;

        const { isLimited, remaining, resetAt } = checkRateLimit(key, config);

        if (isLimited) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': resetAt.toString(),
                        'Retry-After': Math.ceil((resetAt - Date.now()) / 1000).toString()
                    }
                }
            );
        }

        // Call the original handler
        const response = await handler(req, ctx);

        // Clone response to add headers (Response objects are immutable)
        const newHeaders = new Headers(response.headers);
        newHeaders.set('X-RateLimit-Remaining', remaining.toString());
        newHeaders.set('X-RateLimit-Reset', resetAt.toString());

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    };
}

// Re-export rate limit configurations for convenience
export { RATE_LIMITS } from './rateLimit';
