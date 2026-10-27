import { NextRequest, NextResponse } from 'next/server';
import { isValidAdminSessionToken, COOKIE_NAME as ADMIN_COOKIE_NAME } from '@/lib/admin-auth';
import { checkDistributedRateLimit, getClientIp } from '@/lib/rate-limiter';
import { getArticles, boostArticleViews, setArticleViews } from '@/lib/data-store';
import { verifySecretPin, SECRET_SESSION_COOKIE } from '@/lib/secret-engine';

const NO_INDEX_HEADERS = {
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Cache-Control': 'no-store, max-age=0',
};

function checkAdminSession(request: NextRequest): boolean {
  const token =
    request.cookies.get(ADMIN_COOKIE_NAME)?.value ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();

  return isValidAdminSessionToken(token);
}

function checkPinAuthorized(request: NextRequest, bodyPin?: unknown): boolean {
  // 1. Check direct body/header PIN
  if (bodyPin && verifySecretPin(bodyPin)) {
    return true;
  }
  const headerPin = request.headers.get('x-secret-pin');
  if (headerPin && verifySecretPin(headerPin)) {
    return true;
  }

  // 2. Check secret session cookie
  const sessionCookie = request.cookies.get(SECRET_SESSION_COOKIE)?.value;
  return Boolean(sessionCookie && sessionCookie === 'authorized_071220');
}

