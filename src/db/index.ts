import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '@/lib/env';

export const isDatabaseConfigured = env.isDatabaseConfigured;

if (!isDatabaseConfigured) {
  console.info('ℹ️ Database is not configured or in fallback mode. Using resilient in-memory storage.');
}

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

// In Vercel Serverless, instances scale horizontally. Limiting each lambda to 1 connection
// prevents exhausting pool limits on Supabase / Neon / PgBouncer.
const isServerless = !!process.env.VERCEL;
const maxConnections = process.env.DB_MAX_CONNECTIONS
  ? parseInt(process.env.DB_MAX_CONNECTIONS, 10)
  : (isServerless ? 1 : 10);

const connectionString = env.DATABASE_URL;

const isLocalhost = Boolean(
  connectionString &&
  (connectionString.includes('localhost') || connectionString.includes('127.0.0.1'))
);

export const conn = isDatabaseConfigured
  ? (globalForDb.conn ??
     postgres(connectionString, {
       prepare: false, // Required for transaction connection poolers (PgBouncer, Supabase port 6543)
       max: maxConnections,
       idle_timeout: 15,
       connect_timeout: 6,
       max_lifetime: 60 * 30, // 30 minutes
       ssl: isLocalhost ? false : { rejectUnauthorized: false },
     }))
  : undefined;

if (process.env.NODE_ENV !== 'production' && conn) {
  globalForDb.conn = conn;
}

export const db = (conn ? drizzle(conn, { schema }) : null) as ReturnType<typeof drizzle<typeof schema>> | null;
export * from './schema';

