/**
 * Centralized, type-safe environment configuration.
 * Validates and exposes sanitized environment variables across server and client runtimes.
 */

export const env = {
  get DATABASE_URL(): string {
    return (
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      ''
    ).trim();
  },

  get isDatabaseConfigured(): boolean {
    const url = this.DATABASE_URL;
    return Boolean(
      url.length > 0 &&
      !url.includes('placeholder') &&
      (url.startsWith('postgres://') || url.startsWith('postgresql://'))
    );
  },

  get ADMIN_PIN(): string {
    const pin = (process.env.ADMIN_PIN || '').trim();
    if (process.env.NODE_ENV === 'production') {
      if (!pin) {
        throw new Error('[FATAL SECURITY ERROR] ADMIN_PIN environment variable must be configured in production.');
      }
      if (pin === '160523') {
        console.warn('[SECURITY WARNING] Default development ADMIN_PIN is being used in production. Please set a custom ADMIN_PIN in deployment settings.');
      }
      return pin;
    }
    return pin || '160523';
  },

  get ADMIN_AUTH_SECRET(): string {
    const secret = (process.env.ADMIN_AUTH_SECRET || '').trim();
    if (process.env.NODE_ENV === 'production') {
      if (!secret) {
        throw new Error('[FATAL SECURITY ERROR] ADMIN_AUTH_SECRET environment variable must be configured in production.');
      }
      if (secret.length < 32) {
        throw new Error('[FATAL SECURITY ERROR] ADMIN_AUTH_SECRET must be at least 32 characters long in production.');
      }
      return secret;
    }
    return secret || 'amel-admin-counseling-secret-key-2026';
  },

  get SITE_URL(): string {
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
    }
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
      return `https://${process.env.NEXT_PUBLIC_VERCEL_URL.replace(/\/+$/, '')}`;
    }
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL.replace(/\/+$/, '')}`;
    }
    return 'https://mlyfeblia.vercel.app';
  },

  get GOOGLE_SITE_VERIFICATION(): string {
    return process.env.GOOGLE_SITE_VERIFICATION || '';
  },

  get IS_PRODUCTION(): boolean {
    return process.env.NODE_ENV === 'production';
  },

  get UPSTASH_REDIS_REST_URL(): string | undefined {
    return process.env.UPSTASH_REDIS_REST_URL;
  },

  get UPSTASH_REDIS_REST_TOKEN(): string | undefined {
    return process.env.UPSTASH_REDIS_REST_TOKEN;
  },

  get SENTRY_DSN(): string | undefined {
    return process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  },

  get AXIOM_TOKEN(): string | undefined {
    return process.env.AXIOM_TOKEN;
  },

  get VAPID_PUBLIC_KEY(): string {
    return (
      process.env.VAPID_PUBLIC_KEY ||
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
      ''
    ).trim();
  },

  get VAPID_PRIVATE_KEY(): string {
    return (process.env.VAPID_PRIVATE_KEY || '').trim();
  },

  get VAPID_SUBJECT(): string {
    return (
      process.env.VAPID_SUBJECT ||
      'mailto:counselor@amelia.portofolio.id'
    ).trim();
  },

  get isWebPushConfigured(): boolean {
    return Boolean(this.VAPID_PUBLIC_KEY && this.VAPID_PRIVATE_KEY);
  },
};
