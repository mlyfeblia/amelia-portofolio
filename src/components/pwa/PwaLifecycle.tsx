'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Download, RefreshCw, WifiOff, Wifi, X, Share2, PlusSquare, CheckCircle2 } from 'lucide-react';
import {
  initPwa,
  usePwa,
  triggerPwaInstall,
  dismissPwaBanner,
  closeIosModal,
  openChangelogModal,
  closeChangelogModal,
} from '@/lib/pwa-store';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { cn } from '@/lib/utils';
import PwaSplashScreen from '@/components/pwa/PwaSplashScreen';
import { PwaChangelogModal } from '@/components/pwa/PwaChangelogModal';
import { CURRENT_APP_VERSION, getLatestRelease } from '@/data/app-version';

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

  const { showBanner, bannerReason, showIosModal, showChangelogModal, isIOS, isInstalled } = usePwa();
  const {
    isRendered: isIosModalRendered,
    isExiting: isIosModalExiting,
    backdropClass: iosBackdropClass,
    windowClass: iosWindowClass,
  } = useModalAnimation({ isOpen: showIosModal });

  const [updateWaiting, setUpdateWaiting] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [isSuppressed, setIsSuppressed] = useState(false);
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
  }, []);

  // Close iOS guide modal on Escape key press
  useEffect(() => {
    if (!showIosModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeIosModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showIosModal]);

  // Prevent body & document scrolling when iOS guide modal is open
  useEffect(() => {
    if (!showIosModal) return;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [showIosModal]);

  // Show a temporary "Back Online" toast when the 'online' event fires
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timer: NodeJS.Timeout;

    const handleOnlineEvent = () => {
      setShowOnlineToast(true);
      timer = setTimeout(() => setShowOnlineToast(false), 4000);
    };

    const handleOfflineEvent = () => {
      setShowOnlineToast(false);
    };

    window.addEventListener('online', handleOnlineEvent);
    window.addEventListener('offline', handleOfflineEvent);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleOnlineEvent);
      window.removeEventListener('offline', handleOfflineEvent);
    };
  }, []);

  // Handle Service Worker registration updates & periodic version checks
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check localStorage version against CURRENT_APP_VERSION asynchronously
    const versionCheckTimer = setTimeout(() => {
      try {
        const storedVersion = localStorage.getItem('amel_app_version');
        if (storedVersion && storedVersion !== CURRENT_APP_VERSION) {
          setUpdateWaiting(true);
        }
      } catch {
        // Ignore
      }
    }, 100);

    if (!('serviceWorker' in navigator)) {
      return () => clearTimeout(versionCheckTimer);
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
            setUpdateWaiting(true);
          }
        });
      });

      // Periodically check for SW updates every 20 minutes
      updateInterval = setInterval(() => {
        registration.update().catch(() => {});
      }, 20 * 60 * 1000);
    });

    if (window.serwist !== undefined) {
      window.serwist.addEventListener('waiting', () => {
        setUpdateWaiting(true);
      });
    }

    // Automatically check for updates when returning to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.update().catch(() => {});
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(versionCheckTimer);
      clearInterval(updateInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleApplyUpdate = useCallback(() => {
    try {
      localStorage.setItem('amel_app_version', CURRENT_APP_VERSION);
    } catch {
      // Ignore
    }

    let refreshing = false;
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener(
        'controllerchange',
        () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        },
        { once: true }
      );
    }

    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else if (window.serwist !== undefined && typeof window.serwist.messageSkipWaiting === 'function') {
      window.serwist.messageSkipWaiting();
    } else {
      window.location.reload();
    }
  }, [waitingWorker]);

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
      {/* ── Native Standalone PWA Welcome Splash Screen ────────────── */}
      <PwaSplashScreen />

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
              Koneksi internetmu sudah pulih. Halaman dan data tersinkronisasi rapi.
            </p>
          </div>
        </aside>
      )}

      {/* ── PWA Version Changelog Modal ──────────────────────────── */}
      <PwaChangelogModal isOpen={showChangelogModal} onClose={closeChangelogModal} />

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
                  v{CURRENT_APP_VERSION}
                </span>
                <span className="text-xs font-semibold text-[var(--color-ink)]">
                  Pembaruan Baru Tersedia
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-[var(--color-ink)] mt-1 leading-snug line-clamp-2">
                {latestRelease.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setUpdateDismissed(true)}
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
              onClick={handleApplyUpdate}
              className="px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-medium hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer active:scale-95 shadow-xs"
            >
              Perbarui Sekarang
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
                <h3 className="font-display text-xs sm:text-sm font-semibold text-[var(--color-ink)] leading-snug truncate">
                  {bannerContent.title}
                </h3>
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
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Dedicated full-viewport backdrop with strong blur, scroll blocked - Cannot Be Dismissed By Touching Backdrop */}
          <div
            className={cn(
              'fixed inset-0 bg-transparent backdrop-blur-md touch-none select-none pointer-events-auto',
              iosBackdropClass
            )}
            aria-hidden="true"
            onWheel={(e) => e.preventDefault()}
            onTouchMove={(e) => e.preventDefault()}
          />

          {/* Modal Container: Centered on all devices */}
          <div
            className={cn(
              'relative z-10 bg-white rounded-3xl max-w-sm sm:max-w-md w-full p-6 shadow-2xl border border-[var(--color-paper-border)] flex flex-col gap-5 max-h-[90dvh] overflow-y-auto my-auto',
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
                  <h3 id="ios-modal-title" className="font-display font-semibold text-base text-[var(--color-ink)]">
                    Pasang di iPhone / iPad
                  </h3>
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
