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
    } else if (prevPathRef.current === null) {
      // Initial mount / refresh:
      // Prevent dirty layout-shift offsets (e.g. from translateY entrance animations)
      // from falsely displacing the user down the page when they are intended to be at top.
      if (!window.location.hash) {
        let savedScroll = 0;
        try {
          const raw = sessionStorage.getItem(currentKey);
          if (raw) savedScroll = parseInt(raw, 10);
        } catch {}

        // If no saved position or saved position is a micro-shift (< 40px), ensure we reset cleanly to top
        if (savedScroll < 40 && window.scrollY > 0 && window.scrollY < 50) {
          window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
          try {
            sessionStorage.setItem(currentKey, '0');
          } catch {}
        }
      }
    }

    prevPathRef.current = pathname;

    // Passive scroll tracking for storage
    let rafId: number | null = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        try {
          const y = window.scrollY;
          // Discard micro layout shifts near the top (< 30px) so page refreshes at the top don't restore dirty offsets
          const normalizedY = y < 30 ? 0 : y;
          sessionStorage.setItem(currentKey, normalizedY.toString());
        } catch {}
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, [pathname]);

  // Scroll Isolation: Prevents dual-scroll and scroll chaining on textareas and scroll-isolated containers
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleGlobalWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // 1. Textarea scroll isolation
      const textarea = target.closest('textarea');
      if (textarea) {
        const maxScroll = textarea.scrollHeight - textarea.clientHeight;
        if (maxScroll > 1) {
          const delta = e.deltaY;
          if (delta !== 0) {
            e.preventDefault();
            textarea.scrollTop += delta;
          }
        }
        return;
      }

      // 2. Explicitly isolated scrollable containers (e.g. modal body, code blocks)
      const isolated = target.closest<HTMLElement>(
        '.scroll-isolated, [data-scroll-isolated="true"], .modal-scroll-body'
      );
      if (isolated) {
        const maxScroll = isolated.scrollHeight - isolated.clientHeight;
        if (maxScroll > 1) {
          const delta = e.deltaY;
          if (delta !== 0) {
            e.preventDefault();
            isolated.scrollTop += delta;
          }
        }
      }
    };

    window.addEventListener('wheel', handleGlobalWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleGlobalWheel);
    };
  }, []);

  return null;
}
