'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import Image from 'next/image';

function subscribeStandalone(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const media =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(display-mode: standalone)')
      : null;
  media?.addEventListener('change', callback);
  return () => {
    media?.removeEventListener('change', callback);
  };
}

function getStandaloneSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (sessionStorage.getItem('amelia_pwa_splash_shown')) return false;
  } catch {
    return false;
  }
  const isStandalone =
    (typeof window.matchMedia === 'function' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches)) ||
    Boolean((navigator as unknown as { standalone?: boolean }).standalone) ||
    document.referrer.includes('android-app://');
  return isStandalone;
}

function getStandaloneServerSnapshot(): boolean {
  return false;
}

export default function PwaSplashScreen() {
  const isEligible = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot
  );
  const [isDismissed, setIsDismissed] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isEligible) return;

    try {
      sessionStorage.setItem('amelia_pwa_splash_shown', 'true');
    } catch {
      // Ignore
    }

    // Smooth sequence: display calm welcome for ~950ms, then smoothly dissolve
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 950);

    const dismissTimer = setTimeout(() => {
      setIsDismissed(true);
    }, 1500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(dismissTimer);
    };
  }, [isEligible]);

  if (!isEligible || isDismissed) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] bg-[#FBF9F5] flex flex-col items-center justify-between p-6 sm:p-8 select-none transition-all duration-500 ease-out ${
        isFadingOut ? 'opacity-0 scale-102 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Top subtle decorative accent */}
      <div className="w-full flex justify-center pt-8 sm:pt-12 opacity-30">
        <div className="w-12 h-1 rounded-full bg-[var(--color-accent)]" />
      </div>

      {/* Center Brand Identity */}
      <div className="flex flex-col items-center text-center max-w-xs animate-in fade-in zoom-in-95 duration-500">
        {/* Circular Emblem with delicate soft shadow and paper border */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-white shadow-md border border-[var(--color-paper-border)] mb-5">
          <div className="w-full h-full rounded-full overflow-hidden bg-[#FAF0E6] flex items-center justify-center">
            <Image
              src="/icons/icon-192x192.png"
              alt="Logo Amelia"
              width={96}
              height={96}
              priority
              unoptimized
              decoding="sync"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <h1
          className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)] tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Amelia
        </h1>

        <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[var(--color-accent)] mt-1.5">
          Bimbingan Konseling Islam
        </p>

        <p className="text-xs text-[var(--color-ink-muted)] mt-3 leading-relaxed italic max-w-[240px]">
          &ldquo;Menemani setiap langkah menuju ketenangan hati.&rdquo;
        </p>

        {/* Minimal loading indicator bar */}
        <div className="w-32 h-0.5 bg-[var(--color-paper-border)] rounded-full overflow-hidden mt-7">
          <div className="h-full bg-[var(--color-accent)] rounded-full w-full animate-pulse" />
        </div>
      </div>

      {/* Bottom university credential */}
      <div className="text-center pb-6 sm:pb-8 opacity-60">
        <p className="text-[10px] text-[var(--color-ink-muted)] tracking-wide font-medium">
          UIN Siber Syekh Nurjati Cirebon
        </p>
      </div>
    </div>
  );
}
