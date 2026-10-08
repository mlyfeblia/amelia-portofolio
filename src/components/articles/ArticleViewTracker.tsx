'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ArticleViewTrackerProps {
  slug: string;
  initialViews?: number;
  className?: string;
}

export function ArticleViewTracker({
  slug,
  initialViews = 0,
  className,
}: ArticleViewTrackerProps) {
  const [views, setViews] = useState<number>(initialViews);
  const [prevInitialViews, setPrevInitialViews] = useState<number>(initialViews);
  const hasTriggeredRef = useRef<boolean>(false);

  if (prevInitialViews !== initialViews) {
    setPrevInitialViews(initialViews);
    setViews(initialViews);
  }

  useEffect(() => {
    if (!slug) return;

    const storageKey = `viewed_art_${slug}`;
    try {
      if (sessionStorage.getItem(storageKey)) {
        return;
      }
    } catch {
      // Ignore sessionStorage access errors
    }

    let timer: ReturnType<typeof setTimeout> | null = null;

    const triggerView = () => {
      if (hasTriggeredRef.current) return;
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }
      hasTriggeredRef.current = true;

      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibility);

      try {
        sessionStorage.setItem(storageKey, 'true');
      } catch {
        // Ignore sessionStorage access errors
      }

      fetch('/api/articles/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((data) => {
          if (data && typeof data.views === 'number') {
            setViews(data.views);
          }
        })
        .catch((err) => {
          console.error('Failed to update article views:', err);
        });
    };

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight > 0 && scrollTop / scrollHeight >= 0.15) {
        triggerView();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        // If tab was backgrounded and now active, evaluate after a short delay
        if (!timer) {
          timer = setTimeout(triggerView, 3500);
        }
      }
    };

    // 1. Timer dwell time: 4000ms if active
    if (typeof document === 'undefined' || document.visibilityState === 'visible') {
      timer = setTimeout(triggerView, 4000);
    }

    // 2. Scroll threshold: 15%
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [slug]);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-xs text-[var(--color-accent)] font-medium shadow-2xs shrink-0',
        className
      )}
      title={`${views} kali dibaca`}
    >
      <Eye className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
      <span>{views} pembaca</span>
    </span>
  );
}

export default ArticleViewTracker;
