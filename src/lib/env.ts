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
    return (process.env.ADMIN_PIN || '160523').trim();
  },

  get ADMIN_AUTH_SECRET(): string {
    const secret = process.env.ADMIN_AUTH_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
      console.warn('[SECURITY WARNING] ADMIN_AUTH_SECRET is not set in production. Set ADMIN_AUTH_SECRET in your Vercel project settings.');
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
};
