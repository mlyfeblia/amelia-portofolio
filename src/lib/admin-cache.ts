/**
 * In-memory & Session-backed Stale-While-Revalidate Cache for Amelia Admin Dashboard
 * Eliminates empty-state flashes, skeleton re-renders, and provides multi-tab sync & window focus revalidation.
 */

import { Booking, AnonymousMessage, Article } from '@/types';
import { useEffect, useRef } from 'react';

interface AdminCacheStore {
  bookings: Booking[] | null;
  curhat: AnonymousMessage[] | null;
  articles: Article[] | null;
  lastFetched: {
    bookings: number;
    curhat: number;
    articles: number;
  };
}

const memoryStore: AdminCacheStore = {
  bookings: null,
  curhat: null,
  articles: null,
  lastFetched: {
    bookings: 0,
    curhat: 0,
    articles: 0,
  },
};

export const TTL_MS = 60 * 1000; // 1 minute fresh TTL; stale data still served instantly while revalidating

function notifyCrossTab(key: 'bookings' | 'curhat' | 'articles') {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('admin_sync_event', JSON.stringify({ key, timestamp: Date.now() }));
    window.dispatchEvent(new CustomEvent('amelia:admin-cache-updated', { detail: { key } }));
  } catch {}
}

export const adminCache = {
  isStale(key: 'bookings' | 'curhat' | 'articles'): boolean {
    const last = memoryStore.lastFetched[key];
    if (!last) return true;
    return Date.now() - last > TTL_MS;
  },

  // Articles
  getArticles(): Article[] | null {
    if (memoryStore.articles !== null) {
      return memoryStore.articles;
    }
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem('admin_cached_articles');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
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
        sessionStorage.setItem('admin_cached_articles', JSON.stringify(articles));
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
        const raw = sessionStorage.getItem('admin_cached_bookings');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
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
        sessionStorage.setItem('admin_cached_bookings', JSON.stringify(bookings));
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
        const raw = sessionStorage.getItem('admin_cached_curhat');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
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
        sessionStorage.setItem('admin_cached_curhat', JSON.stringify(curhat));
      } catch {}
      if (broadcast) {
        notifyCrossTab('curhat');
      }
    }
  },

  // Clear all on logout
  clearAll() {
    memoryStore.bookings = null;
    memoryStore.curhat = null;
    memoryStore.articles = null;
    memoryStore.lastFetched = { bookings: 0, curhat: 0, articles: 0 };
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('admin_cached_articles');
        sessionStorage.removeItem('admin_cached_bookings');
        sessionStorage.removeItem('admin_cached_curhat');
        localStorage.removeItem('admin_sync_event');
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
      if (e.key === 'admin_sync_event' && e.newValue) {
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
