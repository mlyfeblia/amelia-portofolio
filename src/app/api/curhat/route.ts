import { NextResponse } from 'next/server';
import { getCurhatList, createCurhat } from '@/lib/data-store';
import { isAuthenticatedAdmin } from '@/lib/admin-auth';
import { checkDistributedRateLimit, getClientIp } from '@/lib/rate-limiter';
import { validateCurhatInput } from '@/lib/validators';
import { telemetry } from '@/lib/telemetry';
import { sendAdminCurhatAlertEmail } from '@/lib/resend';
import { sendPushNotificationToRole } from '@/lib/web-push-server';

export async function GET(request: Request) {
  try {
    const isAuth = await isAuthenticatedAdmin(request);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Unauthenticated public users only see public curhat messages
    const list = await getCurhatList(
      !isAuth,
      isNaN(limit) ? 100 : limit,
      isNaN(offset) ? 0 : offset
    );
    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    telemetry.error('Error fetching curhat', error, { route: '/api/curhat', method: 'GET' });
    return NextResponse.json({ success: false, message: 'Gagal mengambil curhat' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  try {
    // Limit to 10 submissions per 10 minutes (600 seconds) per IP
    const rateCheck = await checkDistributedRateLimit(`curhat:${ip}`, 10, 600);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak pengiriman pesan. Silakan coba kembali dalam ${rateCheck.retryAfterSeconds} detik.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateCheck.retryAfterSeconds.toString(),
          },
        }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Format data JSON tidak valid.' },
        { status: 400 }
      );
    }

    // Server-side honeypot verification
    if (body && typeof body === 'object') {
      const b = body as Record<string, unknown>;
      if ((typeof b.botTrap === 'string' && b.botTrap.trim().length > 0) ||
          (typeof b.website === 'string' && b.website.trim().length > 0)) {
        return NextResponse.json({
          success: true,
          message: 'Cerita/pertanyaanmu berhasil dikirimkan ke Kak Amel.',
          data: { id: 'cur-filtered', alias: 'Anonymous' },
        });
      }
    }

    const validation = validateCurhatInput(body);

    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { success: false, message: validation.error || 'Pesan cerita tidak valid.' },
        { status: 400 }
      );
    }

    const newCurhat = await createCurhat(validation.data);

    // Trigger async email notification to admin in background
    sendAdminCurhatAlertEmail(newCurhat).catch((e) => console.error('Admin curhat alert email error:', e));

    // Trigger non-blocking push notification to admin devices
    sendPushNotificationToRole('admin', {
      title: 'Pesan Teman Curhat Baru!',
      body: `Dari "${newCurhat.alias}" (Kategori: ${newCurhat.category})`,
      url: '/admin/counseling',
      tag: `curhat-${newCurhat.id}`,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Cerita/pertanyaanmu berhasil dikirimkan ke Kak Amel.',
      data: newCurhat,
    });
  } catch (error) {
    telemetry.error('Error posting curhat', error, { route: '/api/curhat', method: 'POST', ip });
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
