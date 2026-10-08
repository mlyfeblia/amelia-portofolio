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
  showChangelogModal: boolean;
  showBrowserGuideModal: boolean;
  showInstalledInfoModal: boolean;
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
  showChangelogModal: false,
  showBrowserGuideModal: false,
  showInstalledInfoModal: false,
  visitCount: 1,
};

let currentState: PwaState = { ...SERVER_SNAPSHOT };
const listeners = new Set<() => void>();

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let initialized = false;
let bannerScheduled = false;
let bannerTimer: ReturnType<typeof setTimeout> | null = null;

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
      showBrowserGuideModal: false,
      showInstalledInfoModal: false,
    });
    try {
      localStorage.setItem('amelia_pwa_installed', 'true');
      localStorage.removeItem('amelia_pwa_dismissed_at');
    } catch {
      // Ignore
    }
  });

  // Cross-tab synchronization via storage event
  window.addEventListener('storage', (e) => {
    if (e.key === 'amelia_pwa_installed' && e.newValue === 'true') {
      deferredPrompt = null;
      updateState({
        isInstalled: true,
        canInstall: false,
        showBanner: false,
        showIosModal: false,
        showBrowserGuideModal: false,
        showInstalledInfoModal: false,
      });
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
  let isDismissedInSession = false;
  const now = Date.now();

  try {
    isDismissedInSession = sessionStorage.getItem('amelia_pwa_dismissed_session') === 'true';

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

    // Clean dismissal handling: 2 days cooldown on dismissal, 7 days if dismissed >= 3 times
    const cooldownDuration = (dismissCount >= 3 ? 7 : 2) * 24 * 60 * 60 * 1000;
    if (dismissedAt > 0 && now - dismissedAt < cooldownDuration) {
      isCooldown = true;
    }
  } catch {
    // Fallback for private mode
  }

  let isInstalledEffective = isStandalone;
  try {
    if (localStorage.getItem('amelia_pwa_installed') === 'true') {
      isInstalledEffective = true;
    }
  } catch {}

  updateState({
    isInstalled: isInstalledEffective,
    isStandalone,
    isIOS,
    canInstall: isIOS && !isInstalledEffective,
    visitCount,
  });

  const isIntentionalInstall =
    window.location.search.includes('install=1') ||
    window.location.search.includes('pwa=1');

  // Helper to schedule smart banner display politely without ever triggering on scroll
  const scheduleSmartBanner = () => {
    if (currentState.isInstalled || currentState.isStandalone) return;
    if (bannerScheduled || currentState.showBanner) return;
    if (isDismissedInSession && !isIntentionalInstall) return;
    if (isCooldown && !isIntentionalInstall) return;

    bannerScheduled = true;

    if (isIntentionalInstall) {
      updateState({ bannerReason: 'first-visit' });
      setTimeout(() => updateState({ showBanner: true }), 300);
      return;
    }

    // Gentle, non-intrusive delays - 6s initial visit, 5s returning, 4s hiatus
    const delay = isHiatus ? 4000 : visitCount >= 2 ? 5000 : 6000;
    const reason: PwaBannerReason = isHiatus ? 'hiatus' : visitCount >= 2 ? 'returning' : 'first-visit';

    if (bannerTimer) clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => {
      try {
        if (sessionStorage.getItem('amelia_pwa_dismissed_session') === 'true') return;
      } catch {
        // Ignore
      }
      if (!currentState.isInstalled && !currentState.isStandalone) {
        updateState({ bannerReason: reason, showBanner: true });
      }
    }, delay);
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
      showBrowserGuideModal: false,
      showInstalledInfoModal: false,
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
    } else if (!isCooldown && !isDismissedInSession) {
      scheduleSmartBanner();
    }
  }
}

/**
 * Trigger PWA installation or show iOS guide
 */
export async function triggerPwaInstall(): Promise<'accepted' | 'dismissed' | 'ios' | 'installed' | 'guide'> {
  if (currentState.isInstalled) {
    updateState({ showInstalledInfoModal: true });
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
      try {
        localStorage.setItem('amelia_pwa_installed', 'true');
      } catch {}
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

  // If on Android / Desktop / other browsers where native prompt is unavailable or already dismissed,
  // open the universal browser guide modal so user gets clear 3-step visual instructions!
  updateState({ showBanner: false, showBrowserGuideModal: true });
  return 'guide';
}

/**
 * Dismiss banner and activate cooldown in localStorage
 */
export function dismissPwaBanner() {
  if (bannerTimer) {
    clearTimeout(bannerTimer);
    bannerTimer = null;
  }
  updateState({ showBanner: false });
  try {
    sessionStorage.setItem('amelia_pwa_dismissed_session', 'true');
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

export function openBrowserGuideModal() {
  updateState({ showBrowserGuideModal: true });
}

export function closeBrowserGuideModal() {
  updateState({ showBrowserGuideModal: false });
}

export function openInstalledInfoModal() {
  updateState({ showInstalledInfoModal: true });
}

export function closeInstalledInfoModal() {
  updateState({ showInstalledInfoModal: false });
}

export function openChangelogModal() {
  updateState({ showChangelogModal: true });
}

export function closeChangelogModal() {
  updateState({ showChangelogModal: false });
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
