'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { AnonymousMessage } from '@/types';
import { useMounted } from '@/lib/use-mounted';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

interface CounselingDeleteModalProps {
  item: AnonymousMessage | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (item: AnonymousMessage) => Promise<void>;
}

export function CounselingDeleteModal({
  item,
  isOpen,
  onClose,
  onConfirm,
}: CounselingDeleteModalProps) {
  const mounted = useMounted();
  const [deleting, setDeleting] = useState(false);
  const { isRendered, backdropClass, windowClass } = useModalAnimation({ isOpen });

  // Retain active counseling item during exit transition without accessing refs during render
  const [cachedItem, setCachedItem] = useState<AnonymousMessage | null>(item);
  if (item && item !== cachedItem) {
    setCachedItem(item);
  }
  const activeItem = item ?? cachedItem;

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

  if (!mounted || !isRendered || !activeItem) return null;

  const handleConfirm = async () => {
    if (!activeItem) return;
    setDeleting(true);
    try {
      await onConfirm(activeItem);
    } finally {
      setDeleting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-counseling-title"
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
          'relative z-10 w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-4 min-[340px]:p-5 sm:p-6 shadow-2xl border border-[var(--color-paper-border)] flex flex-col gap-4 sm:gap-5 my-auto select-text',
          windowClass
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="delete-counseling-title"
                className="font-display font-semibold text-base sm:text-lg text-[var(--color-ink)] leading-snug"
              >
                Hapus Pesan Curhat?
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                Penghapusan pesan konseli dari sistem.
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

        <div className="bg-[var(--color-paper)] p-3.5 sm:p-4 rounded-2xl border border-[var(--color-paper-border)] text-xs text-[var(--color-ink-muted)] space-y-2">
          <p className="leading-relaxed break-words">
            Pesan dari <strong className="text-[var(--color-ink)] font-semibold break-words">{activeItem.alias}</strong> ({activeItem.category}) akan dihapus secara permanen.
          </p>
          <div className="pt-2 border-t border-[var(--color-paper-border)]/60 text-xs italic leading-relaxed max-h-24 overflow-y-auto break-words">
            &ldquo;{activeItem.message}&rdquo;
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
          <button
            onClick={onClose}
            disabled={deleting}
            type="button"
            className="w-full py-2.5 sm:py-3 rounded-xl btn-secondary min-w-0 px-2 sm:px-4 text-[11px] sm:text-xs font-medium cursor-pointer text-center active:scale-98 shadow-2xs inline-flex items-center justify-center whitespace-nowrap disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            type="button"
            className="w-full py-2.5 sm:py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white min-w-0 px-2 sm:px-4 text-[11px] sm:text-xs font-medium transition-colors cursor-pointer text-center active:scale-98 shadow-xs inline-flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap disabled:opacity-60"
          >
            {deleting ? (
              <>
                <Spinner size="xs" variant="white" label="Menghapus pesan curhat..." />
                <span className="truncate">Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">Ya, Hapus</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
