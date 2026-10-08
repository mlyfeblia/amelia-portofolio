'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, History } from 'lucide-react';
import { APP_CHANGELOG, CURRENT_APP_VERSION } from '@/data/app-version';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { cn } from '@/lib/utils';

interface PwaChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PwaChangelogModal({ isOpen, onClose }: PwaChangelogModalProps) {
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

  // Lock body scroll while modal is active
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
      aria-labelledby="changelog-modal-title"
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

      {/* Modal Dialog Box */}
      <div
        className={cn(
          'relative w-full max-w-xl max-h-[85vh] bg-[var(--color-surface)] text-[var(--color-ink)] rounded-3xl shadow-2xl border border-[var(--color-paper-border)] overflow-hidden flex flex-col z-10 my-auto select-text',
          windowClass
        )}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--color-paper-border)] bg-[var(--color-paper)]/50 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <h2
              id="changelog-modal-title"
              className="text-xl sm:text-2xl font-medium text-[var(--color-ink)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Catatan Pembaruan Aplikasi
            </h2>
            <p className="text-xs text-[var(--color-ink-muted)]">
              Versi v{CURRENT_APP_VERSION} (Aktif) &bull; Rincian fitur baru dan penyempurnaan sistem.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors cursor-pointer shrink-0"
            aria-label="Tutup catatan pembaruan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Timeline Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {APP_CHANGELOG.map((release, idx) => {
            const isLatest = idx === 0;
            return (
              <article
                key={release.version}
                className={cn(
                  'rounded-2xl border p-4 sm:p-5 space-y-3 transition-colors',
                  isLatest
                    ? 'bg-white border-[var(--color-accent)]/40 shadow-xs'
                    : 'bg-[var(--color-paper)]/40 border-[var(--color-paper-border)] opacity-85'
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[var(--color-paper-border)]/60">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--color-ink)] font-mono">
                      v{release.version}
                    </span>
                    {isLatest && (
                      <span className="text-xs font-semibold text-[var(--color-accent)]">
                        &bull; Rilis Terkini
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--color-ink-muted)]">
                    {release.releaseDate}
                  </span>
                </div>

                <h3 className="font-semibold text-sm sm:text-base text-[var(--color-ink)] leading-snug">
                  {release.title}
                </h3>

                <ul className="space-y-2 pt-1 text-xs sm:text-sm text-[var(--color-ink-muted)]" role="list">
                  {release.highlights.map((item, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-2.5">
                      <CheckCircle2
                        className={cn(
                          'w-4 h-4 shrink-0 mt-0.5',
                          isLatest ? 'text-[var(--color-accent)]' : 'text-stone-400'
                        )}
                        aria-hidden="true"
                      />
                      <span className="leading-relaxed text-[var(--color-ink)]/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--color-paper-border)] bg-[var(--color-paper)]/50 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[var(--color-ink-soft)] flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" />
            <span>Pembaruan otomatis terjadwal</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-primary text-xs sm:text-sm py-2 px-4 rounded-xl cursor-pointer"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
