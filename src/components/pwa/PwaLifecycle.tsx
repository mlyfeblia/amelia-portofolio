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
} from '@/lib/pwa-store';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { cn } from '@/lib/utils';

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

  const { showBanner, bannerReason, showIosModal, isIOS, isInstalled } = usePwa();
  const {
    isRendered: isIosModalRendered,
    isExiting: isIosModalExiting,
    backdropClass: iosBackdropClass,
    windowClass: iosWindowClass,
  } = useModalAnimation({ isOpen: showIosModal });

  const [updateWaiting, setUpdateWaiting] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  // Initialize PWA store & lifecycle listeners
  useEffect(() => {
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

  // Handle Service Worker registration updates
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

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
    });

    if (window.serwist !== undefined) {
      window.serwist.addEventListener('waiting', () => {
        setUpdateWaiting(true);
      });
    }
  }, []);

  const handleApplyUpdate = useCallback(() => {
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
            'Pasang aplikasi Amelia di layar utama ponsel Anda agar ruang konseling dan curhat selalu siap diakses kapan pun Anda butuhkan.',
        };
      case 'returning':
        return {
          title: 'Akses Cepat Aplikasi Amelia',
          description:
            'Akses langsung bimbingan konseling sebaya, curhat anonim, dan artikel refleksi dari beranda layar Anda—bahkan saat offline.',
        };
      case 'first-visit':
      default:
        return {
          title: 'Pasang Aplikasi Amelia',
          description:
            'Dapatkan pengalaman konseling yang lebih tenang dan bebas kuota dengan memasang aplikasi web resmi Amelia di perangkat Anda.',
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
              Koneksi internet Anda telah pulih. Halaman dan data tersinkronisasi.
            </p>
          </div>
        </aside>
      )}

      {/* ── SW Update Available Banner ────────────────────────────── */}
      {updateWaiting && (
        <aside
          role="alert"
          aria-live="assertive"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white text-[var(--color-ink)] p-4 rounded-2xl shadow-2xl border border-[var(--color-paper-border)] flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] shrink-0">
              <RefreshCw className="w-5 h-5 animate-spin" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-sm font-semibold text-[var(--color-ink)]">
                Pembaruan Siap Digunakan
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                Versi terbaru dari portofolio Amelia telah tersedia. Muat ulang untuk menerapkan pembaruan.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-[var(--color-paper-border)]">
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

      {/* ── Smart PWA Install Prompt Banner ────────────────────────── */}
      {showBanner && !isInstalled && !updateWaiting && (
        <aside
          role="dialog"
          aria-label={bannerContent.title}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white text-[var(--color-ink)] p-5 rounded-2xl shadow-2xl border border-[var(--color-paper-border)] animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start gap-3.5">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-xs border border-[var(--color-paper-border)] bg-[#f7f2eb]">
              <Image
                src="/icons/icon-192x192.png"
                alt="Logo Amelia"
                width={48}
                height={48}
                priority
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 pr-3">
              <h3 className="font-display text-base font-semibold text-[var(--color-ink)] leading-snug">
                {bannerContent.title}
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed mt-1">
                {bannerContent.description}
              </p>
            </div>
            <button
              type="button"
              onClick={dismissPwaBanner}
              className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Tutup saran pemasangan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2.5 mt-4 pt-3 border-t border-[var(--color-paper-border)]">
            <button
              type="button"
              onClick={dismissPwaBanner}
              className="px-3.5 py-2 text-xs font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
            >
              Nanti Saja
            </button>
            <button
              type="button"
              onClick={() => triggerPwaInstall()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-medium hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              {isIOS ? (
                <>
                  <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Petunjuk Pasang di iPhone</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Pasang Aplikasi</span>
                </>
              )}
            </button>
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
          {/* Dedicated full-viewport backdrop with strong blur, scroll blocked */}
          <div
            className={cn(
              'fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity touch-none select-none',
              iosBackdropClass
            )}
            aria-hidden="true"
            onClick={() => !isIosModalExiting && closeIosModal()}
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
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-[var(--color-paper-border)] bg-[#f7f2eb] shrink-0">
                  <Image
                    src="/icons/icon-192x192.png"
                    alt="Logo Amelia"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
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
                    Ketuk <strong>Tambah</strong> di sudut kanan atas. Selesai! Ikon aplikasi Amelia akan langsung terpasang di beranda HP Anda.
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
