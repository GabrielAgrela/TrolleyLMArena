import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the rateLimit module
vi.mock('../rateLimit', () => ({
    checkRateLimit: vi.fn(),
    getClientIP: vi.fn(() => '127.0.0.1'),
    RATE_LIMITS: {
        standard: { windowMs: 60000, maxRequests: 60 },
        adminMutation: { windowMs: 60000, maxRequests: 10 },
        heavy: { windowMs: 300000, maxRequests: 5 }
    }
}));

import { withRateLimit, RATE_LIMITS } from '../withRateLimit';
import { checkRateLimit } from '../rateLimit';

const mockedCheckRateLimit = vi.mocked(checkRateLimit);

describe('withRateLimit middleware', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should pass through to handler when not rate limited', async () => {
        mockedCheckRateLimit.mockReturnValue({
            isLimited: false,
            remaining: 59,
            resetAt: Date.now() + 60000
        });

        const mockHandler = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ data: 'success' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            })
        );

        const wrappedHandler = withRateLimit(mockHandler, RATE_LIMITS.standard);
        const mockRequest = new Request('http://localhost/api/test', { method: 'GET' });

        const response = await wrappedHandler(mockRequest);

        expect(mockHandler).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(200);
        expect(response.headers.get('X-RateLimit-Remaining')).toBe('59');
    });

    it('should return 429 when rate limited', async () => {
        const resetAt = Date.now() + 60000;
        mockedCheckRateLimit.mockReturnValue({
            isLimited: true,
            remaining: 0,
            resetAt
        });

        const mockHandler = vi.fn();
        const wrappedHandler = withRateLimit(mockHandler, RATE_LIMITS.standard);
        const mockRequest = new Request('http://localhost/api/test', { method: 'GET' });

        const response = await wrappedHandler(mockRequest);

        expect(mockHandler).not.toHaveBeenCalled();
        expect(response.status).toBe(429);
        expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
        expect(response.headers.get('Retry-After')).toBeDefined();

        const body = await response.json();
        expect(body.error).toContain('Too many requests');
    });

    it('should use correct rate limit config', async () => {
        mockedCheckRateLimit.mockReturnValue({
            isLimited: false,
            remaining: 9,
            resetAt: Date.now() + 60000
        });

        const mockHandler = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ ok: true }), { status: 200 })
        );

        const wrappedHandler = withRateLimit(mockHandler, RATE_LIMITS.adminMutation);
        const mockRequest = new Request('http://localhost/api/admin/test', { method: 'POST' });

        await wrappedHandler(mockRequest);

        expect(mockedCheckRateLimit).toHaveBeenCalledWith(
            expect.stringContaining('api:'),
            RATE_LIMITS.adminMutation
        );
    });

    it('should include rate limit headers in successful response', async () => {
        const resetAt = Date.now() + 60000;
        mockedCheckRateLimit.mockReturnValue({
            isLimited: false,
            remaining: 42,
            resetAt
        });

        const mockHandler = vi.fn().mockResolvedValue(
            new Response('OK', { status: 200 })
        );

        const wrappedHandler = withRateLimit(mockHandler);
        const mockRequest = new Request('http://localhost/api/test');

        const response = await wrappedHandler(mockRequest);

        expect(response.headers.get('X-RateLimit-Remaining')).toBe('42');
        expect(response.headers.get('X-RateLimit-Reset')).toBe(resetAt.toString());
    });

    it('should preserve original response status and body', async () => {
        mockedCheckRateLimit.mockReturnValue({
            isLimited: false,
            remaining: 10,
            resetAt: Date.now() + 60000
        });

        const mockHandler = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ error: 'Not found' }), {
                status: 404,
                statusText: 'Not Found'
            })
        );

        const wrappedHandler = withRateLimit(mockHandler);
        const mockRequest = new Request('http://localhost/api/test');

        const response = await wrappedHandler(mockRequest);

        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body.error).toBe('Not found');
    });
});
