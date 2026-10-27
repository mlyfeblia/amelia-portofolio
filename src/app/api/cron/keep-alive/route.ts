import { NextResponse } from 'next/server';
import { pingDatabase } from '@/db';
import { setLastKnownDatabaseStatus } from '@/lib/data-store';

export async function GET(request: Request) {
  // Optional security check for Vercel Cron Secret if configured
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, message: 'Unauthorized cron request.' }, { status: 401 });
  }

  try {
    const ping = await pingDatabase(4000);

    if (ping.ok) {
      setLastKnownDatabaseStatus('online');
      return NextResponse.json(
        {
          success: true,
          message: 'InsForge keep-alive ping successful. Database instance is awake and active.',
          latencyMs: ping.latencyMs,
          timestamp: new Date().toISOString(),
        },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    } else {
      setLastKnownDatabaseStatus('paused');
      console.warn('[Keep-Alive Cron] InsForge ping failed:', ping.error);
      return NextResponse.json(
        {
          success: false,
          message: 'InsForge instance failed ping. Project may be paused or unreachable.',
          error: ping.error,
          latencyMs: ping.latencyMs,
          timestamp: new Date().toISOString(),
        },
        { status: 503, headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }
  } catch (error) {
    setLastKnownDatabaseStatus('paused');
    console.error('[Keep-Alive Cron] Unexpected error during ping:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Unexpected error executing keep-alive ping.',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
}
