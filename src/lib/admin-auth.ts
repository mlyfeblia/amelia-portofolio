import crypto from 'crypto';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

export const COOKIE_NAME = 'amel_admin_session';

function getAdminPin(): string {
  return env.ADMIN_PIN;
}

function getSecretKey(): string {
  return env.ADMIN_AUTH_SECRET;
}

/**
 * Timing-safe PIN verification
 */
export function verifyPin(inputPin: string): boolean {
  if (!inputPin) return false;
  const cleanInput = inputPin.trim();
  const cleanTarget = getAdminPin();

  if (cleanInput.length !== cleanTarget.length) {
    return false;
  }

  const inputBuffer = Buffer.from(cleanInput);
  const targetBuffer = Buffer.from(cleanTarget);

  return crypto.timingSafeEqual(inputBuffer, targetBuffer);
}

/**
 * Generate HMAC-signed admin session token
 * Payload format: `admin:${timestamp}:${nonce}:${signature}`
 */
export function generateAdminSessionToken(): string {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `admin:${timestamp}:${nonce}`;
  const hmac = crypto.createHmac('sha256', getSecretKey()).update(payload).digest('hex');
  return `${payload}:${hmac}`;
}

/**
 * Verify HMAC-signed admin session token
 */
export function isValidAdminSessionToken(token?: string | null): boolean {
  if (!token) return false;
  const parts = token.split(':');
  if (parts.length !== 4) return false;

  const [role, timestampStr, nonce, receivedHmac] = parts;
  if (role !== 'admin') return false;

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Max session age: 24 hours (hardened security)
  const MAX_AGE_MS = 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > MAX_AGE_MS) {
    return false;
  }

  const payload = `admin:${timestampStr}:${nonce}`;
  const expectedHmac = crypto.createHmac('sha256', getSecretKey()).update(payload).digest('hex');

  const receivedBuffer = Buffer.from(receivedHmac);
  const expectedBuffer = Buffer.from(expectedHmac);

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

/**
 * Check if the current request is from an authenticated admin
 */
export async function isAuthenticatedAdmin(request?: Request): Promise<boolean> {
  // 1. Check Cookie store via Next.js headers
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (isValidAdminSessionToken(token)) {
      return true;
    }
  } catch {
    // If cookies() is unavailable, fallback to request header inspection
  }

  // 2. Check Cookie header if request object is provided
  if (request) {
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
      if (match && isValidAdminSessionToken(decodeURIComponent(match[1]))) {
        return true;
      }
    }

    // 3. Check Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const bearerToken = authHeader.substring(7).trim();
      if (isValidAdminSessionToken(bearerToken)) {
        return true;
      }
    }
  }

  return false;
}
