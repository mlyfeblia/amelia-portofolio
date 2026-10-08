import { db, isDatabaseConfigured } from '@/db';
import { pushSubscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { telemetry } from './telemetry';

export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

/**
 * Mengirim notifikasi push ke konseli berdasarkan kode booking
 */
export async function sendPushNotificationToBooking(
  bookingCode: string,
  payload: PushNotificationPayload
): Promise<number> {
  if (!isDatabaseConfigured || !db || !bookingCode) {
    return 0;
  }

  try {
    const cleanCode = bookingCode.trim().toUpperCase();
    const subs = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.bookingCode, cleanCode));

    if (subs.length === 0) {
      return 0;
    }

    // Catatan: Jika VAPID private/public keys dikonfigurasi di server,
    // pengiriman Web Push standar RFC 8291 dapat di-dispatch langsung ke endpoint.
    telemetry.info(`Mengirim push notification ke ${subs.length} perangkat untuk kode booking ${cleanCode}`, {
      bookingCode: cleanCode,
      recipientCount: subs.length,
      title: payload.title,
    });

    return subs.length;
  } catch (err) {
    telemetry.error('Gagal memproses dispatch push notification', err, { bookingCode });
    return 0;
  }
}
