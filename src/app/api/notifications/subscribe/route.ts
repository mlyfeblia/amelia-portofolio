import { NextResponse } from 'next/server';
import { checkDistributedRateLimit, getClientIp } from '@/lib/rate-limiter';
import { isAuthenticatedAdmin } from '@/lib/admin-auth';
import { savePushSubscription, deletePushSubscription } from '@/lib/data-store';
import { telemetry } from '@/lib/telemetry';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  try {
    // 1. Distributed rate limiting: max 10 subscriptions per minute per IP
    const rateCheck = await checkDistributedRateLimit(`push_sub:${ip}`, 10, 60);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak permintaan langganan notifikasi. Silakan coba kembali dalam ${rateCheck.retryAfterSeconds} detik.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.retryAfterSeconds),
          },
        }
      );
    }

    const body = await request.json();
    const { subscription, bookingCode, role } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { success: false, message: 'Objek subscription Web Push tidak valid.' },
        { status: 400 }
      );
    }

    const endpoint = String(subscription.endpoint);
    const p256dh = String(subscription.keys.p256dh || '');
    const auth = String(subscription.keys.auth || '');

    if (!p256dh || !auth) {
      return NextResponse.json(
        { success: false, message: 'Kunci enkripsi p256dh atau auth tidak ditemukan.' },
        { status: 400 }
      );
    }

    // 2. Authorization guard: Only verified admin session can claim admin subscription role
    const isAdmin = await isAuthenticatedAdmin(request);
    const assignedRole = role === 'admin' && isAdmin ? 'admin' : 'client';

    await savePushSubscription({
      endpoint,
      p256dh,
      auth,
      role: assignedRole,
      bookingCode: bookingCode ? String(bookingCode).trim().toUpperCase() : undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Langganan notifikasi berhasil didaftarkan.',
    });
  } catch (error) {
    telemetry.error('Gagal menyimpan langganan notifikasi Web Push', error, {
      route: '/api/notifications/subscribe',
    });
    return NextResponse.json(
      { success: false, message: 'Terjadi kendala saat mendaftarkan notifikasi.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const ip = getClientIp(request);
  try {
    const rateCheck = await checkDistributedRateLimit(`push_unsub:${ip}`, 10, 60);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak permintaan pembatalan notifikasi. Silakan coba kembali dalam ${rateCheck.retryAfterSeconds} detik.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.retryAfterSeconds),
          },
        }
      );
    }

    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint || typeof endpoint !== 'string') {
      return NextResponse.json({ success: false, message: 'Endpoint diperlukan.' }, { status: 400 });
    }

    await deletePushSubscription(endpoint);

    return NextResponse.json({ success: true, message: 'Langganan notifikasi berhasil dihapus.' });
  } catch (error) {
    telemetry.error('Gagal menghapus langganan notifikasi', error, {
      route: '/api/notifications/subscribe',
    });
    return NextResponse.json({ success: false, message: 'Gagal memproses pembatalan.' }, { status: 500 });
  }
}
