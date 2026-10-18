'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const PAUSE_TITLE = 'Ambil jeda sejenak... | Amelia BKI';
const INACTIVITY_THRESHOLD_MS = 90_000; // 90 seconds

export default function TabVisibilityManager() {
  const router = useRouter();
  const originalTitleRef = useRef<string>('');
  const lastLeftTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (document.title !== PAUSE_TITLE) {
          originalTitleRef.current = document.title;
        }
        document.title = PAUSE_TITLE;
        lastLeftTimeRef.current = Date.now();
      } else if (document.visibilityState === 'visible') {
        if (document.title === PAUSE_TITLE && originalTitleRef.current) {
          document.title = originalTitleRef.current;
        }

        if (lastLeftTimeRef.current !== null) {
          const elapsed = Date.now() - lastLeftTimeRef.current;
          const path = window.location.pathname;
          const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;
          const isSkipRoute =
            path.startsWith('/admin') ||
            path.startsWith('/~offline') ||
            path === '/about' ||
            path === '/services';

          if (elapsed > INACTIVITY_THRESHOLD_MS && isOnline && !isSkipRoute) {
            router.refresh();
          }
          lastLeftTimeRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (originalTitleRef.current && document.title === PAUSE_TITLE) {
        document.title = originalTitleRef.current;
      }
    };
  }, [router]);

  return null;
}
