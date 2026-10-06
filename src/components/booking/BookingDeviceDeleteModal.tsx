'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useMounted } from '@/lib/use-mounted';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { cn } from '@/lib/utils';

interface BookingDeviceDeleteModalProps {
  isOpen: boolean;
  mode: 'single' | 'all';
  targetCode?: string;
  targetName?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function BookingDeviceDeleteModal({
  isOpen,
  mode,
  targetCode,
  targetName,
  onClose,
  onConfirm,
}: BookingDeviceDeleteModalProps) {
  const mounted = useMounted();
  const { isRendered, isExiting, backdropClass, windowClass } = useModalAnimation({ isOpen });

  // Lock body & document scroll while modal is active and handle Escape
  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isRendered) return null;

  const isAll = mode === 'all';

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="device-delete-booking-title"
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

      <div
        className={cn(
          'relative z-10 w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[var(--color-paper-border)] flex flex-col gap-5 my-auto select-text',
          windowClass
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 
                id="device-delete-booking-title" 
                className="font-display font-semibold text-base sm:text-lg text-[var(--color-ink)] leading-snug"
              >
                {isAll ? 'Bersihkan Seluruh Riwayat?' : 'Hapus Riwayat Janji Temu?'}
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                {isAll
                  ? 'Riwayat peramban lokal perangkat ini.'
                  : 'Riwayat kode janji temu di peramban.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Tutup dialog verifikasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-[var(--color-paper)] p-4 rounded-2xl border border-[var(--color-paper-border)] text-xs text-[var(--color-ink-muted)] leading-relaxed space-y-2">
          {isAll ? (
            <p>
              Semua riwayat janji temu akan dihapus dari peramban perangkat ini. Tenang, data janji temu kamu <strong className="text-[var(--color-ink)] font-medium">tetap aman di sistem</strong> dan bisa dilacak kembali kapan pun dengan kodenya.
            </p>
          ) : (
            <div className="space-y-1 font-mono">
              <div><strong className="font-sans font-medium text-[var(--color-ink)]">Kode:</strong> <code className="text-[var(--color-accent)] font-semibold">{targetCode}</code></div>
              {targetName && <div><strong className="font-sans font-medium text-[var(--color-ink)]">Nama:</strong> {targetName}</div>}
              <p className="font-sans text-[11px] text-[var(--color-ink-soft)] pt-1">
                Janji temu tetap tercatat aman di sistem dan tidak terhapus.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={onClose}
            type="button"
            className="w-full py-3 rounded-xl btn-secondary text-xs sm:text-sm font-medium cursor-pointer text-center active:scale-98 shadow-2xs inline-flex items-center justify-center whitespace-nowrap"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            type="button"
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer text-center active:scale-98 shadow-xs inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>{isAll ? 'Bersihkan Semua' : 'Hapus Riwayat'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
