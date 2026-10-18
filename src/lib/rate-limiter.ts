/**
 * Dual-Engine Rate Limiter for Next.js Serverless & Edge runtimes.
 * 1. Distributed mode: Uses @upstash/ratelimit + Redis when UPSTASH credentials are provided.
 * 2. In-memory mode: Sliding-window with periodic cleanup as seamless fallback.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();
const MAX_MEMORY_KEYS = 5000;

// Clean up expired keys every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function purgeExpiredRecords(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of memoryStore.entries()) {
    if (record.resetAt <= now) {
      memoryStore.delete(key);
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

/**
 * Synchronous in-memory rate check.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  purgeExpiredRecords(now);

  const windowMs = windowSeconds * 1000;
  const record = memoryStore.get(key);

  if (!record || record.resetAt <= now) {
    if (!record && memoryStore.size >= MAX_MEMORY_KEYS) {
      for (const [k, v] of memoryStore.entries()) {
        if (v.resetAt <= now) memoryStore.delete(k);
      }
      if (memoryStore.size >= MAX_MEMORY_KEYS) {
        const oldestKey = memoryStore.keys().next().value;
        if (oldestKey) memoryStore.delete(oldestKey);
      }
    }
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
    };
    memoryStore.set(key, newRecord);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetAt: newRecord.resetAt,
      retryAfterSeconds: 0,
    };
  }

  if (record.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      success: false,
      limit,
      remaining: 0,
      resetAt: record.resetAt,
      retryAfterSeconds,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    resetAt: record.resetAt,
    retryAfterSeconds: 0,
  };
}

// Cached Upstash rate limiters
const upstashInstances = new Map<string, Ratelimit>();

function getUpstashLimiter(limit: number, windowSeconds: number): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const instanceKey = `${limit}:${windowSeconds}`;
  let instance = upstashInstances.get(instanceKey);

  if (!instance) {
    try {
      const redis = new Redis({ url, token });
      instance = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
        prefix: 'amelia:ratelimit',
      });
      upstashInstances.set(instanceKey, instance);
    } catch {
      return null;
    }
  }

  return instance;
}

/**
 * Asynchronous distributed rate check.
 * Uses Upstash Redis when available, falls back to in-memory sliding-window.
 */
export async function checkDistributedRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const upstash = getUpstashLimiter(limit, windowSeconds);

  if (upstash) {
    try {
      const result = await upstash.limit(key);
      const retryAfterSeconds = result.reset ? Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)) : 0;
      return {
        success: result.success,
        limit,
        remaining: result.remaining,
        resetAt: result.reset,
        retryAfterSeconds: result.success ? 0 : retryAfterSeconds,
      };
    } catch (err) {
      console.warn('Upstash rate limit failed, falling back to in-memory limiter:', err);
    }
  }

  return checkRateLimit(key, limit, windowSeconds);
}

/**
 * Extracts client IP address safely from Request headers.
 */
export function getClientIp(request: Request): string {
  // 0. NextRequest parsed platform IP (Vercel / Next.js Edge)
  if ('ip' in request && typeof (request as { ip?: string }).ip === 'string') {
    const rawIp = (request as { ip: string }).ip.trim();
    if (rawIp) return rawIp;
  }

  // 1. Cloudflare connecting IP (trusted edge)
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp && cfConnectingIp.trim()) {
    return cfConnectingIp.trim();
  }

  // 2. Real IP from reverse proxy (Vercel / Nginx trusted header)
  const realIp = request.headers.get('x-real-ip');
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }

  // 3. Vercel client IP header
  const vercelIp = request.headers.get('x-vercel-ip');
  if (vercelIp && vercelIp.trim()) {
    return vercelIp.trim();
  }

  // 4. Fallback to X-Forwarded-For
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  return '127.0.0.1';
}
