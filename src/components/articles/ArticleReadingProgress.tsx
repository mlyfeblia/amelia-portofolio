'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';
import { getPreferredScrollBehavior } from '@/lib/dom-utils';
import { cn } from '@/lib/utils';

export function ArticleReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0) {
            const currentScroll = window.scrollY;
            const currentProgress = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
            setProgress(currentProgress);
            setShowBackToTop(currentScroll > 500);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: getPreferredScrollBehavior(),
    });
  }, []);

  return (
    <>
      {/* 2px Slim Reading Progress Bar under sticky header (h-16 = 64px) */}
      <div
        className="fixed top-16 left-0 right-0 h-[2.5px] z-30 pointer-events-none bg-[var(--color-paper-border)]/40 overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progres membaca artikel"
      >
        <div
          className="h-full bg-[var(--color-accent)] transition-transform duration-75 ease-out will-change-transform"
          style={{
            transform: `scaleX(${progress / 100})`,
            transformOrigin: 'left',
          }}
        />
      </div>

      {/* Floating Back to Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        className={cn(
          'fixed bottom-6 right-5 sm:right-8 z-30 p-2.5 sm:p-3 rounded-full bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-[var(--color-ink)] shadow-md hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]/50 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
          showBackToTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'
        )}
        title="Kembali ke atas artikel"
        aria-label="Kembali ke bagian atas artikel"
      >
        <ArrowUp className="w-4 h-4 sm:w-4.5 sm:h-4.5" aria-hidden="true" />
      </button>
    </>
  );
}

export default ArticleReadingProgress;
