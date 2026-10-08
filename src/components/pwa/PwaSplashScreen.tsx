'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import Image from 'next/image';

const SPLASH_STORAGE_KEY = 'amelia_app_splash_shown';
const LEGACY_SPLASH_STORAGE_KEY = 'amelia_pwa_splash_shown';

function subscribeSplash(): () => void {
  return () => {};
}

function getSplashSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (
      sessionStorage.getItem(SPLASH_STORAGE_KEY) ||
      sessionStorage.getItem(LEGACY_SPLASH_STORAGE_KEY)
    ) {
      return false;
    }
  } catch {
    return false;
  }
  return true;
}

function getSplashServerSnapshot(): boolean {
  return false;
}

export default function PwaSplashScreen() {
  const isEligible = useSyncExternalStore(
    subscribeSplash,
    getSplashSnapshot,
    getSplashServerSnapshot
  );
  const [isDismissed, setIsDismissed] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isEligible) return;

    try {
      sessionStorage.setItem(SPLASH_STORAGE_KEY, 'true');
      sessionStorage.setItem(LEGACY_SPLASH_STORAGE_KEY, 'true');
    } catch {
      // Ignore storage restrictions (e.g. strict private mode)
    }

    // 0ms - 1100ms: Calm display with animated progress loading bar (0% -> 100% over 1.1s)
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1100);

    // 1100ms - 1500ms (400ms): Smooth dissolve / fade-out (opacity-0 scale-102 pointer-events-none)
    // 1500ms: Unmounts (setIsDismissed(true))
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
      className={`fixed inset-0 z-[99999] bg-[#FBF9F5] flex flex-col items-center justify-between p-6 sm:p-8 select-none transition-all duration-400 ease-out ${
        isFadingOut ? 'opacity-0 scale-102 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Top subtle decorative accent */}
      <div className="w-full flex justify-center pt-8 sm:pt-12 opacity-30">
        <div className="w-12 h-1 rounded-full bg-[var(--color-accent)]" />
      </div>

      {/* Center Brand Identity */}
      <div className="flex flex-col items-center text-center max-w-xs animate-in fade-in zoom-in-95 duration-500">
        {/* Circular Emblem with delicate soft glow, shadow, and paper border */}
        <div className="relative mb-5">
          <div
            className="absolute -inset-2 rounded-full bg-[var(--color-accent)]/15 blur-lg pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-white shadow-lg border border-[var(--color-paper-border)] flex items-center justify-center">
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

        <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-3 leading-relaxed italic max-w-[260px]">
          &ldquo;Menemani setiap langkah menuju ketenangan hati.&rdquo;
        </p>

        {/* Animated progress loading bar (0% -> 100% over 1.1s) */}
        <div
          role="progressbar"
          aria-label="Memuat aplikasi"
          aria-valuemin={0}
          aria-valuemax={100}
          className="w-36 h-1 bg-[var(--color-paper-border)]/80 rounded-full overflow-hidden mt-7 p-px"
        >
          <div className="h-full bg-[var(--color-accent)] rounded-full w-full splash-progress-bar" />
        </div>
      </div>

      {/* Bottom university credential */}
      <div className="text-center pb-6 sm:pb-8 opacity-70">
        <p className="text-[10px] sm:text-xs text-[var(--color-ink-muted)] tracking-wide font-medium">
          UIN Siber Syekh Nurjati Cirebon
        </p>
      </div>
    </div>
  );
}
