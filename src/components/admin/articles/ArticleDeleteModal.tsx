'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Article } from '@/types';
import { useMounted } from '@/lib/use-mounted';
import { Spinner } from '@/components/ui/Spinner';

interface ArticleDeleteModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (article: Article) => Promise<void>;
}

export function ArticleDeleteModal({
  article,
  isOpen,
  onClose,
  onConfirm,
}: ArticleDeleteModalProps) {
  const mounted = useMounted();
  const [deleting, setDeleting] = useState(false);

  // Lock body & document scroll while modal is active
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

  if (!mounted || !isOpen || !article) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm(article);
    } finally {
      setDeleting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-article-title"
    >
      {/* Dedicated Full-Screen Backdrop Layer (Unclickable & Scroll-Blocked) */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity modal-backdrop-enter touch-none select-none"
        aria-hidden="true"
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
      />

      <div className="relative z-10 w-full sm:max-w-md bg-[var(--color-surface)] border-t sm:border border-[var(--color-paper-border)] rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 modal-window-enter max-h-[90dvh] overflow-y-auto pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-6">
        {/* Mobile handle indicator */}
        <div className="w-12 h-1 bg-[var(--color-paper-border)] rounded-full mx-auto sm:hidden mb-2" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="delete-article-title" className="font-semibold text-base text-[var(--color-ink)] leading-snug">
                Hapus Artikel Publikasi?
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] mt-1 leading-relaxed">
                Artikel <strong className="text-[var(--color-ink)]">&ldquo;{article.title}&rdquo;</strong> akan dihapus permanen dari basis data dan halaman web.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="btn-interactive p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors cursor-pointer shrink-0"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-xs text-[var(--color-ink-muted)]">
          <span className="text-[11px] block font-medium mb-0.5">Slug URL:</span>
          <code className="text-[var(--color-accent)] font-mono break-all">/articles/{article.slug}</code>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-end pt-2 border-t border-[var(--color-paper-border)]">
          <button
            onClick={onClose}
            type="button"
            className="btn-interactive h-10 sm:h-9 px-4 text-xs font-semibold rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] transition-all cursor-pointer inline-flex items-center justify-center"
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
                <Spinner size="xs" variant="white" label="Menghapus artikel..." />
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
