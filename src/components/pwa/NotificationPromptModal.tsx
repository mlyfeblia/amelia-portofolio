'use client';

import React, { useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, ShieldCheck, X, Clock, HeartHandshake, BookOpen } from 'lucide-react';
import {
  requestNotificationPermission,
  dispatchLocalNotification,
} from '@/lib/notifications';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { cn } from '@/lib/utils';

interface NotificationPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPromptModal({ isOpen, onClose }: NotificationPromptModalProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem('amelia_notif_prompt_dismissed', Date.now().toString());
    } catch {
      // Ignore in private browsing mode
    }
    onClose();
  }, [onClose]);

  const { isRendered, isExiting, backdropClass, windowClass } = useModalAnimation({
    isOpen,
    onClose: handleDismiss,
    closeOnEscape: true,
    lockScroll: true,
    containerRef: windowRef,
  });

  const handleEnable = async () => {
    setIsRequesting(true);
    // Langsung tutup modal agar tidak menggantung di layar saat prompt notifikasi browser muncul
    onClose();
    try {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        dispatchLocalNotification('Ruang Aman Amelia Aktif', {
          body: 'Terima kasih telah mengaktifkan notifikasi konseling.',
        }).catch(() => {});
      } else {
        try {
          localStorage.setItem('amelia_notif_prompt_dismissed', Date.now().toString());
        } catch {
          // Ignore
        }
      }
    } catch {
      // Ignore
    } finally {
      setIsRequesting(false);
    }
  };

  if (!isRendered || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-modal-title"
      aria-describedby="notification-modal-desc"
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none',
        isExiting && 'pointer-events-none'
      )}
    >
      {/* Backdrop with frosted glass effect */}
      <div
        className={cn(backdropClass)}
        aria-hidden="true"
        onClick={handleDismiss}
      />

      {/* Modal Dialog Card */}
      <div
        ref={windowRef}
        className={cn(
          'relative z-10 bg-white rounded-3xl max-w-sm sm:max-w-md w-full p-6 shadow-2xl border border-[var(--color-paper-border)] flex flex-col gap-5 max-h-[90dvh] overflow-y-auto modal-scroll-body my-auto',
          windowClass
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div className="flex items-start justify-between">
          {/* Bell Icon with Soft Glow Ring */}
          <div className="relative w-12 h-12 rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shadow-xs ring-4 ring-[var(--color-accent-soft)]/50">
            <Bell className="w-6 h-6 pulse-dot" aria-hidden="true" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-200" />
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup pemberitahuan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title and Subtitle */}
        <div className="space-y-1.5">
          <h3
            id="notification-modal-title"
            className="font-display font-semibold text-lg text-[var(--color-ink)] leading-snug"
          >
            Tetap Terhubung dengan Ruang Konseling
          </h3>
          <p
            id="notification-modal-desc"
            className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed"
          >
            Aktifkan notifikasi untuk mendapatkan kabar penting langsung di perangkatmu.
          </p>
        </div>

        {/* Benefits List */}
        <ul className="space-y-3 bg-[var(--color-paper)] p-4 rounded-2xl border border-[var(--color-paper-border)] text-xs sm:text-sm text-[var(--color-ink)]" role="list">
          <li className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-[var(--color-accent-soft)] flex items-center justify-center shrink-0" aria-hidden="true">
              <Clock className="w-4 h-4 text-[var(--color-accent)]" />
            </span>
            <span className="leading-snug">Pengingat jadwal konsultasi 1 jam sebelum sesi dimulai</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-[var(--color-accent-soft)] flex items-center justify-center shrink-0" aria-hidden="true">
              <HeartHandshake className="w-4 h-4 text-[var(--color-accent)]" />
            </span>
            <span className="leading-snug">Pemberitahuan saat curhatmu telah ditanggapi oleh Kak Amel</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-[var(--color-accent-soft)] flex items-center justify-center shrink-0" aria-hidden="true">
              <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
            </span>
            <span className="leading-snug">Update artikel refleksi dan kesehatan mental terbaru</span>
          </li>
        </ul>

        {/* Privacy Note */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--color-ink-muted)] px-1 text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>Tanpa spam iklan. Hanya kabar penting seputar konselingmu.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1 border-t border-[var(--color-paper-border)]">
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-white border border-[var(--color-paper-border)] hover:bg-[var(--color-paper)] text-xs sm:text-sm font-medium text-[var(--color-ink)] transition-colors cursor-pointer text-center order-2 sm:order-1"
          >
            Nanti Saja
          </button>
          <button
            type="button"
            onClick={handleEnable}
            disabled={isRequesting}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-[var(--color-accent)] text-white text-xs sm:text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer text-center active:scale-98 shadow-xs disabled:opacity-60 order-1 sm:order-2"
          >
            {isRequesting ? 'Mengaktifkan...' : 'Aktifkan Notifikasi'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
