'use client';

import { useSyncExternalStore } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type PwaBannerReason = 'first-visit' | 'returning' | 'hiatus' | 'none';

export interface PwaState {
  isInstalled: boolean;
  canInstall: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  showBanner: boolean;
  bannerReason: PwaBannerReason;
  showIosModal: boolean;
  visitCount: number;
}

const SERVER_SNAPSHOT: PwaState = {
  isInstalled: false,
  canInstall: false,
  isIOS: false,
  isStandalone: false,
  showBanner: false,
  bannerReason: 'none',
  showIosModal: false,
  visitCount: 1,
};

let currentState: PwaState = { ...SERVER_SNAPSHOT };
const listeners = new Set<() => void>();

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let initialized = false;
let scrollListenerActive = false;

// Early capture of install prompt in case it fires before component mount
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    updateState({ canInstall: true });
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    updateState({
      isInstalled: true,
      canInstall: false,
      showBanner: false,
      showIosModal: false,
    });
    try {
      localStorage.removeItem('amelia_pwa_dismissed_at');
    } catch {
      // Ignore
    }
  });
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function updateState(partial: Partial<PwaState>) {
  currentState = { ...currentState, ...partial };
  emitChange();
}

/**
 * Initialize visitor metrics and PWA listeners (Runs once in client)
 */
export function initPwa() {
  if (typeof window === 'undefined' || initialized) return;
  initialized = true;

  const isStandalone =
    (typeof window.matchMedia === 'function' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches)) ||
    Boolean((navigator as unknown as { standalone?: boolean }).standalone) ||
    document.referrer.includes('android-app://');

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !Boolean((window as unknown as { MSStream?: unknown }).MSStream);

  let visitCount = 1;
  let isHiatus = false;
  let isCooldown = false;
  const now = Date.now();

  try {
    const rawVisits = localStorage.getItem('amelia_pwa_visits');
    const rawLastVisit = localStorage.getItem('amelia_pwa_last_visit');
    const rawDismissedAt = localStorage.getItem('amelia_pwa_dismissed_at');
    const rawDismissCount = localStorage.getItem('amelia_pwa_dismiss_count');

    const previousVisits = rawVisits ? parseInt(rawVisits, 10) : 0;
    const lastVisit = rawLastVisit ? parseInt(rawLastVisit, 10) : 0;
    const dismissedAt = rawDismissedAt ? parseInt(rawDismissedAt, 10) : 0;
    const dismissCount = rawDismissCount ? parseInt(rawDismissCount, 10) : 0;

    // Track session visits
    if (!sessionStorage.getItem('amelia_pwa_session')) {
      sessionStorage.setItem('amelia_pwa_session', 'active');
      visitCount = previousVisits + 1;
      localStorage.setItem('amelia_pwa_visits', visitCount.toString());
      localStorage.setItem('amelia_pwa_last_visit', now.toString());

      // Hiatus check: returned after > 14 days
      if (lastVisit > 0 && now - lastVisit > 14 * 24 * 60 * 60 * 1000) {
        isHiatus = true;
      }
    } else {
      visitCount = Math.max(previousVisits, 1);
    }

    // Cooldown check: 14 days if dismissed >= 2 times, otherwise 7 days
    const cooldownDuration = (dismissCount >= 2 ? 14 : 7) * 24 * 60 * 60 * 1000;
    if (dismissedAt > 0 && now - dismissedAt < cooldownDuration) {
      isCooldown = true;
    }
  } catch {
    // Fallback for private mode
  }

  updateState({
    isInstalled: isStandalone,
    isStandalone,
    isIOS,
    canInstall: isIOS && !isStandalone,
    visitCount,
  });

  const isIntentionalInstall =
    window.location.search.includes('install=1') ||
    window.location.search.includes('pwa=1');

  // Helper to schedule smart banner display
  const scheduleSmartBanner = () => {
    if (currentState.isInstalled) return;
    if (isCooldown && !isIntentionalInstall) return;

    if (isIntentionalInstall) {
      updateState({ bannerReason: 'first-visit' });
      setTimeout(() => updateState({ showBanner: true }), 300);
      return;
    }

    if (isHiatus) {
      updateState({ bannerReason: 'hiatus' });
      setTimeout(() => updateState({ showBanner: true }), 4000);
    } else if (visitCount >= 2) {
      updateState({ bannerReason: 'returning' });
      setTimeout(() => updateState({ showBanner: true }), 5000);
    } else {
      // First visit: gentle trigger after reading 25s OR scrolling > 35%
      updateState({ bannerReason: 'first-visit' });

      const timer = setTimeout(() => {
        updateState({ showBanner: true });
        cleanupScroll();
      }, 25000);

      const handleScroll = () => {
        const docElem = document.documentElement;
        const totalHeight = docElem.scrollHeight - window.innerHeight;
        if (totalHeight > 0 && window.scrollY / totalHeight >= 0.35) {
          clearTimeout(timer);
          updateState({ showBanner: true });
          cleanupScroll();
        }
      };

      const cleanupScroll = () => {
        if (scrollListenerActive) {
          window.removeEventListener('scroll', handleScroll);
          scrollListenerActive = false;
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      scrollListenerActive = true;
    }
  };

  // Chromium beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    updateState({ canInstall: true });
    scheduleSmartBanner();
  });

  if (deferredPrompt) {
    scheduleSmartBanner();
  }

  // App installed event
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    updateState({
      isInstalled: true,
      canInstall: false,
      showBanner: false,
      showIosModal: false,
    });
    try {
      localStorage.removeItem('amelia_pwa_dismissed_at');
    } catch {
      // Ignore
    }
  });

  // For iOS devices: trigger smart banner or guide modal if intentional
  if (isIOS && !isStandalone) {
    if (isIntentionalInstall) {
      setTimeout(() => updateState({ showIosModal: true }), 600);
    } else if (!isCooldown) {
      scheduleSmartBanner();
    }
  }
}

