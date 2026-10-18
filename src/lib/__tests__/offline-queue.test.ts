import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getOfflineQueue,
  enqueueOfflineMutation,
  processOfflineQueue,
} from '../offline-queue';

const storageMap = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => storageMap.get(key) ?? null,
  setItem: (key: string, value: string) => storageMap.set(key, String(value)),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
};

// Polyfill window, localStorage, navigator, and CustomEvent for Node test environment
if (typeof globalThis.window === 'undefined') {
  (globalThis as unknown as { window: unknown }).window = {
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: unknown }).localStorage = mockLocalStorage;
}
Object.defineProperty(globalThis, 'navigator', {
  value: { onLine: true },
  configurable: true,
  writable: true,
});
if (typeof globalThis.CustomEvent === 'undefined') {
  (globalThis as unknown as { CustomEvent: unknown }).CustomEvent = class CustomEvent {
    type: string;
    detail: unknown;
    constructor(type: string, params?: { detail?: unknown }) {
      this.type = type;
      this.detail = params?.detail;
    }
  };
}

describe('Offline Queue Unit Test Suite', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  it('starts with an empty queue', () => {
    expect(getOfflineQueue()).toEqual([]);
  });

  it('enqueues mutations into localStorage and dispatches event', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    enqueueOfflineMutation('curhat', '/api/curhat', {
      alias: 'Sobat Amel',
      message: 'Halo Amel, ini pesan percobaan offline.',
    });

    const queue = getOfflineQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].type).toBe('curhat');
    expect(queue[0].endpoint).toBe('/api/curhat');
    expect(queue[0].payload.alias).toBe('Sobat Amel');
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('enqueues multiple mutations and preserves ordering', () => {
    enqueueOfflineMutation('booking', '/api/bookings', { name: 'Konseli 1' });
    enqueueOfflineMutation('curhat', '/api/curhat', { message: 'Pesan 2' });

    const queue = getOfflineQueue();
    expect(queue.length).toBe(2);
    expect(queue[0].type).toBe('booking');
    expect(queue[1].type).toBe('curhat');
  });

  it('processes offline queue and removes successful items', async () => {
    (globalThis.navigator as { onLine: boolean }).onLine = true;

    enqueueOfflineMutation('booking', '/api/bookings', {
      name: 'Konseli Sukses',
      date: '2026-10-25',
    });

    // Mock fetch success
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          code: 'BKI-2610-123456',
          name: 'Konseli Sukses',
          category: 'Pengembangan Diri',
          date: '2026-10-25',
          timeSlot: '09:00 - 10:00 WIB',
        },
      }),
    } as Response);

    const result = await processOfflineQueue();
    expect(result.processed).toBe(1);
    expect(result.failed).toBe(0);
    expect(fetchSpy).toHaveBeenCalledWith('/api/bookings', expect.any(Object));

    // Queue should now be empty in localStorage
    expect(getOfflineQueue()).toEqual([]);
  });

  it('retains items in queue if network error occurs during processing', async () => {
    (globalThis.navigator as { onLine: boolean }).onLine = true;

    enqueueOfflineMutation('curhat', '/api/curhat', { message: 'Pesan Jaringan Gagal' });

    // Mock fetch error (network drop)
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Failed to fetch (offline)'));

    const result = await processOfflineQueue();
    expect(result.processed).toBe(0);
    expect(result.failed).toBe(0);

    // Item should remain in queue to be retried next time
    expect(getOfflineQueue().length).toBe(1);
  });

  it('removes tempCode from device bookings upon successful booking sync', async () => {
    (globalThis.navigator as { onLine: boolean }).onLine = true;
    const tempCode = 'BKI-OFFLINE-9999';

    enqueueOfflineMutation(
      'booking',
      '/api/bookings',
      { name: 'Konseli Temp' },
      tempCode
    );

    const queue = getOfflineQueue();
    expect(queue[0].tempCode).toBe(tempCode);

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          code: 'BKI-2610-888888',
          name: 'Konseli Temp',
          category: 'Konseling Privat',
          date: '2026-10-30',
          timeSlot: '13:00 - 14:00 WIB',
        },
      }),
    } as Response);

    const result = await processOfflineQueue();
    expect(result.processed).toBe(1);
    expect(getOfflineQueue()).toEqual([]);
  });
});

