import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, RATE_LIMITS } from '../rateLimit';

describe('Rate Limiting', () => {
    beforeEach(() => {
        // Reset rate limit store between tests by using unique identifiers
    });

    it('should allow requests within limit', () => {
        const id = `test-${Date.now()}-allow`;
        const config = { windowMs: 60000, maxRequests: 5 };

        for (let i = 0; i < 5; i++) {
            const result = checkRateLimit(id, config);
            expect(result.isLimited).toBe(false);
            expect(result.remaining).toBe(4 - i);
        }
    });

    it('should block requests over limit', () => {
        const id = `test-${Date.now()}-block`;
        const config = { windowMs: 60000, maxRequests: 3 };

        // Use up the limit
        for (let i = 0; i < 3; i++) {
            checkRateLimit(id, config);
        }

        // Next request should be limited
        const result = checkRateLimit(id, config);
        expect(result.isLimited).toBe(true);
        expect(result.remaining).toBe(0);
    });

    it('should have correct preset configurations', () => {
        expect(RATE_LIMITS.standard.maxRequests).toBe(60);
        expect(RATE_LIMITS.adminMutation.maxRequests).toBe(10);
        expect(RATE_LIMITS.heavy.maxRequests).toBe(5);
    });

    it('should return reset time', () => {
        const id = `test-${Date.now()}-reset`;
        const config = { windowMs: 60000, maxRequests: 1 };

        const result = checkRateLimit(id, config);
        expect(result.resetAt).toBeGreaterThan(Date.now());
        expect(result.resetAt).toBeLessThanOrEqual(Date.now() + 60000);
    });
});
