import { NextResponse } from 'next/server';
import { 
  getAdminSessionToken, 
  isValidAdminSessionToken, 
  getAdminSessionRemainingSeconds 
} from '@/lib/admin-auth';

export async function GET(request: Request) {
  try {
    const token = await getAdminSessionToken(request);
    const isValid = isValidAdminSessionToken(token);
    const remainingSeconds = isValid ? getAdminSessionRemainingSeconds(token) : 0;

    return NextResponse.json(
      {
        success: isValid,
        authenticated: isValid,
        remainingSeconds,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err) {
    console.error('[API /api/admin/verify] Verification error:', err);
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        remainingSeconds: 0,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }
}
