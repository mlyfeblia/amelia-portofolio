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
        { status: 401 }
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

    // 1b. Admin refresh: 10 attempts / 1 minute
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

    // 1c. File Upload: 20 uploads / 5 minutes
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

    // 5. Web Push subscribe: 10 requests / 1 minute
    if (pathname === '/api/notifications/subscribe') {
      const rateCheck = await checkDistributedRateLimit(`push_sub:${ip}`, 10, 60);
      if (!rateCheck.success) {
        return NextResponse.json(
          {
            success: false,
            message: `Terlalu banyak permintaan langganan notifikasi. Coba kembali dalam ${rateCheck.retryAfterSeconds} detik.`,
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

    // 6. Article view count: 30 requests / 1 minute
    if (pathname === '/api/articles/view') {
      const rateCheck = await checkDistributedRateLimit(`article_view:${ip}`, 30, 60);
      if (!rateCheck.success) {
        return NextResponse.json(
          {
            success: false,
            message: `Terlalu banyak permintaan tampilan artikel. Coba kembali dalam ${rateCheck.retryAfterSeconds} detik.`,
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
