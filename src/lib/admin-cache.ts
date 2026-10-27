/**
 * In-memory, Session-backed & Persistent Snapshot Disaster Recovery Cache for Amelia Admin Dashboard
 * 
 * Capabilities:
 * 1. Instant optimistic renders: Eliminates empty-state flashes and skeleton re-renders.
 * 2. Persistent Local Backup: Retains the latest known good production dataset in localStorage
 *    so that even when InsForge is paused, the admin dashboard never appears empty.
 * 3. Health & Status Awareness: Tracks database operational status ('online' | 'paused' | 'checking').
 * 4. Multi-tab synchronization & window focus revalidation.
 */

import { Booking, AnonymousMessage, Article } from '@/types';
import { useEffect, useRef } from 'react';

export type DatabaseOperationalStatus = 'online' | 'paused' | 'checking';

interface AdminCacheStore {
  bookings: Booking[] | null;
  curhat: AnonymousMessage[] | null;
  articles: Article[] | null;
  dbStatus: DatabaseOperationalStatus;
  lastFetched: {
    bookings: number;
    curhat: number;
    articles: number;
    health: number;
  };
}

const memoryStore: AdminCacheStore = {
  bookings: null,
  curhat: null,
  articles: null,
  dbStatus: 'online',
  lastFetched: {
    bookings: 0,
    curhat: 0,
    articles: 0,
    health: 0,
  },
};

export const TTL_MS = 60 * 1000; // 1 minute fresh TTL; stale data still served instantly while revalidating

const STORAGE_KEYS = {
  SESSION_BOOKINGS: 'admin_cached_bookings',
  SESSION_CURHAT: 'admin_cached_curhat',
  SESSION_ARTICLES: 'admin_cached_articles',
  SNAPSHOT_BOOKINGS: 'admin_snapshot_bookings',
  SNAPSHOT_CURHAT: 'admin_snapshot_curhat',
  SNAPSHOT_ARTICLES: 'admin_snapshot_articles',
  SNAPSHOT_META: 'admin_snapshot_meta',
  DB_STATUS: 'admin_db_status',
  SYNC_EVENT: 'admin_sync_event',
} as const;

function notifyCrossTab(key: 'bookings' | 'curhat' | 'articles' | 'db_status') {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SYNC_EVENT, JSON.stringify({ key, timestamp: Date.now() }));
    if (key === 'db_status') {
      window.dispatchEvent(new CustomEvent('amelia:admin-db-status-changed', { detail: { status: memoryStore.dbStatus } }));
    } else {
      window.dispatchEvent(new CustomEvent('amelia:admin-cache-updated', { detail: { key } }));
    }
  } catch {}
}

function updateSnapshotMeta(category: 'bookings' | 'curhat' | 'articles', count: number) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SNAPSHOT_META);
    const meta = raw ? JSON.parse(raw) : { lastSaved: Date.now(), counts: {} };
    meta.lastSaved = Date.now();
    meta.counts = meta.counts || {};
    meta.counts[category] = count;
    localStorage.setItem(STORAGE_KEYS.SNAPSHOT_META, JSON.stringify(meta));
  } catch {}
}

