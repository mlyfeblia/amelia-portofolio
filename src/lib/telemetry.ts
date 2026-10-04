/**
 * Unified Observability & Telemetry Module.
 * Integrates error tracking and performance monitoring with Sentry & Axiom.
 * Gracefully operates in development and falls back to structured console logging when external services are not configured.
 */

export interface TelemetryContext {
  route?: string;
  method?: string;
  ip?: string;
  userId?: string;
  requestId?: string;
  [key: string]: unknown;
}

class Telemetry {
  private hasAxiom: boolean;
  private hasSentry: boolean;
  private axiomToken: string | undefined;
  private axiomDataset: string | undefined;

  constructor() {
    this.axiomToken = process.env.AXIOM_TOKEN;
    this.axiomDataset = process.env.AXIOM_DATASET || 'amelia-portfolio';
    this.hasAxiom = Boolean(this.axiomToken);
    this.hasSentry = Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN);
  }

  /**
   * Log informational event with structured metadata.
   */
  info(message: string, context?: TelemetryContext): void {
    const timestamp = new Date().toISOString();
    const payload = {
      level: 'info',
      message,
      timestamp,
      ...context,
    };

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[INFO] ${timestamp} - ${message}`, context ? JSON.stringify(context) : '');
    }

    this.sendToAxiom(payload);
  }

  /**
   * Capture error with stack trace and context.
   */
  error(message: string, err?: unknown, context?: TelemetryContext): void {
    const timestamp = new Date().toISOString();
    const errorMessage = err instanceof Error ? err.message : String(err || 'Unknown error');
    const stack = err instanceof Error ? err.stack : undefined;

    const payload = {
      level: 'error',
      message,
      error: errorMessage,
      stack,
      timestamp,
      ...context,
    };

    console.error(`[ERROR] ${timestamp} - ${message}:`, errorMessage, context ? JSON.stringify(context) : '');

    this.sendToAxiom(payload);
    this.sendToSentry(err, message, context);
  }

  /**
   * Measure execution time of an async operation.
   */
  async measure<T>(name: string, fn: () => Promise<T>, context?: TelemetryContext): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const durationMs = Math.round(performance.now() - start);
      this.info(`[PERF] ${name} completed in ${durationMs}ms`, { ...context, durationMs, metric: name });
      return result;
    } catch (error) {
      const durationMs = Math.round(performance.now() - start);
      this.error(`[PERF] ${name} failed after ${durationMs}ms`, error, { ...context, durationMs, metric: name });
      throw error;
    }
  }

  private sendToAxiom(data: Record<string, unknown>): void {
    if (!this.hasAxiom || !this.axiomToken) return;

    // Asynchronous fire-and-forget ingestion to Axiom HTTP API
    try {
      fetch(`https://api.axiom.co/v1/datasets/${this.axiomDataset}/ingest`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.axiomToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([data]),
      }).catch(() => {
        // Suppress telemetry transmission failures
      });
    } catch {
      // Ignored
    }
  }

  private sendToSentry(err: unknown, message: string, context?: TelemetryContext): void {
    if (!this.hasSentry) return;

    // Native Sentry HTTP capture when @sentry/nextjs is not configured
    const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn) return;

    try {
      // Basic Sentry capture format
      const sentryUrl = this.getSentryStoreEndpoint(dsn);
      if (!sentryUrl) return;

      fetch(sentryUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `${message}: ${err instanceof Error ? err.message : String(err)}`,
          level: 'error',
          platform: 'node',
          extra: context,
        }),
      }).catch(() => {
        // Suppress telemetry transmission failures
      });
    } catch {
      // Ignored
    }
  }

  private getSentryStoreEndpoint(dsn: string): string | null {
    try {
      const parsed = new URL(dsn);
      const projectId = parsed.pathname.replace('/', '');
      const publicKey = parsed.username;
      return `${parsed.protocol}//${parsed.host}/api/${projectId}/store/?sentry_version=7&sentry_key=${publicKey}`;
    } catch {
      return null;
    }
  }
}

export const telemetry = new Telemetry();
