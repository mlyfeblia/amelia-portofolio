import { NextResponse } from 'next/server';
import { db, isDatabaseConfigured } from '@/db';
import { pushSubscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { telemetry } from '@/lib/telemetry';

export async function POST(request: Request) {
  try {
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

    if (isDatabaseConfigured && db) {
      const existing = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, endpoint))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(pushSubscriptions)
          .set({
            p256dh,
            auth,
            bookingCode: bookingCode ? String(bookingCode).trim().toUpperCase() : existing[0].bookingCode,
            role: role === 'admin' ? 'admin' : 'client',
          })
          .where(eq(pushSubscriptions.endpoint, endpoint));
      } else {
        await db.insert(pushSubscriptions).values({
          id: `sub_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
          endpoint,
          p256dh,
          auth,
          role: role === 'admin' ? 'admin' : 'client',
          bookingCode: bookingCode ? String(bookingCode).trim().toUpperCase() : null,
        });
      }
    }

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
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint || typeof endpoint !== 'string') {
      return NextResponse.json({ success: false, message: 'Endpoint diperlukan.' }, { status: 400 });
    }

    if (isDatabaseConfigured && db) {
      await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
    }

    return NextResponse.json({ success: true, message: 'Langganan notifikasi berhasil dihapus.' });
  } catch (error) {
    telemetry.error('Gagal menghapus langganan notifikasi', error, {
      route: '/api/notifications/subscribe',
    });
    return NextResponse.json({ success: false, message: 'Gagal memproses pembatalan.' }, { status: 500 });
  }
}
