import { NextResponse } from 'next/server';
import { 
  getAdminSessionToken, 
  isValidAdminSessionToken, 
  getAdminSessionRemainingSeconds 
} from '@/lib/admin-auth';

export async function GET(request: Request) {
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
}
