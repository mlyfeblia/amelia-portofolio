'use client';

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Download, RefreshCw, WifiOff, Wifi, X, Share2, PlusSquare, CheckCircle2 } from 'lucide-react';
import {
  initPwa,
  usePwa,
  triggerPwaInstall,
  dismissPwaBanner,
  closeIosModal,
  closeBrowserGuideModal,
  closeInstalledInfoModal,
  openChangelogModal,
  closeChangelogModal,
} from '@/lib/pwa-store';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { cn } from '@/lib/utils';
import { PwaChangelogModal } from '@/components/pwa/PwaChangelogModal';
import { PwaBrowserGuideModal } from '@/components/pwa/PwaBrowserGuideModal';
import { PwaInstalledInfoModal } from '@/components/pwa/PwaInstalledInfoModal';
import { NotificationPromptModal } from '@/components/pwa/NotificationPromptModal';
import {
  isNotificationSupported,
  getNotificationPermission,
  NOTIFICATION_PROMPT_EVENT,
} from '@/lib/notifications';
import { CURRENT_APP_VERSION, getLatestRelease } from '@/data/app-version';
import { initOfflineQueueSync } from '@/lib/offline-queue';

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getOnlineServerSnapshot() {
  return true;
}

export default function PwaLifecycle() {
  const isOnline = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getOnlineServerSnapshot);
  const isOffline = !isOnline;
  const iosModalRef = useRef<HTMLDivElement>(null);

  const {
    showBanner,
    bannerReason,
    showIosModal,
    showChangelogModal,
    showBrowserGuideModal,
    showInstalledInfoModal,
    isIOS,
    isInstalled,
  } = usePwa();
  const {
    isRendered: isIosModalRendered,
    backdropClass: iosBackdropClass,
    windowClass: iosWindowClass,
  } = useModalAnimation({
    isOpen: showIosModal,
    onClose: closeIosModal,
    closeOnEscape: true,
    lockScroll: true,
    containerRef: iosModalRef,
  });

  const [updateWaiting, setUpdateWaiting] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const [isApplyingUpdate, setIsApplyingUpdate] = useState(false);
  const [remoteVersion, setRemoteVersion] = useState<string | null>(null);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [onlineToastMessage, setOnlineToastMessage] = useState<string | null>(null);
  const [isSuppressed, setIsSuppressed] = useState(false);
  const [showNotificationPromptModal, setShowNotificationPromptModal] = useState(false);
  const latestRelease = getLatestRelease();

  // Suppress floating banner when user is near footer or looking at #app-showcase
  useEffect(() => {
    if (!showBanner) return;

    let ticking = false;
    const checkSuppression = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const doc = document.documentElement;
          const scrollBottom = doc.scrollHeight - (window.scrollY + window.innerHeight);
          const isNearBottom = scrollBottom < 260; // near footer

          const showcaseElem = document.getElementById('app-showcase');
          let isShowcaseVisible = false;
          if (showcaseElem) {
            const rect = showcaseElem.getBoundingClientRect();
            isShowcaseVisible = rect.top < window.innerHeight && rect.bottom > 0;
          }

          setIsSuppressed(isNearBottom || isShowcaseVisible);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', checkSuppression, { passive: true });
    window.addEventListener('resize', checkSuppression, { passive: true });
    checkSuppression();

    return () => {
      window.removeEventListener('scroll', checkSuppression);
      window.removeEventListener('resize', checkSuppression);
    };
  }, [showBanner]);

  // Initialize PWA store & lifecycle listeners
  useEffect(() => {
    // In development on localhost, unregister any stale production service workers and clear cache storage
    // so Turbopack/development assets never conflict with cached production HTML (eliminates hydration mismatches)
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      });
      if ('caches' in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        });
      }
    }

    initPwa();
    const cleanupQueue = initOfflineQueueSync();
    return () => {
      cleanupQueue();
    };
  }, []);



  // Show a temporary "Back Online" toast when the 'online' event or offline-queue sync fires
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timer: NodeJS.Timeout;

    const handleOnlineEvent = () => {
      setOnlineToastMessage(null);
      setShowOnlineToast(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShowOnlineToast(false), 4000);
    };

    const handleCustomToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string }>;
      if (customEvent.detail?.message) {
        setOnlineToastMessage(customEvent.detail.message);
        setShowOnlineToast(true);
        clearTimeout(timer);
        timer = setTimeout(() => setShowOnlineToast(false), 5000);
      }
    };

    const handleOfflineEvent = () => {
      setShowOnlineToast(false);
    };

    window.addEventListener('online', handleOnlineEvent);
    window.addEventListener('offline', handleOfflineEvent);
    window.addEventListener('amelia:show-toast', handleCustomToast);

    // If user just completed an update reload, display confirmation toast
    try {
      if (sessionStorage.getItem('amel_just_updated') === '1') {
        sessionStorage.removeItem('amel_just_updated');
        timer = setTimeout(() => {
          setOnlineToastMessage(`Aplikasi berhasil diperbarui ke versi terbaru (v${CURRENT_APP_VERSION}).`);
          setShowOnlineToast(true);
          timer = setTimeout(() => setShowOnlineToast(false), 4500);
        }, 0);
      }
    } catch {
      // Ignore storage errors
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleOnlineEvent);
      window.removeEventListener('offline', handleOfflineEvent);
      window.removeEventListener('amelia:show-toast', handleCustomToast);
    };
  }, []);

  // Listen for explicit custom event triggers for NotificationPromptModal
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOpenNotifPrompt = () => {
      setShowNotificationPromptModal(true);
    };

    window.addEventListener(NOTIFICATION_PROMPT_EVENT, handleOpenNotifPrompt);
    return () => {
      window.removeEventListener(NOTIFICATION_PROMPT_EVENT, handleOpenNotifPrompt);
    };
  }, []);

  // Politely trigger notification prompt in standalone PWA mode if not yet granted or dismissed recently
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      if (!isNotificationSupported()) return;
      if (getNotificationPermission() !== 'default') return;

      try {
        const dismissedAt = localStorage.getItem('amelia_notif_prompt_dismissed');
        if (dismissedAt) {
          const elapsed = Date.now() - parseInt(dismissedAt, 10);
          // 3-day cooldown
          if (elapsed < 3 * 24 * 60 * 60 * 1000) return;
        }

        if (
          isInstalled ||
          (typeof window.matchMedia === 'function' &&
            window.matchMedia('(display-mode: standalone)').matches)
        ) {
          setShowNotificationPromptModal(true);
        }
      } catch {
        // Ignore
      }
    }, 4500);

    return () => clearTimeout(timer);
  }, [isInstalled]);

  // Handle Service Worker registration updates & periodic version checks
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Sync localStorage version to the currently running bundle version so we don't show a false-positive
    // update banner when the browser has already loaded the latest bundle.
    try {
      const storedVersion = localStorage.getItem('amel_app_version');
      if (storedVersion !== CURRENT_APP_VERSION) {
        localStorage.setItem('amel_app_version', CURRENT_APP_VERSION);
      }
    } catch {
      // Ignore
    }

    const checkRemoteVersion = () => {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
      fetch('/api/version', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.version && typeof data.version === 'string' && data.version !== CURRENT_APP_VERSION) {
            setRemoteVersion(data.version);
            setUpdateDismissed(false);
            setUpdateWaiting(true);
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistration().then((reg) => {
                reg?.update().catch(() => {});
              });
            }
          }
        })
        .catch(() => {});
    };

    if (!('serviceWorker' in navigator)) {
      return;
    }

    let updateInterval: NodeJS.Timeout;

    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setUpdateWaiting(true);
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setUpdateDismissed(false);
            setUpdateWaiting(true);
          }
        });
      });

      // Periodically check for SW updates and remote version every 20 minutes
      updateInterval = setInterval(() => {
        registration.update().catch(() => {});
        checkRemoteVersion();
      }, 20 * 60 * 1000);
    });

    if (window.serwist !== undefined) {
      window.serwist.addEventListener('waiting', () => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration().then((reg) => {
            if (reg?.waiting) setWaitingWorker(reg.waiting);
          });
        }
        setUpdateDismissed(false);
        setUpdateWaiting(true);
      });
    }

    // Automatically check for updates when returning to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkRemoteVersion();
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.update().catch(() => {});
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(updateInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleApplyUpdate = useCallback(() => {
    if (isApplyingUpdate) return;
    setIsApplyingUpdate(true);

    try {
      localStorage.setItem('amel_app_version', remoteVersion || CURRENT_APP_VERSION);
      sessionStorage.setItem('amel_just_updated', '1');
    } catch {
      // Ignore
    }

    let reloaded = false;
    const performReload = () => {
      if (reloaded) return;
      reloaded = true;
      setUpdateWaiting(false);
      setUpdateDismissed(true);
      window.location.reload();
    };

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', performReload, { once: true });
    }

    // Clear cached HTML documents so the reload fetches fresh server HTML
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.delete('amelia-pages-cache').catch(() => {});
    }

    // Trigger SKIP_WAITING on waiting worker (from state, live registration, or Serwist)
    if (waitingWorker) {
      try {
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      } catch {
        // Ignore
      }
    }

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistration()
        .then((reg) => {
          if (reg?.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          } else {
            reg?.update().catch(() => {});
          }
        })
        .catch(() => {});
    }

    if (typeof window !== 'undefined' && window.serwist !== undefined && typeof window.serwist.messageSkipWaiting === 'function') {
      try {
        window.serwist.messageSkipWaiting();
      } catch {
        // Ignore
      }
    }

    // Guaranteed fallback reload if controllerchange does not fire within 450ms
    setTimeout(performReload, 450);
  }, [waitingWorker, isApplyingUpdate, remoteVersion]);

  // Contextual copy based on smart visitor frequency scenario
  const getBannerContent = () => {
    switch (bannerReason) {
      case 'hiatus':
        return {
          title: 'Senang Bertemu Kembali!',
          description:
            'Pasang aplikasi Amelia di layar utama ponselmu agar ruang konseling dan curhat selalu siap diakses kapan pun kamu butuhkan.',
        };
      case 'returning':
        return {
          title: 'Akses Cepat Aplikasi Amelia',
          description:
            'Akses langsung bimbingan konseling sebaya, curhat anonim, dan artikel refleksi dari beranda layarmu, bahkan saat offline.',
        };
      case 'first-visit':
      default:
        return {
          title: 'Pasang Aplikasi Amelia',
          description:
            'Dapatkan pengalaman konseling yang lebih tenang dan bebas kuota dengan memasang aplikasi web resmi Amelia di perangkatmu.',
        };
    }
  };

  const bannerContent = getBannerContent();

  return (
    <>
      {/* ── Offline Banner ────────────────────────────────────────── */}
      {isOffline && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[var(--color-ink)] text-white p-4 rounded-2xl shadow-xl border border-white/10 flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <WifiOff className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">Mode Offline</p>
            <p className="text-xs text-white/80 line-clamp-2 mt-0.5">
              Koneksi terputus. Konten yang telah dibuka tetap dapat dibaca secara mandiri.
            </p>
          </div>
        </aside>
      )}

      {/* ── Back Online Toast ──────────────────────────────────────── */}
      {showOnlineToast && !isOffline && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[var(--color-accent)] text-white p-4 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="p-2 rounded-xl bg-white/20 text-white shrink-0">
            <Wifi className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">Kembali Terhubung</p>
            <p className="text-xs text-white/90 mt-0.5">
              {onlineToastMessage || 'Koneksi internetmu sudah pulih. Halaman dan data tersinkronisasi rapi.'}
            </p>
          </div>
        </aside>
      )}

      {/* ── PWA Version Changelog Modal ──────────────────────────── */}
      <PwaChangelogModal isOpen={showChangelogModal} onClose={closeChangelogModal} />

      {/* ── Browser / Android PWA Installation Guide Modal ──────────── */}
      <PwaBrowserGuideModal isOpen={showBrowserGuideModal} onClose={closeBrowserGuideModal} />

      {/* ── PWA Installed Status & System Info Modal ───────────────── */}
      <PwaInstalledInfoModal isOpen={showInstalledInfoModal} onClose={closeInstalledInfoModal} />

      {/* ── Web & PWA Browser Notification Prompt Modal ────────────── */}
      <NotificationPromptModal
        isOpen={showNotificationPromptModal}
        onClose={() => setShowNotificationPromptModal(false)}
      />

      {/* ── SW Update Available Banner with Changelog Preview ─────── */}
      {updateWaiting && !updateDismissed && (
        <aside
          role="alert"
          aria-live="assertive"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white text-[var(--color-ink)] p-4 sm:p-5 rounded-2xl shadow-2xl border border-[var(--color-paper-border)] flex flex-col gap-3.5 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] shrink-0">
              <RefreshCw className="w-5 h-5 animate-spin" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[var(--color-accent)] text-white">
                  v{remoteVersion || CURRENT_APP_VERSION}
                </span>
                <span className="text-xs font-semibold text-[var(--color-ink)]">
                  Pembaruan Baru Tersedia
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[var(--color-ink)] mt-1 leading-snug line-clamp-2">
                {latestRelease.title}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setUpdateDismissed(true);
                setUpdateWaiting(false);
                try {
                  localStorage.setItem('amel_app_version', remoteVersion || CURRENT_APP_VERSION);
                } catch {
                  // Ignore
                }
              }}
              className="p-1 rounded-lg text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors cursor-pointer"
              aria-label="Tutup pemberitahuan pembaruan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Key highlights preview (top 3) */}
          <div className="p-3 bg-[var(--color-paper)] rounded-xl border border-[var(--color-paper-border)]/70 space-y-1.5 text-xs text-[var(--color-ink-muted)]">
            <p className="font-semibold text-[11px] text-[var(--color-ink)] uppercase tracking-wider">
              Apa yang baru di versi ini:
            </p>
            <ul className="space-y-1.5" role="list">
              {latestRelease.highlights.slice(0, 3).map((item, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--color-paper-border)]">
            <button
              type="button"
              onClick={() => openChangelogModal()}
              className="text-xs font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors cursor-pointer underline underline-offset-2"
            >
              Lihat Catatan Lengkap
            </button>
            <button
              type="button"
              disabled={isApplyingUpdate}
              onClick={handleApplyUpdate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-medium hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer active:scale-95 shadow-xs disabled:opacity-70"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isApplyingUpdate && 'animate-spin')} aria-hidden="true" />
              <span>{isApplyingUpdate ? 'Memperbarui...' : 'Perbarui Sekarang'}</span>
            </button>
          </div>
        </aside>
      )}

      {/* ── Smart PWA Install Prompt Banner (Polite, Compact, Mobile-Ergonomic) ── */}
      {showBanner && !isInstalled && !updateWaiting && (
        <aside
          role="dialog"
          aria-label={bannerContent.title}
          className={cn(
            'fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-40 transition-all duration-300 ease-out',
            isSuppressed
              ? 'opacity-0 translate-y-6 pointer-events-none'
              : 'opacity-100 translate-y-0'
          )}
        >
          <div className="bg-white/95 backdrop-blur-md text-[var(--color-ink)] p-3.5 rounded-2xl shadow-xl border border-[var(--color-paper-border)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 shadow-2xs border border-[var(--color-paper-border)] bg-[#FAF0E6] flex items-center justify-center">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="Logo Amelia"
                  width={40}
                  height={40}
                  priority
                  unoptimized
                  decoding="sync"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xs sm:text-sm font-semibold text-[var(--color-ink)] leading-snug truncate">
                  {bannerContent.title}
                </p>
                <p className="text-[11px] text-[var(--color-ink-muted)] leading-tight truncate mt-0.5">
                  Akses instan &amp; offline di layar utama
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => triggerPwaInstall()}
                className="btn-interactive inline-flex items-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-medium hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer shadow-2xs active:scale-95"
              >
                {isIOS ? (
                  <>
                    <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Pasang</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Pasang</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={dismissPwaBanner}
                className="p-1.5 rounded-lg text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors cursor-pointer"
                aria-label="Tutup saran pemasangan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ── iOS Safari Install Instructions Modal (Portal to body, Fullscreen Backdrop, Scroll Locked) ── */}
      {isIosModalRendered && typeof document !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-modal-title"
          className={cn(
            'fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none',
            !showIosModal && 'pointer-events-none'
          )}
        >
          {/* Dedicated full-viewport backdrop with strong blur, scroll blocked */}
          <div
            className={cn(iosBackdropClass)}
            aria-hidden="true"
            onClick={closeIosModal}
          />

          {/* Modal Container: Centered on all devices */}
          <div
            ref={iosModalRef}
            className={cn(
              'relative z-10 bg-white rounded-3xl max-w-sm sm:max-w-md w-full p-6 shadow-2xl border border-[var(--color-paper-border)] flex flex-col gap-5 max-h-[90dvh] overflow-y-auto modal-scroll-body my-auto',
              iosWindowClass
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden shadow-xs border border-[var(--color-paper-border)] bg-[#FAF0E6] shrink-0 flex items-center justify-center">
                  <Image
                    src="/icons/icon-192x192.png"
                    alt="Logo Amelia"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h2 id="ios-modal-title" className="font-display font-semibold text-base text-[var(--color-ink)]">
                    Pasang di iPhone / iPad
                  </h2>
                  <p className="text-xs text-[var(--color-ink-muted)]">Akses cepat via Safari</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeIosModal}
                className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] p-1.5 rounded-lg transition-colors cursor-pointer"
                aria-label="Tutup petunjuk"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="space-y-3 text-xs sm:text-sm text-[var(--color-ink)]">
              <li className="flex items-start gap-3 bg-[var(--color-paper)] p-3.5 rounded-2xl border border-[var(--color-paper-border)]">
                <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold block text-[var(--color-ink)]">1. Ketuk Tombol Share</span>
                  <span className="text-[var(--color-ink-muted)] text-xs leading-relaxed">
                    Buka halaman ini di Safari, lalu ketuk tombol <strong>Bagikan (Share)</strong> di bilah bawah layar ponsel.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3 bg-[var(--color-paper)] p-3.5 rounded-2xl border border-[var(--color-paper-border)]">
                <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold block text-[var(--color-ink)]">2. Tambahkan ke Layar Utama</span>
                  <span className="text-[var(--color-ink-muted)] text-xs leading-relaxed">
                    Gulir menu ke bawah lalu pilih opsi <strong>Tambahkan ke Layar Utama</strong> (<em>Add to Home Screen</em>).
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3 bg-[var(--color-paper)] p-3.5 rounded-2xl border border-[var(--color-paper-border)]">
                <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold block text-[var(--color-ink)]">3. Ketuk Tambah</span>
                  <span className="text-[var(--color-ink-muted)] text-xs leading-relaxed">
                    Ketuk <strong>Tambah</strong> di sudut kanan atas. Selesai! Ikon aplikasi Amelia akan langsung terpasang di beranda ponselmu.
                  </span>
                </div>
              </li>
            </ol>

            <button
              type="button"
              onClick={closeIosModal}
              className="w-full py-3 rounded-xl bg-[var(--color-accent)] text-white text-xs sm:text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer text-center active:scale-98 shadow-xs"
            >
              Saya Mengerti
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