export async function GET(request: NextRequest) {
  if (!checkAdminSession(request)) {
    return NextResponse.json(
      { success: false, message: 'Not Found' },
      { status: 404, headers: NO_INDEX_HEADERS }
    );
  }

  if (!checkPinAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: 'PIN otorisasi rahasia diperlukan' },
      { status: 403, headers: NO_INDEX_HEADERS }
    );
  }

  try {
    const rawArticles = await getArticles(false);
    const articles = rawArticles.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      views: a.views ?? 0,
      isPublished: a.isPublished ?? true,
      publishedAt: a.publishedAt,
      category: a.category || 'Refleksi Diri',
    }));

    return NextResponse.json(
      {
        success: true,
        articles,
        timestamp: new Date().toISOString(),
      },
      { headers: NO_INDEX_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data artikel' },
      { status: 500, headers: NO_INDEX_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  // 1. Enforce admin session requirement (Must be logged in as admin)
  if (!checkAdminSession(request)) {
    return NextResponse.json(
      { success: false, message: 'Not Found' },
      { status: 404, headers: NO_INDEX_HEADERS }
    );
  }

  // 2. Parse payload safely
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) || {};
  } catch {
    return NextResponse.json(
      { success: false, message: 'Payload JSON tidak valid' },
      { status: 400, headers: NO_INDEX_HEADERS }
    );
  }

  const action = String(body.action || '').trim();
  const inputPin = typeof body.pin === 'string' ? body.pin : undefined;
  const ip = getClientIp(request);

  // 3. Action: PIN Verification
  if (action === 'verify_pin') {
    const rateCheck = await checkDistributedRateLimit(`xyz_pin:${ip}`, 5, 900); // 5 attempts per 15 min
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Terlalu banyak percobaan PIN yang salah. Silakan coba lagi dalam 15 menit.',
          retryAfter: rateCheck.retryAfterSeconds,
        },
        { status: 429, headers: NO_INDEX_HEADERS }
      );
    }

    if (!verifySecretPin(inputPin)) {
      return NextResponse.json(
        { success: false, message: 'PIN rahasia salah.' },
        { status: 401, headers: NO_INDEX_HEADERS }
      );
    }

    // Success: return authorization cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Akses terverifikasi.',
        authorized: true,
      },
      { headers: NO_INDEX_HEADERS }
    );

    response.cookies.set(SECRET_SESSION_COOKIE, 'authorized_071220', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1 hour session
      path: '/',
    });

    return response;
  }

  // For all mutating operations below, enforce PIN authorization
  if (!checkPinAuthorized(request, inputPin)) {
    return NextResponse.json(
      { success: false, message: 'PIN otorisasi rahasia salah atau sesi berakhir.' },
      { status: 403, headers: NO_INDEX_HEADERS }
    );
  }

  // 4. Action: Boost Single Article Views
  if (action === 'boost') {
    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
    const count = typeof body.count === 'number' ? Math.max(1, Math.min(10000, Math.floor(body.count))) : 1;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Slug artikel harus disertakan.' },
        { status: 400, headers: NO_INDEX_HEADERS }
      );
    }

    const updatedViews = await boostArticleViews(slug, count);

    return NextResponse.json(
      {
        success: true,
        slug,
        added: count,
        currentViews: updatedViews,
        message: `Berhasil menambah +${count} views untuk artikel [${slug}].`,
      },
      { headers: NO_INDEX_HEADERS }
    );
  }

  // 5. Action: Boost All Published Articles
  if (action === 'boost_all') {
    const count = typeof body.count === 'number' ? Math.max(1, Math.min(500, Math.floor(body.count))) : 1;
    const articlesList = await getArticles(true);
    const results: { slug: string; currentViews: number }[] = [];

    for (const art of articlesList) {
      const views = await boostArticleViews(art.slug, count);
      results.push({ slug: art.slug, currentViews: views });
    }

    return NextResponse.json(
      {
        success: true,
        addedPerArticle: count,
        totalUpdated: results.length,
        results,
        message: `Berhasil menambah +${count} views ke seluruh ${results.length} artikel publik.`,
      },
      { headers: NO_INDEX_HEADERS }
    );
  }

  // 6. Action: Set Exact Views
  if (action === 'set') {
    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
    const targetViews = typeof body.targetViews === 'number' ? Math.max(0, Math.min(1000000, Math.floor(body.targetViews))) : 0;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Slug artikel harus disertakan.' },
        { status: 400, headers: NO_INDEX_HEADERS }
      );
    }

    const updatedViews = await setArticleViews(slug, targetViews);

    return NextResponse.json(
      {
        success: true,
        slug,
        targetViews,
        currentViews: updatedViews,
        message: `Berhasil mengubah jumlah views artikel [${slug}] menjadi ${updatedViews}.`,
      },
      { headers: NO_INDEX_HEADERS }
    );
  }

  // 7. Action: Auto-Pilot Tick (Natural randomized increment)
  if (action === 'auto_tick') {
    const min = typeof body.minCount === 'number' ? Math.max(1, Math.floor(body.minCount)) : 1;
    const max = typeof body.maxCount === 'number' ? Math.max(min, Math.floor(body.maxCount)) : 3;
    const randomCount = Math.floor(Math.random() * (max - min + 1)) + min;

    let targetSlug = typeof body.slug === 'string' ? body.slug.trim() : '';
    if (!targetSlug) {
      // Pick a random published article
      const published = await getArticles(true);
      if (published.length > 0) {
        const randomIndex = Math.floor(Math.random() * published.length);
        targetSlug = published[randomIndex].slug;
      }
    }

    if (!targetSlug) {
      return NextResponse.json(
        { success: false, message: 'Tidak ada artikel yang dapat ditambahkan.' },
        { status: 400, headers: NO_INDEX_HEADERS }
      );
    }

    const updatedViews = await boostArticleViews(targetSlug, randomCount);

    return NextResponse.json(
      {
        success: true,
        slug: targetSlug,
        added: randomCount,
        currentViews: updatedViews,
        message: `[Auto-Pilot] Berhasil menambah +${randomCount} views untuk artikel [${targetSlug}].`,
      },
      { headers: NO_INDEX_HEADERS }
    );
  }

  return NextResponse.json(
    { success: false, message: 'Action tidak dikenali.' },
    { status: 400, headers: NO_INDEX_HEADERS }
  );
}
