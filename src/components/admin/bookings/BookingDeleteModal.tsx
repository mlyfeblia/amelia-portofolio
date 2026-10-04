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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-booking-title"
    >
      {/* Dedicated Full-Screen Backdrop Layer */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity touch-none select-none',
          backdropClass
        )}
        aria-hidden="true"
        onClick={() => !deleting && !isExiting && onClose()}
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
      />

      <div
        className={cn(
          'relative z-10 w-full max-w-sm sm:max-w-md bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto my-auto',
          windowClass
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="delete-booking-title" className="font-semibold text-base text-[var(--color-ink)] leading-snug">
                Hapus Janji Temu?
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] mt-1 leading-relaxed">
                Data janji temu konseli <strong className="text-[var(--color-ink)]">{activeBooking.name}</strong> (Kode: <code className="text-[var(--color-accent)] font-semibold">{activeBooking.code}</code>) akan dihapus secara permanen.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={deleting}
            type="button"
            className="btn-interactive p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            aria-label="Tutup dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-xs text-[var(--color-ink-muted)] space-y-1">
          <div><strong className="text-[var(--color-ink)] font-medium">Jadwal:</strong> {activeBooking.date} ({activeBooking.timeSlot})</div>
          <div><strong className="text-[var(--color-ink)] font-medium">Topik:</strong> {activeBooking.category}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-end pt-2 border-t border-[var(--color-paper-border)]">
          <button
            onClick={onClose}
            disabled={deleting}
            type="button"
            className="btn-interactive h-10 sm:h-9 px-4 text-xs font-semibold rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] transition-all cursor-pointer inline-flex items-center justify-center disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            type="button"
            className="btn-interactive h-10 sm:h-9 px-4 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-xs"
          >
            {deleting ? (
              <>
                <Spinner size="xs" variant="white" label="Menghapus janji temu..." />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
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
