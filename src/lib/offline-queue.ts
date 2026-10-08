'use client';

export interface OfflineMutationItem {
  id: string;
  type: 'booking' | 'curhat';
  endpoint: string;
  payload: Record<string, unknown>;
  createdAt: number;
}

const OFFLINE_QUEUE_KEY = 'amelia_offline_mutation_queue_v1';

export function getOfflineQueue(): OfflineMutationItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function enqueueOfflineMutation(
  type: 'booking' | 'curhat',
  endpoint: string,
  payload: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;
  try {
    const queue = getOfflineQueue();
    const item: OfflineMutationItem = {
      id: `mut_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      endpoint,
      payload,
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

  const queue = getOfflineQueue();
  if (queue.length === 0) return { processed: 0, failed: 0 };

  const remaining: OfflineMutationItem[] = [];
  let processed = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      const res = await fetch(item.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      });

      if (res.ok) {
        processed++;
      } else {
        // Jika server menolak karena validasi 400, jangan coba ulang terus-menerus
        if (res.status >= 400 && res.status < 500) {
          failed++;
        } else {
          remaining.push(item);
        }
      }
    } catch {
      // Masih offline atau error jaringan, simpan untuk nanti
      remaining.push(item);
    }
  }

  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    window.dispatchEvent(new CustomEvent('amelia:offline-queue-updated'));
  } catch {}

  return { processed, failed };
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
