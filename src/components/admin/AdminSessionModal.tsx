'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, RotateCw, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { cn } from '@/lib/utils';

interface AdminSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingSeconds: number;
  onRefresh: () => Promise<void>;
  refreshing: boolean;
}

function formatMinutesAndSeconds(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return { m, s };
}

export function AdminSessionModal({
  isOpen,
  onClose,
  remainingSeconds,
  onRefresh,
  refreshing,
}: AdminSessionModalProps) {
  const { isRendered, backdropClass, windowClass } = useModalAnimation({ isOpen });

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isOpen]);

  if (!isRendered || typeof document === 'undefined') return null;

  const { m, s } = formatMinutesAndSeconds(remainingSeconds);
  const percentage = Math.min(Math.max(Math.round((remainingSeconds / 1800) * 100), 2), 100);

  const isCritical = remainingSeconds <= 120;
  const isWarning = remainingSeconds <= 300 && !isCritical;

  const handleExtend = async () => {
    await onRefresh();
    // Keep open a brief moment or close so user sees session extended
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none"
    >
      {/* Dedicated Full-Screen Backdrop Layer - Pure Transparent Blur (Identik Navbar, Tanpa Warna Gelap, Touch & Scroll Blocked) */}
      <div
        className={cn(
          'fixed inset-0 bg-transparent backdrop-blur-md touch-none select-none pointer-events-auto',
          backdropClass
        )}
        aria-hidden="true"
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'relative w-full max-w-md bg-[var(--color-surface)] text-[var(--color-ink)] rounded-3xl shadow-2xl border border-[var(--color-paper-border)] overflow-hidden flex flex-col z-10 my-auto select-text',
          windowClass
        )}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--color-paper-border)] bg-[var(--color-paper)]/50 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="session-modal-title"
                className="text-base sm:text-lg font-medium text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Sesi Pengelola Konselor
              </h2>
              <p className="text-xs text-[var(--color-ink-muted)]">
                Batas waktu aktif &amp; proteksi kerahasiaan konseli
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors cursor-pointer"
            aria-label="Tutup jendela sesi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 text-sm">
          {/* Remaining Time Box */}
          <div
            className={cn(
              'p-5 rounded-2xl border flex flex-col items-center text-center space-y-2',
              isCritical
                ? 'bg-red-50/70 border-red-200 text-red-700'
                : isWarning
                ? 'bg-amber-50/70 border-amber-200 text-amber-800'
                : 'bg-[var(--color-paper)] border-[var(--color-paper-border)] text-[var(--color-ink)]'
            )}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">
              Waktu Sesi Tersisa
            </span>
            <div className="font-mono text-3xl sm:text-4xl font-bold tracking-tight">
              {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
            </div>
            <p className="text-xs text-[var(--color-ink-soft)]">
              Hingga sesi terkunci otomatis
            </p>

            {/* Time progress bar */}
            <div className="w-full h-2 bg-stone-200/80 rounded-full overflow-hidden mt-2">
              <div
                className={cn(
                  'h-full transition-all duration-300 rounded-full',
                  isCritical
                    ? 'bg-red-600'
                    : isWarning
                    ? 'bg-amber-600'
                    : 'bg-[var(--color-accent)]'
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Security details checklist */}
          <div className="space-y-2.5 text-xs text-[var(--color-ink-muted)]">
            <div className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
              <span>Sesi dibatasi maksimal 30 menit demi keamanan data konseli bila perangkat ditinggal.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Draf artikel &amp; balasan curhatmu tersimpan otomatis oleh sistem autosave.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[var(--color-ink-soft)] shrink-0 mt-0.5" />
              <span>Menekan tombol perpanjang akan mereset hitungan mundur kembali ke 30 menit penuh tanpa memuat ulang halaman.</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[var(--color-paper-border)] bg-[var(--color-paper)]/50 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[var(--color-paper-border)] text-xs sm:text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-white transition-colors cursor-pointer text-center"
          >
            Tutup
          </button>
          <button
            type="button"
            disabled={refreshing}
            onClick={handleExtend}
            className="btn-primary text-xs sm:text-sm py-2.5 px-5 rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <RotateCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
            <span>{refreshing ? 'Memperpanjang Sesi...' : 'Perpanjang Sesi (30 Menit)'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
