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
            entry.target.classList.remove('reveal-pending');
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px 0px 50px 0px',
        threshold: 0.05,
      }
    );

    const elements = document.querySelectorAll('[data-reveal], .reveal-init');
    // Generous safe viewport buffer (250% of window height) so any content within the initial mobile reading experience
    // is immediately marked revealed and NEVER hidden or tagged with .reveal-pending on mount / refresh.
    const initialThreshold = window.innerHeight * 2.5;

    let savedScroll = 0;
    try {
      const fullPath = window.location.pathname + window.location.search;
      const savedRaw = sessionStorage.getItem('scroll_pos_' + fullPath) || sessionStorage.getItem('scroll_pos_' + window.location.pathname);
      if (savedRaw) {
        const parsed = parseInt(savedRaw, 10);
        // Discard micro-offsets (< 30px) as top
        savedScroll = parsed < 30 ? 0 : parsed;
      }
    } catch {
      // Ignore sessionStorage issues
    }

    const currentScrollY = Math.max(window.scrollY, savedScroll);

    elements.forEach((el) => {
      // If already revealed, ensure reveal-pending is stripped and skip
      if (el.classList.contains('revealed')) {
        el.classList.remove('reveal-pending');
        return;
      }

      const rect = el.getBoundingClientRect();
      const absoluteTop = rect.top + window.scrollY;

      // Reveal immediately if within safe threshold or near current/saved scroll position.
      // Elements within initial buffer are never hidden.
      const isWithinInitialBuffer = rect.top <= initialThreshold;
      const isWithinScrollBuffer = currentScrollY > 0 && absoluteTop <= (currentScrollY + initialThreshold);

      if (isWithinInitialBuffer || isWithinScrollBuffer) {
        el.classList.remove('reveal-pending');
        el.classList.add('revealed');
      } else {
        el.classList.add('reveal-pending');
        observer.observe(el);
      }
    });

    const mutationObserver = new MutationObserver(() => {
      const dynamicElements = document.querySelectorAll('[data-reveal]:not(.revealed):not(.reveal-pending)');
      dynamicElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 1.25) {
          el.classList.add('revealed');
        } else {
          el.classList.add('reveal-pending');
          observer.observe(el);
        }
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

