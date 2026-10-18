import { describe, it, expect } from 'vitest';
import {
  verifyPin,
  generateAdminSessionToken,
  isValidAdminSessionToken,
  getAdminSessionRemainingSeconds,
  ADMIN_SESSION_MAX_AGE_SECONDS,
} from '../admin-auth';
import { isValidAdminSessionTokenEdge } from '../edge-admin-auth';

describe('Admin Auth Unit Test Suite', () => {
  describe('verifyPin', () => {
    it('verifies correct PIN safely', () => {
      // In development / test environment, default PIN is '160523' or process.env.ADMIN_PIN
      const currentPin = process.env.ADMIN_PIN || '160523';
      expect(verifyPin(currentPin)).toBe(true);
    });

    it('rejects incorrect PINs of various lengths', () => {
      expect(verifyPin('000000')).toBe(false);
      expect(verifyPin('123')).toBe(false);
      expect(verifyPin('')).toBe(false);
      expect(verifyPin('160524')).toBe(false);
    });
  });

  describe('Session Token Lifecycle & Tamper Resistance (Node.js crypto)', () => {
    it('generates a valid session token that passes verification', () => {
      const token = generateAdminSessionToken();
      expect(typeof token).toBe('string');
      expect(token.startsWith('admin:')).toBe(true);
      expect(isValidAdminSessionToken(token)).toBe(true);
    });

    it('calculates remaining seconds accurately for a newly generated token', () => {
      const token = generateAdminSessionToken();
      const remaining = getAdminSessionRemainingSeconds(token);
      expect(remaining).toBeGreaterThan(ADMIN_SESSION_MAX_AGE_SECONDS - 5);
      expect(remaining).toBeLessThanOrEqual(ADMIN_SESSION_MAX_AGE_SECONDS);
    });

    it('rejects tampered tokens with invalid signature', () => {
      const validToken = generateAdminSessionToken();
      const parts = validToken.split(':');
      // Tamper with the timestamp or nonce
      const tampered = `admin:${parts[1]}:tamperedNonce:${parts[3]}`;
      expect(isValidAdminSessionToken(tampered)).toBe(false);
    });

    it('rejects expired tokens', () => {
      // Create a token from 31 minutes ago
      const pastTime = Date.now() - 31 * 60 * 1000;
      const fakeToken = `admin:${pastTime}:fakeNonce:fakeSignature`;
      expect(isValidAdminSessionToken(fakeToken)).toBe(false);
      expect(getAdminSessionRemainingSeconds(fakeToken)).toBe(0);
    });

    it('rejects malformed token strings', () => {
      expect(isValidAdminSessionToken('')).toBe(false);
      expect(isValidAdminSessionToken(null)).toBe(false);
      expect(isValidAdminSessionToken('admin:onlytwoparts')).toBe(false);
      expect(isValidAdminSessionToken('user:12345:nonce:hmac')).toBe(false);
    });
  });

  describe('Session Token Edge Verification (Web Crypto API)', () => {
    it('verifies node-generated token correctly using edge Web Crypto API', async () => {
      const token = generateAdminSessionToken();
      const isValid = await isValidAdminSessionTokenEdge(token);
      expect(isValid).toBe(true);
    });

    it('rejects tampered token using edge Web Crypto API', async () => {
      const validToken = generateAdminSessionToken();
      const parts = validToken.split(':');
      const tampered = `admin:${parts[1]}:tamperedNonce:${parts[3]}`;
      const isValid = await isValidAdminSessionTokenEdge(tampered);
      expect(isValid).toBe(false);
    });

    it('rejects expired token using edge Web Crypto API', async () => {
      const pastTime = Date.now() - 31 * 60 * 1000;
      const fakeToken = `admin:${pastTime}:fakeNonce:fakeSignature`;
      const isValid = await isValidAdminSessionTokenEdge(fakeToken);
      expect(isValid).toBe(false);
    });

    it('rejects malformed or empty token in edge Web Crypto API', async () => {
      expect(await isValidAdminSessionTokenEdge('')).toBe(false);
      expect(await isValidAdminSessionTokenEdge(null)).toBe(false);
      expect(await isValidAdminSessionTokenEdge('admin:invalid')).toBe(false);
    });
  });
});
