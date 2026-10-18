'use client';

export interface OfflineMutationItem {
  id: string;
  type: 'booking' | 'curhat';
  endpoint: string;
  payload: Record<string, unknown>;
  tempCode?: string;
  createdAt: number;
}

const OFFLINE_QUEUE_KEY = 'amelia_offline_mutation_queue_v1';
const OFFLINE_SYNC_LOCK_KEY = 'amelia_offline_sync_lock_v1';
const SYNC_LOCK_TTL_MS = 15_000;

export function getOfflineQueue(): OfflineMutationItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function enqueueOfflineMutation(
  type: 'booking' | 'curhat',
  endpoint: string,
  payload: Record<string, unknown>,
  tempCode?: string
): void {
  if (typeof window === 'undefined') return;
  try {
    const queue = getOfflineQueue();
    const item: OfflineMutationItem = {
      id: `mut_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      endpoint,
      payload,
      tempCode,
      createdAt: Date.now(),
    };
    queue.push(item);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('amelia:offline-queue-updated'));
  } catch (err) {
    console.warn('Gagal menyimpan mutasi ke antrean offline:', err);
  }
}

export async function processOfflineQueue(): Promise<{ processed: number; failed: number }> {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return { processed: 0, failed: 0 };
  }

  // Cross-tab mutex lock to prevent duplicate concurrent queue replay across open tabs
  try {
    const existingLock = localStorage.getItem(OFFLINE_SYNC_LOCK_KEY);
    if (existingLock) {
      const lockTime = parseInt(existingLock, 10);
      if (!isNaN(lockTime) && Date.now() - lockTime < SYNC_LOCK_TTL_MS) {
        return { processed: 0, failed: 0 };
      }
    }
    localStorage.setItem(OFFLINE_SYNC_LOCK_KEY, String(Date.now()));
  } catch {
    // Ignore storage error
  }

  try {
    const queue = getOfflineQueue();
    if (queue.length === 0) return { processed: 0, failed: 0 };

    const remaining: OfflineMutationItem[] = [];
    let processed = 0;
    let failed = 0;

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      try {
        const res = await fetch(item.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
        });

        if (res.ok) {
          processed++;
          try {
            const data = await res.json();
            if (item.type === 'booking' && data?.success && data?.data) {
              const b = data.data;
              const { saveDeviceBooking, removeDeviceBooking } = await import('@/lib/booking-storage');
              if (item.tempCode) {
                removeDeviceBooking(item.tempCode);
              }
              saveDeviceBooking({
                code: b.code,
                name: b.alias || b.name,
                category: b.category,
                date: b.date,
                timeSlot: b.timeSlot,
              });
              window.dispatchEvent(
                new CustomEvent('amelia:offline-booking-confirmed', {
                  detail: { code: b.code, tempCode: item.tempCode },
                })
              );
            }
          } catch {}
        } else if (res.status === 429) {
          // Rate-limited: preserve current and remaining items for next retry window
          remaining.push(...queue.slice(i));
          break;
        } else if (res.status >= 400 && res.status < 500) {
          // Permanent client validation error (400/403/404): drop item so queue doesn't get stuck
          failed++;
        } else {
          // 5xx server error: keep in queue for retry
          remaining.push(item);
        }
      } catch {
        // Network error / offline again: keep in queue for retry
        remaining.push(item);
      }
    }

    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
      window.dispatchEvent(new CustomEvent('amelia:offline-queue-updated'));
      if (processed > 0) {
        window.dispatchEvent(
          new CustomEvent('amelia:show-toast', {
            detail: {
              type: 'success',
              message: `Koneksi pulih: ${processed} data offline berhasil disinkronkan ke server.`,
            },
          })
        );
      }
    } catch {}

    return { processed, failed };
  } finally {
    try {
      localStorage.removeItem(OFFLINE_SYNC_LOCK_KEY);
    } catch {}
  }
}

/**
 * Inisialisasi pendengar event online peramban untuk otomatis memproses antrean
 */
export function initOfflineQueueSync(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => {
    processOfflineQueue().catch(() => {});
  };

  window.addEventListener('online', handleOnline);
  // Cek sekali saat inisialisasi jika online
  if (navigator.onLine) {
    handleOnline();
  }

  return () => {
    window.removeEventListener('online', handleOnline);
  };
}
