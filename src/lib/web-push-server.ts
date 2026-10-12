import webpush from 'web-push';
import { env } from './env';
import {
  getPushSubscriptions,
  getPushSubscriptionsByBookingCode,
  deletePushSubscription,
  PushSubscriptionItem,
} from './data-store';
import { telemetry } from './telemetry';

export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
  badge?: string;
}

let isVapidConfigured = false;

function setupVapid(): boolean {
  if (isVapidConfigured) return true;
  if (env.isWebPushConfigured) {
    try {
      webpush.setVapidDetails(
        env.VAPID_SUBJECT,
        env.VAPID_PUBLIC_KEY,
        env.VAPID_PRIVATE_KEY
      );
      isVapidConfigured = true;
      return true;
    } catch (err) {
      telemetry.error('Failed to configure WebPush VAPID details', err);
      return false;
    }
  }
  return false;
}

async function dispatchPushToSubscription(
  sub: PushSubscriptionItem,
  payload: PushNotificationPayload
): Promise<boolean> {
  const isReady = setupVapid();
  if (!isReady) {
    telemetry.info('Web Push skipped (VAPID keys not configured in environment)', {
      endpoint: sub.endpoint.slice(0, 45) + '...',
      title: payload.title,
    });
    return true;
  }

  const pushSubscription: webpush.PushSubscription = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth,
    },
  };

  const payloadString = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: payload.badge || '/icons/icon-192x192.png',
    url: payload.url || '/',
    tag: payload.tag || 'amelia-counseling-alert',
    timestamp: Date.now(),
  });

  try {
    await webpush.sendNotification(pushSubscription, payloadString);
    return true;
  } catch (err: unknown) {
    const errorWithStatus = err as { statusCode?: number };
    // Prune invalid or unsubscribed endpoints (404 Not Found, 410 Gone)
    if (errorWithStatus.statusCode === 404 || errorWithStatus.statusCode === 410) {
      telemetry.info('Pruning expired Web Push subscription endpoint', {
        endpoint: sub.endpoint.slice(0, 45) + '...',
        statusCode: errorWithStatus.statusCode,
      });
      await deletePushSubscription(sub.endpoint);
    } else {
      telemetry.error('Error dispatching Web Push notification to endpoint', err, {
        endpoint: sub.endpoint.slice(0, 45) + '...',
      });
    }
    return false;
  }
}

/**
 * Mengirim notifikasi push ke konseli berdasarkan kode booking
 */
export async function sendPushNotificationToBooking(
  bookingCode: string,
  payload: PushNotificationPayload
): Promise<number> {
  if (!bookingCode) {
    return 0;
  }

  try {
    const cleanCode = bookingCode.trim().toUpperCase();
    const subs = await getPushSubscriptionsByBookingCode(cleanCode);

    if (subs.length === 0) {
      return 0;
    }

    let successCount = 0;
    await Promise.allSettled(
      subs.map(async (sub) => {
        const sent = await dispatchPushToSubscription(sub, payload);
        if (sent) successCount++;
      })
    );

    telemetry.info(`Dispatched push notifications for booking [${cleanCode}]`, {
      bookingCode: cleanCode,
      recipientCount: subs.length,
      successCount,
      title: payload.title,
    });

    return successCount;
  } catch (err) {
    telemetry.error('Gagal memproses dispatch push notification booking', err, { bookingCode });
    return 0;
  }
}

/**
 * Mengirim notifikasi push ke seluruh perangkat terdaftar berdasarkan role ('admin' | 'client')
 */
export async function sendPushNotificationToRole(
  role: 'admin' | 'client',
  payload: PushNotificationPayload
): Promise<number> {
  try {
    const subs = await getPushSubscriptions(role);
    if (subs.length === 0) {
      return 0;
    }

    let successCount = 0;
    await Promise.allSettled(
      subs.map(async (sub) => {
        const sent = await dispatchPushToSubscription(sub, payload);
        if (sent) successCount++;
      })
    );

    telemetry.info(`Dispatched push notifications for role [${role}]`, {
      role,
      recipientCount: subs.length,
      successCount,
      title: payload.title,
    });

    return successCount;
  } catch (err) {
    telemetry.error('Gagal memproses dispatch push notification role', err, { role });
    return 0;
  }
}
