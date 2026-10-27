import { describe, it, expect, beforeEach } from 'vitest';
import { Booking } from '@/types';

const localStorageMap = new Map<string, string>();
const sessionStorageMap = new Map<string, string>();

const mockLocalStorage = {
  getItem: (key: string) => localStorageMap.get(key) ?? null,
  setItem: (key: string, value: string) => localStorageMap.set(key, String(value)),
  removeItem: (key: string) => localStorageMap.delete(key),
  clear: () => localStorageMap.clear(),
};

const mockSessionStorage = {
  getItem: (key: string) => sessionStorageMap.get(key) ?? null,
  setItem: (key: string, value: string) => sessionStorageMap.set(key, String(value)),
  removeItem: (key: string) => sessionStorageMap.delete(key),
  clear: () => sessionStorageMap.clear(),
};

const listeners = new Map<string, Set<(e: unknown) => void>>();

if (typeof globalThis.window === 'undefined') {
  (globalThis as unknown as { window: unknown }).window = {
    dispatchEvent: (e: { type: string }) => {
      listeners.get(e.type)?.forEach((cb) => cb(e));
      return true;
    },
    addEventListener: (type: string, cb: (e: unknown) => void) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(cb);
    },
    removeEventListener: (type: string, cb: (e: unknown) => void) => {
      listeners.get(type)?.delete(cb);
    },
  };
}

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: unknown }).localStorage = mockLocalStorage;
}

if (typeof globalThis.sessionStorage === 'undefined') {
  (globalThis as unknown as { sessionStorage: unknown }).sessionStorage = mockSessionStorage;
}

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

// Import after polyfills are active
import { adminCache } from '@/lib/admin-cache';
import { pingDatabase } from '@/db';

describe('InsForge Database Resilience & Disaster Recovery Suite', () => {
  beforeEach(() => {
    localStorageMap.clear();
    sessionStorageMap.clear();
    listeners.clear();
    adminCache.clearAll();
    adminCache.setDatabaseStatus('online', false);
  });

  describe('Database Ping & Health Check Helper', () => {
    it('executes pingDatabase and returns valid latency and status structure', async () => {
      const ping = await pingDatabase(3000);
      expect(typeof ping.ok).toBe('boolean');
      expect(typeof ping.latencyMs).toBe('number');
      expect(ping.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('handles simulated timeout gracefully without throwing uncaught exceptions', async () => {
      const ping = await pingDatabase(0);
      expect(typeof ping.ok).toBe('boolean');
      expect(typeof ping.latencyMs).toBe('number');
    });
  });

  describe('Admin Disaster Recovery Persistent Snapshot Cache', () => {
    const mockBookings: Booking[] = [
      {
        id: 'bk-test-1',
        code: 'BKI-2610-TEST1',
        name: 'Konseli Cadangan',
        phone: '081234567890',
        email: 'konseli@example.com',
        category: 'Manajemen Stres, Emosi & Burnout',
        mode: 'online_meet',
        date: '2026-10-30',
        timeSlot: '10:00 - 11:00 WIB',
        notes: 'Catatan konsultasi offline snapshot',
        status: 'menunggu',
        createdAt: new Date().toISOString(),
      },
    ];

    it('persists non-empty bookings to localStorage as disaster recovery snapshot', () => {
      adminCache.setBookings(mockBookings, false);

      const raw = mockLocalStorage.getItem('admin_snapshot_bookings');
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe('bk-test-1');

      const meta = adminCache.getSnapshotMeta();
      expect(meta.lastSaved).toBeTruthy();
      expect(meta.counts.bookings).toBe(1);
    });

    it('hydrates from persistent snapshot if sessionStorage is cleared (simulating browser reload while InsForge is paused)', () => {
      mockLocalStorage.setItem('admin_snapshot_bookings', JSON.stringify(mockBookings));
      mockSessionStorage.clear();
      adminCache.clearAll(); // clears session & memory, preserves persistent snapshot

      const retrieved = adminCache.getBookings();
      expect(retrieved).not.toBeNull();
      expect(retrieved).toHaveLength(1);
      expect(retrieved![0].name).toBe('Konseli Cadangan');
    });

    it('tracks and notifies database operational status changes', () => {
      expect(adminCache.getDatabaseStatus()).toBe('online');

      let notifiedStatus = '';
      const listener = (e: unknown) => {
        const custom = e as { detail?: { status?: string } };
        notifiedStatus = custom.detail?.status || '';
      };
      window.addEventListener('amelia:admin-db-status-changed', listener);

      adminCache.setDatabaseStatus('paused', true);

      expect(adminCache.getDatabaseStatus()).toBe('paused');
      expect(mockLocalStorage.getItem('admin_db_status')).toBe('paused');
      expect(notifiedStatus).toBe('paused');

      window.removeEventListener('amelia:admin-db-status-changed', listener);
    });
  });
});
