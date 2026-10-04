import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkDistributedRateLimit, getClientIp } from '@/lib/rate-limiter';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = crypto.randomUUID();

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
  }

  return response;
}

export const config = {
  matcher: [
    '/api/admin/login',
    '/api/bookings',
    '/api/curhat',
  ],
};
