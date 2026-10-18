import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getSmtpUser,
  getSmtpPass,
  isSmtpConfigured,
  getSmtpTransporter,
  sendEmailViaSmtp,
} from '@/lib/smtp';

describe('Gmail SMTP Module Unit & Integration Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('SMTP Configuration & Credential Parsing', () => {
    it('defaults to amelia email when SMTP_USER is not explicitly provided', () => {
      delete process.env.SMTP_USER;
      delete process.env.ADMIN_NOTIFICATION_EMAIL;
      expect(getSmtpUser()).toBe('mlyfeblia150207@gmail.com');
    });

    it('uses SMTP_USER when set in environment', () => {
      process.env.SMTP_USER = 'counselor@custom.com';
      expect(getSmtpUser()).toBe('counselor@custom.com');
    });

    it('strips spaces from Google App Password (4x4 chunks)', () => {
      process.env.SMTP_APP_PASSWORD = 'abcd efgh ijkl mnop';
      expect(getSmtpPass()).toBe('abcdefghijklmnop');
    });

    it('falls back to GMAIL_APP_PASSWORD if SMTP_APP_PASSWORD is not provided', () => {
      delete process.env.SMTP_APP_PASSWORD;
      process.env.GMAIL_APP_PASSWORD = 'wxyz 1234 5678 90ab';
      expect(getSmtpPass()).toBe('wxyz1234567890ab');
    });

    it('returns false for isSmtpConfigured when password is missing or shorter than 8 chars', () => {
      process.env.SMTP_USER = 'test@gmail.com';
      process.env.SMTP_APP_PASSWORD = 'short';
      expect(isSmtpConfigured()).toBe(false);

      delete process.env.SMTP_APP_PASSWORD;
      delete process.env.GMAIL_APP_PASSWORD;
      expect(isSmtpConfigured()).toBe(false);
    });

    it('returns true for isSmtpConfigured when valid email and app password are provided', () => {
      process.env.SMTP_USER = 'mlyfeblia150207@gmail.com';
      process.env.SMTP_APP_PASSWORD = 'abcd efgh ijkl mnop';
      expect(isSmtpConfigured()).toBe(true);
    });
  });

  describe('Transporter Creation & Graceful Handling', () => {
    it('returns null when password is missing', () => {
      delete process.env.SMTP_APP_PASSWORD;
      delete process.env.GMAIL_APP_PASSWORD;
      expect(getSmtpTransporter()).toBeNull();
    });

    it('returns transporter object when credentials are fully set', () => {
      process.env.SMTP_USER = 'mlyfeblia150207@gmail.com';
      process.env.SMTP_APP_PASSWORD = 'abcdefghijklmnop';
      const transporter = getSmtpTransporter();
      expect(transporter).not.toBeNull();
      expect(typeof transporter?.sendMail).toBe('function');
    });

    it('sendEmailViaSmtp returns error when not configured', async () => {
      delete process.env.SMTP_APP_PASSWORD;
      delete process.env.GMAIL_APP_PASSWORD;

      const result = await sendEmailViaSmtp({
        to: 'konseli@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('SMTP transporter is not configured');
    });
  });
});
