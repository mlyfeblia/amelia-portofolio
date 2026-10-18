import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkDistributedRateLimit, getClientIp } from '@/lib/rate-limiter';
import { isValidAdminSessionTokenEdge, COOKIE_NAME } from '@/lib/edge-admin-auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = crypto.randomUUID();

  // 0. CSRF Origin Verification for State-Mutating API Requests
  if (
    pathname.startsWith('/api/') &&
    ['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method)
  ) {
    const origin = request.headers.get('origin');
    const forwardedHost = request.headers.get('x-forwarded-host');
    const directHost = request.headers.get('host');
    const allowedHosts = new Set(
      [
        ...(forwardedHost ? forwardedHost.split(',') : []),
        directHost,
        request.nextUrl.host,
      ]
        .map((h) => h?.trim().toLowerCase())
        .filter((h): h is string => Boolean(h))
    );

    if (origin && allowedHosts.size > 0) {
      try {
        const originHost = new URL(origin).host.trim().toLowerCase();
        if (!allowedHosts.has(originHost)) {
          return NextResponse.json(
            {
              success: false,
              message: 'Akses ditolak: Permintaan lintas domain (Cross-Origin) tidak diizinkan.',
            },
            { status: 403, headers: { 'X-Request-Id': requestId } }
          );
        }
      } catch {
        return NextResponse.json(
          {
            success: false,
            message: 'Akses ditolak: Header Origin tidak valid.',
          },
          { status: 403, headers: { 'X-Request-Id': requestId } }
        );
      }
    }
  }

  // Extract admin session token from cookie or Authorization header
  const token =
    request.cookies.get(COOKIE_NAME)?.value ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();

  // 1. Admin API route protection
  const isAdminOnlyEndpoint =
    (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login' && pathname !== '/api/admin/verify') ||
    pathname === '/api/upload' ||
    pathname === '/api/translate' ||
    (pathname === '/api/bookings' && request.method === 'GET') ||
    (pathname.startsWith('/api/bookings/') && pathname !== '/api/bookings/track') ||
    pathname.startsWith('/api/curhat/') ||
    (pathname.startsWith('/api/articles') && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method));

  if (isAdminOnlyEndpoint) {
    const isValid = await isValidAdminSessionTokenEdge(token);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Sesi pengelola tidak valid atau telah berakhir.' },
        {
          status: 401,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
            'X-Request-Id': requestId,
          },
        }
      );
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
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/admin') || isAdminOnlyEndpoint) {
    response.headers.set('Cache-Control', 'no-store, max-age=0');
  }

  // Apply Edge Rate Limiting ONLY to endpoints that do not already perform rate-limiting in their route handler
  // (Endpoints like /api/admin/login, /api/bookings, /api/curhat, /api/translate, /api/notifications/subscribe,
  // and /api/articles/view enforce rate-limiting directly inside their route handlers so they are counted once.)
  if (request.method === 'POST') {
    const ip = getClientIp(request);

    // 1. Admin refresh: 10 attempts / 1 minute
    if (pathname === '/api/admin/refresh') {
      const rateCheck = await checkDistributedRateLimit(`refresh:${ip}`, 10, 60);
      if (!rateCheck.success) {
        return NextResponse.json(
          {
            success: false,
            message: `Terlalu banyak permintaan perpanjangan sesi. Coba kembali dalam ${rateCheck.retryAfterSeconds} detik.`,
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

    // 2. File Upload: 20 uploads / 5 minutes (checked at edge before multipart body parsing)
    if (pathname === '/api/upload') {
      const rateCheck = await checkDistributedRateLimit(`upload:${ip}`, 20, 300);
      if (!rateCheck.success) {
        return NextResponse.json(
          {
            success: false,
            message: `Terlalu banyak unggahan berkas. Coba kembali dalam ${rateCheck.retryAfterSeconds} detik.`,
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
