import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkDistributedRateLimit, getClientIp } from '@/lib/rate-limiter';
import { isValidAdminSessionTokenEdge, COOKIE_NAME } from '@/lib/edge-admin-auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = crypto.randomUUID();

  // Extract admin session token from cookie or Authorization header
  const token =
    request.cookies.get(COOKIE_NAME)?.value ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();

  // 1. Admin API route protection: /api/admin/*
  if (pathname.startsWith('/api/admin')) {
    // Exempt login and verify endpoints
    if (pathname !== '/api/admin/login' && pathname !== '/api/admin/verify') {
      const isValid = await isValidAdminSessionTokenEdge(token);
      if (!isValid) {
        return NextResponse.json(
          { success: false, message: 'Sesi pengelola tidak valid atau telah berakhir.' },
          { status: 401 }
        );
      }
    }
  }

  // 2. Admin UI route protection: /admin/*
  if (pathname.startsWith('/admin')) {
    // Exempt /admin root so login screen / dialog can be displayed
    if (pathname !== '/admin' && pathname !== '/admin/') {
      const isValid = await isValidAdminSessionTokenEdge(token);
      if (!isValid) {
        const loginUrl = new URL('/admin', request.url);
        loginUrl.searchParams.set('unauthenticated', 'true');
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // Create response with tracing requestId
  const response = NextResponse.next();
  response.headers.set('X-Request-Id', requestId);

  // Apply Edge Rate Limiting to sensitive POST endpoints
  if (request.method === 'POST') {
    const ip = getClientIp(request);

    // 1. Admin login: 5 attempts / 15 minutes
    if (pathname === '/api/admin/login') {
      const rateCheck = await checkDistributedRateLimit(`login:${ip}`, 5, 900);
      if (!rateCheck.success) {
        return NextResponse.json(
          {
            success: false,
            message: `Terlalu banyak percobaan masuk portal. Coba kembali dalam ${rateCheck.retryAfterSeconds} detik.`,
          },
          {
            status: 429,
            headers: {
              'Retry-After': rateCheck.retryAfterSeconds.toString(),
              'X-Request-Id': requestId,
            },
          }
        );
      }
    }

    // 2. Bookings submission: 10 requests / 10 minutes
    if (pathname === '/api/bookings') {
      const rateCheck = await checkDistributedRateLimit(`booking:${ip}`, 10, 600);
      if (!rateCheck.success) {
        return NextResponse.json(
          {
            success: false,
            message: `Terlalu banyak pengajuan jadwal. Coba kembali dalam ${rateCheck.retryAfterSeconds} detik.`,
          },
          {
            status: 429,
            headers: {
              'Retry-After': rateCheck.retryAfterSeconds.toString(),
              'X-Request-Id': requestId,
            },
          }
        );
      }
    }

    // 3. Curhat submission: 10 requests / 10 minutes
    if (pathname === '/api/curhat') {
      const rateCheck = await checkDistributedRateLimit(`curhat:${ip}`, 10, 600);
      if (!rateCheck.success) {
        return NextResponse.json(
          {
            success: false,
            message: `Terlalu banyak pengiriman pesan. Coba kembali dalam ${rateCheck.retryAfterSeconds} detik.`,
          },
          {
            status: 429,
            headers: {
              'Retry-After': rateCheck.retryAfterSeconds.toString(),
              'X-Request-Id': requestId,
            },
          }
        );
      }
    }

    // 4. Translate slug requests: 20 requests / 1 minute
    if (pathname === '/api/translate') {
      const rateCheck = await checkDistributedRateLimit(`translate:${ip}`, 20, 60);
      if (!rateCheck.success) {
        return NextResponse.json(
          {
            success: false,
            message: `Terlalu banyak permintaan translasi otomatis. Coba kembali dalam ${rateCheck.retryAfterSeconds} detik.`,
          },
          {
            status: 429,
            headers: {
              'Retry-After': rateCheck.retryAfterSeconds.toString(),
              'X-Request-Id': requestId,
            },
          }
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
};
