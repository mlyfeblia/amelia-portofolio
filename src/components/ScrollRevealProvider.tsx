'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ScrollRevealProvider
 * Ultra-lightweight, hardware-accelerated intersection observer for scroll reveal animations.
 * Observes all elements marked with `[data-reveal]` or `.reveal-init` and adds `.revealed`.
 * Automatically respects `prefers-reduced-motion`.
 * 
 * Never hides content within or near the initial viewport to guarantee zero-FOUC and zero-flicker on mobile & desktop.
 */
export default function ScrollRevealProvider() {
  const pathname = usePathname();

  useEffect(() => {
    // If reduced motion is requested, reveal all immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('[data-reveal], .reveal-init').forEach((el) => {
        el.classList.add('revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.05,
      }
    );

    const elements = document.querySelectorAll('[data-reveal], .reveal-init');
    // Generous viewport buffer (110% of window height) so any content even slightly visible or near the fold
    // is immediately marked revealed and NEVER vanishes or flashes on initial render / refresh.
    const initialThreshold = window.innerHeight * 1.1;

    let savedScroll = 0;
    try {
      const fullPath = window.location.pathname + window.location.search;
      const savedRaw = sessionStorage.getItem('scroll_pos_' + fullPath) || sessionStorage.getItem('scroll_pos_' + window.location.pathname);
      if (savedRaw) savedScroll = parseInt(savedRaw, 10);
    } catch {
      // Ignore sessionStorage issues
    }

    const currentScrollY = Math.max(window.scrollY, savedScroll);

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const absoluteTop = rect.top + window.scrollY;

      // Reveal immediately if within viewport or above/near the refreshed scroll position
      if (
        rect.top <= initialThreshold ||
        (currentScrollY > 0 && absoluteTop <= currentScrollY + initialThreshold)
      ) {
        el.classList.add('revealed');
      } else {
        el.classList.add('reveal-pending');
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

