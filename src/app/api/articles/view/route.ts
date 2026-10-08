import { NextRequest, NextResponse } from 'next/server';
import { incrementArticleViews } from '@/lib/data-store';
import { checkDistributedRateLimit, getClientIp } from '@/lib/rate-limiter';
import { telemetry } from '@/lib/telemetry';

export async function POST(request: NextRequest) {
  try {
    // 1. Distributed rate limiting: 30 requests per minute per IP
    const ip = getClientIp(request);
    const rateCheck = await checkDistributedRateLimit(`article_view:${ip}`, 30, 60);

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Terlalu banyak permintaan tampilan artikel. Coba lagi sebentar lagi.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.retryAfterSeconds),
          },
        }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Format JSON payload tidak valid' },
        { status: 400 }
      );
    }

    if (
      !body ||
      typeof body !== 'object' ||
      !('slug' in body) ||
      typeof (body as { slug: unknown }).slug !== 'string' ||
      !(body as { slug: string }).slug.trim()
    ) {
      return NextResponse.json(
        { success: false, message: 'Parameter slug harus berupa string non-kosong' },
        { status: 400 }
      );
    }

    const slug = (body as { slug: string }).slug.trim();
    const cookieKey = `art_view_${slug.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

    // 2. 24-hour cookie deduplication per article to prevent pooler overload
    const alreadyViewed = request.cookies.get(cookieKey)?.value === '1';

    if (alreadyViewed) {
      return NextResponse.json({
        success: true,
        deduplicated: true,
        message: 'Tampilan artikel telah dicatat sebelumnya dalam 24 jam terakhir.',
      });
    }

    // 3. Atomic increment in database
    const views = await incrementArticleViews(slug);

    const response = NextResponse.json({ success: true, views });
    response.cookies.set(cookieKey, '1', {
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    telemetry.error('Error incrementing article views', error, {
      route: '/api/articles/view',
      method: 'POST',
    });
    return NextResponse.json(
      { success: false, message: 'Gagal menambah hitungan view artikel' },
      { status: 500 }
    );
  }
}
