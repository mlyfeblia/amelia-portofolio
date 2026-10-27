import { NextResponse } from 'next/server';
import { getArticles, createArticle, getLastKnownDatabaseStatus } from '@/lib/data-store';
import { isAuthenticatedAdmin } from '@/lib/admin-auth';
import { validateArticleCreateInput } from '@/lib/validators';
import { telemetry } from '@/lib/telemetry';
import { sendPushNotificationToRole } from '@/lib/web-push-server';

export async function GET(request: Request) {
  try {
    const isAuth = await isAuthenticatedAdmin(request);
    const articles = await getArticles(!isAuth);
    const dbStatus = getLastKnownDatabaseStatus();
    return NextResponse.json(
      {
        success: true,
        data: articles,
        dbStatus,
        isFallback: dbStatus === 'paused',
      },
      {
        headers: {
          'Cache-Control': isAuth
            ? 'no-store, max-age=0'
            : 'private, no-cache, must-revalidate',
          'X-Database-Status': dbStatus,
        },
      }
    );
  } catch (error) {
    telemetry.error('Error fetching articles', error, { route: '/api/articles', method: 'GET' });
    try {
      const fallback = await getArticles(true);
      return NextResponse.json(
        { success: true, data: fallback, dbStatus: 'paused', isFallback: true },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    } catch {
      return NextResponse.json({ success: false, message: 'Gagal mengambil artikel', dbStatus: 'paused' }, { status: 500 });
    }
  }
}

export async function POST(request: Request) {
  try {
    const isAuth = await isAuthenticatedAdmin(request);
    if (!isAuth) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Silakan login sebagai pengelola.' },
        { status: 401 }
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

    const validation = validateArticleCreateInput(body);
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { success: false, message: validation.error || 'Data artikel tidak valid' },
        { status: 400 }
      );
    }

    const created = await createArticle(validation.data);

    if (created.isPublished) {
      await sendPushNotificationToRole('client', {
        title: 'Artikel Refleksi Baru!',
        body: created.title,
        url: `/articles/${created.slug}`,
        tag: `article-${created.slug}`,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    telemetry.error('Error creating article', error, { route: '/api/articles', method: 'POST' });
    return NextResponse.json(
      { success: false, message: 'Gagal membuat artikel baru' },
      { status: 500 }
    );
  }
}
