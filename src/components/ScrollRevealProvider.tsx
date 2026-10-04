'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ScrollRevealProvider
 * Ultra-lightweight, hardware-accelerated intersection observer for scroll reveal animations.
 * Observes all elements marked with `[data-reveal]` or `.reveal-init` and adds `.revealed`.
 * Automatically respects `prefers-reduced-motion`.
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
        rootMargin: '0px 0px -30px 0px',
        threshold: 0.05,
      }
    );

    const elements = document.querySelectorAll('[data-reveal], .reveal-init');
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      // If above the viewport bottom, reveal immediately so top content never blinks or flickers
      if (rect.top < window.innerHeight * 0.95) {
        el.classList.add('revealed');
      } else {
        observer.observe(el);
      }
    });

    // Enable progressive reveal animations only AFTER visible elements are already marked .revealed
    document.documentElement.classList.add('js-reveal-ready');

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