export const adminCache = {
  isStale(key: 'bookings' | 'curhat' | 'articles'): boolean {
    const last = memoryStore.lastFetched[key];
    if (!last) return true;
    return Date.now() - last > TTL_MS;
  },

  // Database Operational Status
  getDatabaseStatus(): DatabaseOperationalStatus {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.DB_STATUS);
      if (stored === 'online' || stored === 'paused' || stored === 'checking') {
        memoryStore.dbStatus = stored;
      }
    }
    return memoryStore.dbStatus;
  },

  setDatabaseStatus(status: DatabaseOperationalStatus, broadcast = true) {
    const changed = memoryStore.dbStatus !== status;
    memoryStore.dbStatus = status;
    memoryStore.lastFetched.health = Date.now();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.DB_STATUS, status);
      } catch {}
      if (changed || broadcast) {
        window.dispatchEvent(new CustomEvent('amelia:admin-db-status-changed', { detail: { status } }));
        if (broadcast) {
          notifyCrossTab('db_status');
        }
      }
    }
  },

  getSnapshotMeta(): { lastSaved: number | null; counts: Record<string, number> } {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.SNAPSHOT_META);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch {}
    }
    return { lastSaved: null, counts: {} };
  },

  // Articles
  getArticles(): Article[] | null {
    if (memoryStore.articles !== null) {
      return memoryStore.articles;
    }
    if (typeof window !== 'undefined') {
      try {
        // 1. Check session storage
        const rawSession = sessionStorage.getItem(STORAGE_KEYS.SESSION_ARTICLES);
        if (rawSession) {
          const parsed = JSON.parse(rawSession);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryStore.articles = parsed;
            return parsed;
          }
        }
        // 2. Fallback to persistent disaster-recovery snapshot
        const rawSnapshot = localStorage.getItem(STORAGE_KEYS.SNAPSHOT_ARTICLES);
        if (rawSnapshot) {
          const parsed = JSON.parse(rawSnapshot);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryStore.articles = parsed;
            return parsed;
          }
        }
      } catch {}
    }
    return null;
  },

  setArticles(articles: Article[], broadcast = true) {
    memoryStore.articles = articles;
    memoryStore.lastFetched.articles = Date.now();
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_KEYS.SESSION_ARTICLES, JSON.stringify(articles));
        // Persist disaster recovery snapshot whenever we receive non-empty data
        if (articles.length > 0) {
          localStorage.setItem(STORAGE_KEYS.SNAPSHOT_ARTICLES, JSON.stringify(articles));
          updateSnapshotMeta('articles', articles.length);
        }
      } catch {}
      if (broadcast) {
        notifyCrossTab('articles');
      }
    }
  },

  // Bookings
  getBookings(): Booking[] | null {
    if (memoryStore.bookings !== null) {
      return memoryStore.bookings;
    }
    if (typeof window !== 'undefined') {
      try {
        // 1. Check session storage
        const rawSession = sessionStorage.getItem(STORAGE_KEYS.SESSION_BOOKINGS);
        if (rawSession) {
          const parsed = JSON.parse(rawSession);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryStore.bookings = parsed;
            return parsed;
          }
        }
        // 2. Fallback to persistent disaster-recovery snapshot
        const rawSnapshot = localStorage.getItem(STORAGE_KEYS.SNAPSHOT_BOOKINGS);
        if (rawSnapshot) {
          const parsed = JSON.parse(rawSnapshot);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryStore.bookings = parsed;
            return parsed;
          }
        }
      } catch {}
    }
    return null;
  },

  setBookings(bookings: Booking[], broadcast = true) {
    memoryStore.bookings = bookings;
    memoryStore.lastFetched.bookings = Date.now();
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_KEYS.SESSION_BOOKINGS, JSON.stringify(bookings));
        // Persist disaster recovery snapshot whenever we receive non-empty data
        if (bookings.length > 0) {
          localStorage.setItem(STORAGE_KEYS.SNAPSHOT_BOOKINGS, JSON.stringify(bookings));
          updateSnapshotMeta('bookings', bookings.length);
        }
      } catch {}
      if (broadcast) {
        notifyCrossTab('bookings');
      }
    }
  },

  // Curhat
  getCurhat(): AnonymousMessage[] | null {
    if (memoryStore.curhat !== null) {
      return memoryStore.curhat;
    }
    if (typeof window !== 'undefined') {
      try {
        // 1. Check session storage
        const rawSession = sessionStorage.getItem(STORAGE_KEYS.SESSION_CURHAT);
        if (rawSession) {
          const parsed = JSON.parse(rawSession);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryStore.curhat = parsed;
            return parsed;
          }
        }
        // 2. Fallback to persistent disaster-recovery snapshot
        const rawSnapshot = localStorage.getItem(STORAGE_KEYS.SNAPSHOT_CURHAT);
        if (rawSnapshot) {
          const parsed = JSON.parse(rawSnapshot);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryStore.curhat = parsed;
            return parsed;
          }
        }
      } catch {}
    }
    return null;
  },

  setCurhat(curhat: AnonymousMessage[], broadcast = true) {
    memoryStore.curhat = curhat;
    memoryStore.lastFetched.curhat = Date.now();
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_KEYS.SESSION_CURHAT, JSON.stringify(curhat));
        // Persist disaster recovery snapshot whenever we receive non-empty data
        if (curhat.length > 0) {
          localStorage.setItem(STORAGE_KEYS.SNAPSHOT_CURHAT, JSON.stringify(curhat));
          updateSnapshotMeta('curhat', curhat.length);
        }
      } catch {}
      if (broadcast) {
        notifyCrossTab('curhat');
      }
    }
  },

  // Health Verification Test Helper
  async checkDatabaseHealth(): Promise<DatabaseOperationalStatus> {
    this.setDatabaseStatus('checking');
    try {
      const res = await fetch('/api/admin/health', { cache: 'no-store' });
      const json = await res.json();
      const status: DatabaseOperationalStatus = json.database === 'online' ? 'online' : 'paused';
      this.setDatabaseStatus(status);
      return status;
    } catch {
      this.setDatabaseStatus('paused');
      return 'paused';
    }
  },

  // Clear session on logout (retains persistent disaster-recovery snapshot so offline emergency view remains available)
  clearAll() {
    memoryStore.bookings = null;
    memoryStore.curhat = null;
    memoryStore.articles = null;
    memoryStore.lastFetched = { bookings: 0, curhat: 0, articles: 0, health: 0 };
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(STORAGE_KEYS.SESSION_ARTICLES);
        sessionStorage.removeItem(STORAGE_KEYS.SESSION_BOOKINGS);
        sessionStorage.removeItem(STORAGE_KEYS.SESSION_CURHAT);
        localStorage.removeItem(STORAGE_KEYS.SYNC_EVENT);
      } catch {}
    }
  },
};

/**
 * React hook to automatically trigger silent background revalidation on:
 * 1. Window focus / tab re-entry (if cache is stale > 60s)
 * 2. Cross-tab modifications from other open admin tabs
 */
export function useAdminRevalidate(
  key: 'bookings' | 'curhat' | 'articles',
  revalidateFn: () => void | Promise<void>
) {
  const revalidateRef = useRef(revalidateFn);

  useEffect(() => {
    revalidateRef.current = revalidateFn;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAndRevalidate = () => {
      if (document.visibilityState === 'visible' && adminCache.isStale(key)) {
        revalidateRef.current();
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.SYNC_EVENT && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.key === key) {
            revalidateRef.current();
          }
        } catch {}
      }
    };

    window.addEventListener('focus', checkAndRevalidate);
    document.addEventListener('visibilitychange', checkAndRevalidate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('focus', checkAndRevalidate);
      document.removeEventListener('visibilitychange', checkAndRevalidate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [key]);
}
