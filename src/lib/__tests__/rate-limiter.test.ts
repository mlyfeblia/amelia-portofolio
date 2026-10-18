import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, checkDistributedRateLimit, getClientIp } from '../rate-limiter';

describe('Rate Limiter Unit Test Suite', () => {
  it('allows requests within limit and decrements remaining counter', () => {
    const key = `test_key_${Date.now()}_1`;
    const res1 = checkRateLimit(key, 3, 60);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);
    expect(res1.limit).toBe(3);

    const res2 = checkRateLimit(key, 3, 60);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = checkRateLimit(key, 3, 60);
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);

    // 4th request exceeds limit
    const res4 = checkRateLimit(key, 3, 60);
    expect(res4.success).toBe(false);
    expect(res4.remaining).toBe(0);
    expect(res4.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('handles distributed fallback seamlessly when Upstash is not configured', async () => {
    const key = `test_fallback_${Date.now()}`;
    const res = await checkDistributedRateLimit(key, 5, 30);
    expect(res.success).toBe(true);
    expect(res.remaining).toBe(4);
    expect(res.limit).toBe(5);
  });

  describe('getClientIp', () => {
    it('prefers request.ip property if present', () => {
      const mockReq = {
        ip: '203.0.113.195',
        headers: new Headers({
          'cf-connecting-ip': '198.51.100.1',
          'x-forwarded-for': '192.0.2.1',
        }),
      } as unknown as Request;

      expect(getClientIp(mockReq)).toBe('203.0.113.195');
    });

    it('extracts Cloudflare connecting IP when request.ip is missing', () => {
      const mockReq = new Request('https://amelia.test/api/test', {
        headers: {
          'cf-connecting-ip': '1.1.1.1',
          'x-forwarded-for': '2.2.2.2',
        },
      });

      expect(getClientIp(mockReq)).toBe('1.1.1.1');
    });

    it('extracts x-real-ip when Cloudflare header is missing', () => {
      const mockReq = new Request('https://amelia.test/api/test', {
        headers: {
          'x-real-ip': '198.51.100.24',
        },
      });

      expect(getClientIp(mockReq)).toBe('198.51.100.24');
    });

    it('parses first IP from x-forwarded-for comma-separated chain', () => {
      const mockReq = new Request('https://amelia.test/api/test', {
        headers: {
          'x-forwarded-for': '203.0.113.50, 10.0.0.1, 192.168.1.1',
        },
      });

      expect(getClientIp(mockReq)).toBe('203.0.113.50');
    });

    it('falls back to 127.0.0.1 if no headers are present', () => {
      const mockReq = new Request('https://amelia.test/api/test');
      expect(getClientIp(mockReq)).toBe('127.0.0.1');
    });
  });
});
