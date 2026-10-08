'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, MoreVertical, PlusSquare, CheckCircle2 } from 'lucide-react';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { cn } from '@/lib/utils';

interface PwaBrowserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PwaBrowserGuideModal({ isOpen, onClose }: PwaBrowserGuideModalProps) {
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

  // Lock body & document scroll while modal is active
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

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="browser-guide-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Full-viewport transparent frosted blur backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-transparent backdrop-blur-md touch-none select-none pointer-events-auto',
          backdropClass
        )}
        aria-hidden="true"
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
      />

      {/* Modal Dialog Card */}
      <div
        className={cn(
          'relative z-10 bg-white rounded-3xl max-w-sm sm:max-w-md w-full p-6 shadow-2xl border border-[var(--color-paper-border)] flex flex-col gap-5 max-h-[90dvh] overflow-y-auto my-auto',
          windowClass
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
              <h3 id="browser-guide-title" className="font-display font-semibold text-base text-[var(--color-ink)]">
                Pasang Aplikasi Amelia
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)]">Panduan Android, Chrome &amp; Desktop</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup petunjuk pemasangan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <ol className="space-y-3 text-xs sm:text-sm text-[var(--color-ink)]">
          <li className="flex items-start gap-3 bg-[var(--color-paper)] p-3.5 rounded-2xl border border-[var(--color-paper-border)]">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5">
              <MoreVertical className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold block text-[var(--color-ink)]">1. Ketuk Menu Titik Tiga (⋮)</span>
              <span className="text-[var(--color-ink-muted)] text-xs leading-relaxed">
                Buka menu browser dengan mengetuk ikon titik tiga (<strong>⋮</strong>) di sudut kanan atas layar perambanmu (Chrome, Edge, Samsung Internet, dll).
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
                Pilih menu <strong>&ldquo;Tambahkan ke Layar Utama&rdquo;</strong> (atau <strong>&ldquo;Pasang Aplikasi&rdquo;</strong> / <em>Install app</em>).
              </span>
            </div>
          </li>

          <li className="flex items-start gap-3 bg-[var(--color-paper)] p-3.5 rounded-2xl border border-[var(--color-paper-border)]">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold block text-[var(--color-ink)]">3. Ketuk Tambah / Pasang</span>
              <span className="text-[var(--color-ink-muted)] text-xs leading-relaxed">
                Ketuk tombol <strong>&ldquo;Tambah&rdquo;</strong> atau <strong>&ldquo;Pasang&rdquo;</strong>. Ikon aplikasi Amelia akan otomatis tersedia di beranda ponselmu!
              </span>
            </div>
          </li>
        </ol>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-[var(--color-accent)] text-white text-xs sm:text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer text-center active:scale-98 shadow-xs"
        >
          Saya Mengerti
        </button>
      </div>
    </div>,
    document.body
  );
}
