import { NextResponse } from 'next/server';
import { 
  isAuthenticatedAdmin, 
  generateAdminSessionToken, 
  COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS 
} from '@/lib/admin-auth';

export async function POST(request: Request) {
  const isAuth = await isAuthenticatedAdmin(request);
  if (!isAuth) {
    return NextResponse.json(
      { success: false, message: 'Sesi tidak valid atau telah berakhir.' },
      { status: 401 }
    );
  }

  const newToken = generateAdminSessionToken();
  const response = NextResponse.json({
    success: true,
    message: 'Sesi admin berhasil diperpanjang 30 menit.',
    remainingSeconds: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  response.cookies.set(COOKIE_NAME, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
