import { NextResponse } from 'next/server';
import { 
  verifyPin, 
  generateAdminSessionToken, 
  COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS 
} from '@/lib/admin-auth';
import { checkDistributedRateLimit, getClientIp } from '@/lib/rate-limiter';
import { telemetry } from '@/lib/telemetry';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  try {
    // Limit to 5 attempts per 15 minutes (900 seconds) per IP
    const rateCheck = await checkDistributedRateLimit(`login:${ip}`, 5, 900);

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak percobaan login. Silakan coba kembali dalam ${rateCheck.retryAfterSeconds} detik.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateCheck.retryAfterSeconds.toString(),
          },
        }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Format JSON payload tidak valid.' },
        { status: 400 }
      );
    }
    const pin = body?.pin;

    if (!pin || typeof pin !== 'string' || pin.trim().length === 0 || pin.length > 30) {
      return NextResponse.json(
        { success: false, message: 'PIN pengelola wajib dimasukkan.' },
        { status: 400 }
      );
    }

    const isValid = verifyPin(pin);
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: `PIN yang dimasukkan belum tepat. Sisa percobaan: ${rateCheck.remaining}`,
        },
        { status: 401 }
      );
    }

    const token = generateAdminSessionToken();
    const response = NextResponse.json({
      success: true,
      message: 'Autentikasi admin berhasil.',
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS, // 30 minutes
    });

    return response;
  } catch (error) {
    telemetry.error('Error during admin login', error, { route: '/api/admin/login', method: 'POST', ip });
    return NextResponse.json(
      { success: false, message: 'Terjadi kendala sistem pada proses autentikasi.' },
      { status: 500 }
    );
  }
}
