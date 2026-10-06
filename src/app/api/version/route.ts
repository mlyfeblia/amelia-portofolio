import { NextResponse } from 'next/server';
import { CURRENT_APP_VERSION, getLatestRelease } from '@/data/app-version';

export async function GET() {
  const latest = getLatestRelease();
  return NextResponse.json(
    {
      success: true,
      version: CURRENT_APP_VERSION,
      release: latest,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