/**
 * Trigger PWA installation or show iOS guide
 */
export async function triggerPwaInstall(): Promise<'accepted' | 'dismissed' | 'ios' | 'installed' | 'unsupported'> {
  if (currentState.isInstalled) {
    return 'installed';
  }

  if (deferredPrompt) {
    updateState({ showBanner: false });
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      deferredPrompt = null;
      updateState({
        isInstalled: true,
        canInstall: false,
        showBanner: false,
      });
      return 'accepted';
    } else {
      dismissPwaBanner();
      return 'dismissed';
    }
  }

  if (currentState.isIOS) {
    updateState({ showBanner: false, showIosModal: true });
    return 'ios';
  }

  // If on desktop without beforeinstallprompt, smooth scroll to showcase section or redirect
  if (typeof window !== 'undefined') {
    const showcaseSection = document.getElementById('app-showcase');
    if (showcaseSection) {
      showcaseSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return 'unsupported';
}

/**
 * Dismiss banner and activate cooldown in localStorage
 */
export function dismissPwaBanner() {
  updateState({ showBanner: false });
  try {
    const rawDismissCount = localStorage.getItem('amelia_pwa_dismiss_count');
    const currentCount = rawDismissCount ? parseInt(rawDismissCount, 10) : 0;
    localStorage.setItem('amelia_pwa_dismissed_at', Date.now().toString());
    localStorage.setItem('amelia_pwa_dismiss_count', (currentCount + 1).toString());
  } catch {
    // Ignore
  }
}

export function openIosModal() {
  updateState({ showIosModal: true });
}

export function closeIosModal() {
  updateState({ showIosModal: false });
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): PwaState {
  return currentState;
}

function getServerSnapshot(): PwaState {
  return SERVER_SNAPSHOT;
}

/**
 * React hook to access reactive PWA state across any component
 */
export function usePwa(): PwaState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
