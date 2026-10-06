'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Booking } from '@/types';
import { useMounted } from '@/lib/use-mounted';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

interface BookingDeleteModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (booking: Booking) => Promise<void>;
}

export function BookingDeleteModal({
  booking,
  isOpen,
  onClose,
  onConfirm,
}: BookingDeleteModalProps) {
  const mounted = useMounted();
  const [deleting, setDeleting] = useState(false);
  const { isRendered, isExiting, backdropClass, windowClass } = useModalAnimation({ isOpen });

  // Retain active booking during exit transition without accessing refs during render
  const [cachedBooking, setCachedBooking] = useState<Booking | null>(booking);
  if (booking && booking !== cachedBooking) {
    setCachedBooking(booking);
  }
  const activeBooking = booking ?? cachedBooking;

  // Lock body & document scroll while modal is active
  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deleting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, deleting]);

  if (!mounted || !isRendered || !activeBooking) return null;

  const handleConfirm = async () => {
    if (!activeBooking) return;
    setDeleting(true);
    try {
      await onConfirm(activeBooking);
    } finally {
      setDeleting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-booking-title"
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
                id="delete-booking-title"
                className="font-display font-semibold text-base sm:text-lg text-[var(--color-ink)] leading-snug"
              >
                Hapus Janji Temu?
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                Penghapusan data reservasi konseli.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={deleting}
            type="button"
            className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            aria-label="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-[var(--color-paper)] p-4 rounded-2xl border border-[var(--color-paper-border)] text-xs text-[var(--color-ink-muted)] space-y-2">
          <p className="leading-relaxed">
            Data janji temu konseli <strong className="text-[var(--color-ink)] font-semibold">{activeBooking.name}</strong> (<code className="text-[var(--color-accent)] font-semibold">{activeBooking.code}</code>) akan dihapus secara permanen.
          </p>
          <div className="pt-2 border-t border-[var(--color-paper-border)]/60 space-y-1 text-[11px]">
            <div><strong className="text-[var(--color-ink)] font-medium">Jadwal:</strong> {activeBooking.date} ({activeBooking.timeSlot})</div>
            <div><strong className="text-[var(--color-ink)] font-medium">Topik:</strong> {activeBooking.category}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={onClose}
            disabled={deleting}
            type="button"
            className="w-full py-3 rounded-xl btn-secondary text-xs sm:text-sm font-medium cursor-pointer text-center active:scale-98 shadow-2xs inline-flex items-center justify-center whitespace-nowrap disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            type="button"
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer text-center active:scale-98 shadow-xs inline-flex items-center justify-center gap-1.5 whitespace-nowrap disabled:opacity-60"
          >
            {deleting ? (
              <>
                <Spinner size="xs" variant="white" label="Menghapus janji temu..." />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>Ya, Hapus</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
