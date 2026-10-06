import crypto from 'crypto';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

export const COOKIE_NAME = 'amel_admin_session';

// Admin session duration: strictly 30 minutes as required
export const ADMIN_SESSION_MAX_AGE_SECONDS = 30 * 60; // 1800 seconds
export const ADMIN_SESSION_MAX_AGE_MS = ADMIN_SESSION_MAX_AGE_SECONDS * 1000;

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
 * Get remaining seconds for an admin session token
 */
export function getAdminSessionRemainingSeconds(token?: string | null): number {
  if (!token) return 0;
  const parts = token.split(':');
  if (parts.length !== 4) return 0;

  const [role, timestampStr] = parts;
  if (role !== 'admin') return 0;

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return 0;

  const elapsed = Date.now() - timestamp;
  if (elapsed >= ADMIN_SESSION_MAX_AGE_MS || elapsed < 0) {
    return 0;
  }

  return Math.max(0, Math.floor((ADMIN_SESSION_MAX_AGE_MS - elapsed) / 1000));
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

  // Max session age: 30 minutes
  if (Date.now() - timestamp > ADMIN_SESSION_MAX_AGE_MS || Date.now() - timestamp < 0) {
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
 * Retrieve raw admin session token from cookie store or request
 */
export async function getAdminSessionToken(request?: Request): Promise<string | null> {
  // 1. Next.js cookies store
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (token) return token;
  } catch {
    // cookies() unavailable in non-request contexts
  }

  // 2. Request Cookie header
  if (request) {
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
      if (match) return decodeURIComponent(match[1]);
    }

    // 3. Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }
  }

  return null;
}

/**
 * Check if the current request is from an authenticated admin
 */
export async function isAuthenticatedAdmin(request?: Request): Promise<boolean> {
  const token = await getAdminSessionToken(request);
  return isValidAdminSessionToken(token);
}
