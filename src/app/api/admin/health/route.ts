import { NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/admin-auth';
import { pingDatabase } from '@/db';
import { setLastKnownDatabaseStatus } from '@/lib/data-store';

export async function GET(request: Request) {
  try {
    const isAuth = await isAuthenticatedAdmin(request);
    if (!isAuth) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Silakan masuk terlebih dahulu.' },
        { status: 401 }
      );
    }

    const ping = await pingDatabase(2500);

    if (ping.ok) {
      setLastKnownDatabaseStatus('online');
      return NextResponse.json(
        {
          success: true,
          database: 'online',
          latencyMs: ping.latencyMs,
          timestamp: Date.now(),
        },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    } else {
      setLastKnownDatabaseStatus('paused');
      return NextResponse.json(
        {
          success: false,
          database: 'paused',
          latencyMs: ping.latencyMs,
          error: ping.error || 'Database InsForge tidak merespons atau ter-pause.',
          timestamp: Date.now(),
        },
        {
          status: 200, // Return 200 so client JSON parser receives the structured status cleanly
          headers: { 'Cache-Control': 'no-store, max-age=0' },
        }
      );
    }
  } catch (error) {
    setLastKnownDatabaseStatus('paused');
    return NextResponse.json(
      {
        success: false,
        database: 'paused',
        error: error instanceof Error ? error.message : 'Terjadi kendala saat memeriksa database.',
        timestamp: Date.now(),
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  }
}
