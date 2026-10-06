'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const SCROLL_PREFIX = 'scroll_pos_';

/**
 * ScrollRestorationProvider
 * Ensures smooth, jump-free scroll behavior across desktop and mobile.
 * Relies on the browser's native compositor-level scroll restoration on page refresh
 * (avoiding any jarring "top-then-jump-to-middle" flicker), while ensuring
 * that route transitions via Next.js start cleanly at the top.
 */
export default function ScrollRestorationProvider() {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Ensure native scroll restoration is active so browser naturally restores without jump
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'auto';
    }

    const currentPath = window.location.pathname + window.location.search;
    const currentKey = SCROLL_PREFIX + currentPath;

    // When navigating to a new route via Next.js Link, start at the top
    if (prevPathRef.current !== null && prevPathRef.current !== pathname) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      try {
        sessionStorage.setItem(currentKey, '0');
      } catch {}
    }

    prevPathRef.current = pathname;

    // Passive scroll tracking for storage
    let rafId: number | null = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        try {
          sessionStorage.setItem(currentKey, window.scrollY.toString());
        } catch {}
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, [pathname]);

  return null;
}
