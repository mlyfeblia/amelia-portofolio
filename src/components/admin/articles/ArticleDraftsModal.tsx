'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  FolderArchive,
  Plus,
  Search,
  Trash2,
  Clock,
  BookOpen,
  FileEdit,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useMounted } from '@/lib/use-mounted';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { ConfirmDecisionModal } from '@/components/ui/ConfirmDecisionModal';
import {
  ArticleDraftItem,
  useArticleDrafts,
  deleteDraft,
  formatDraftDate,
} from '@/lib/draft-store';
import { cn } from '@/lib/utils';

export interface ArticleDraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDraft: (draft: ArticleDraftItem) => void;
  onNewDraft: () => void;
  currentDraftId?: string | null;
}

export function ArticleDraftsModal({
  isOpen,
  onClose,
  onSelectDraft,
  onNewDraft,
  currentDraftId,
}: ArticleDraftsModalProps) {
  const mounted = useMounted();
  const { isRendered, backdropClass, windowClass } = useModalAnimation({ isOpen });

  const drafts = useArticleDrafts();
  const [searchQuery, setSearchQuery] = useState('');
  const [draftToDelete, setDraftToDelete] = useState<ArticleDraftItem | null>(null);

  // Lock body & document scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !draftToDelete) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, draftToDelete, onClose]);

  // Filter drafts by search query
  const filteredDrafts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return drafts;

    return drafts.filter((d) => {
      return (
        d.title.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.excerpt.toLowerCase().includes(q) ||
        d.tags.toLowerCase().includes(q)
      );
    });
  }, [drafts, searchQuery]);

  if (!mounted || !isRendered) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-2 min-[340px]:p-3 sm:p-6 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drafts-modal-title"
    >
      {/* Glassmorphic Backdrop Layer */}
      <div
        className={cn(
          'fixed inset-0 bg-transparent backdrop-blur-md touch-none select-none pointer-events-auto',
          backdropClass
        )}
        aria-hidden="true"
        onClick={onClose}
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
      />

      {/* Dialog Window */}
      <div
        className={cn(
          'relative z-10 w-full max-w-lg sm:max-w-xl bg-white rounded-2xl min-[340px]:rounded-3xl p-3 min-[340px]:p-4 sm:p-6 shadow-2xl border border-[var(--color-paper-border)] flex flex-col gap-3 min-[340px]:gap-4 max-h-[90vh] sm:max-h-[85vh] pointer-events-auto',
          windowClass
        )}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-2 min-[340px]:gap-3 pb-2.5 min-[340px]:pb-3 border-b border-[var(--color-paper-border)] shrink-0">
          <div className="flex items-center gap-2 min-[340px]:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 min-[340px]:w-10 min-[340px]:h-10 rounded-xl min-[340px]:rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent)] shrink-0 shadow-2xs">
              <FolderArchive className="w-4 h-4 min-[340px]:w-5 min-[340px]:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2
                id="drafts-modal-title"
                className="text-sm min-[340px]:text-base sm:text-lg font-medium text-[var(--color-ink)] leading-snug truncate"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Kotak Kumpulan Draf
              </h2>
              <p className="text-[11px] min-[340px]:text-xs text-[var(--color-ink-muted)] leading-tight mt-0.5 truncate">
                Kelola tulisan yang sedang disusun sebelum terbit.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 min-[340px]:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                onNewDraft();
                onClose();
              }}
              className="btn-interactive inline-flex items-center gap-1 min-[340px]:gap-1.5 px-2 min-[340px]:px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer shadow-2xs whitespace-nowrap"
              title="Mulai menulis artikel baru tanpa draf"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden min-[340px]:inline">Draf Baru</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-interactive p-1.5 rounded-xl text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors cursor-pointer"
              aria-label="Tutup kotak draf"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar (if more than 2 drafts or searching) */}
        {(drafts.length > 2 || searchQuery) && (
          <div className="relative shrink-0">
            <Search className="w-4 h-4 text-[var(--color-ink-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul draf atau kategori..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-xs text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] p-0.5"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Draft List or Empty State */}
        <div className="flex-1 overflow-y-auto max-h-[50vh] space-y-2.5 pr-1 overscroll-contain">
          {drafts.length === 0 ? (
            /* Calm Empty State */
            <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-3xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] flex items-center justify-center text-[var(--color-ink-muted)] mb-3 shadow-2xs">
                <FileEdit className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--color-ink)] mb-1">
                Belum ada draf tersimpan
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] max-w-xs mb-4">
                Semua artikel yang sedang Anda tulis dan simpan sebagai draf akan tersimpan rapi di sini.
              </p>
              <button
                type="button"
                onClick={() => {
                  onNewDraft();
                  onClose();
                }}
                className="btn-interactive inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Mulai Menulis Draf Pertama</span>
              </button>
            </div>
          ) : filteredDrafts.length === 0 ? (
            /* Filter Empty State */
            <div className="py-8 text-center text-xs text-[var(--color-ink-muted)]">
              Tidak ada draf yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
            </div>
          ) : (
            /* Draft Cards */
            filteredDrafts.map((draft) => {
              const isCurrent = currentDraftId === draft.id;
              const wordCount = draft.content.trim()
                ? draft.content.trim().split(/\s+/).filter(Boolean).length
                : 0;

              return (
                <div
                  key={draft.id}
                  className={cn(
                    'group relative rounded-2xl border p-3 sm:p-3.5 transition-all flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between',
                    isCurrent
                      ? 'bg-[var(--color-accent-soft)]/20 border-[var(--color-accent-border)] ring-1 ring-[var(--color-accent-border)]'
                      : 'bg-white hover:bg-[var(--color-paper-soft)]/60 border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)]/60 shadow-2xs'
                  )}
                >
                  {/* Left: Thumbnail & Content Info */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Thumbnail */}
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border border-[var(--color-paper-border)] bg-[var(--color-paper)] flex items-center justify-center">
                      {draft.coverImage ? (
                        <Image
                          src={draft.coverImage}
                          alt={draft.title || 'Draf'}
                          fill
                          className="object-cover"
                          unoptimized={draft.coverImage.startsWith('http')}
                          sizes="64px"
                        />
                      ) : (
                        <BookOpen className="w-5 h-5 text-[var(--color-ink-muted)]" />
                      )}
                    </div>

                    {/* Metadata & Title */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--color-accent-soft)] text-[var(--color-accent)] shrink-0">
                          {draft.category || 'Kategori'}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Sedang Dibuka</span>
                          </span>
                        )}
                        <span className="text-[10px] text-[var(--color-ink-muted)] inline-flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{formatDraftDate(draft.updatedAt)}</span>
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-semibold text-[var(--color-ink)] truncate leading-snug">
                        {draft.title.trim() || 'Draf Tanpa Judul'}
                      </h4>

                      {draft.excerpt.trim() ? (
                        <p className="line-clamp-2 text-[11px] text-[var(--color-ink-muted)] leading-relaxed">
                          {draft.excerpt}
                        </p>
                      ) : (
                        <p className="text-[11px] text-[var(--color-ink-muted)] italic">
                          {wordCount > 0 ? `${wordCount} kata` : 'Belum ada kutipan ringkasan'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-wrap items-center gap-1.5 min-[340px]:gap-2 self-stretch sm:self-center shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--color-paper-border)]">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectDraft(draft);
                        onClose();
                      }}
                      className="btn-secondary btn-interactive inline-flex items-center justify-center gap-1.5 px-2.5 min-[340px]:px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-accent)] bg-[var(--color-accent-soft)] hover:bg-[var(--color-accent-soft)]/80 border border-[var(--color-accent-border)] transition-all cursor-pointer flex-1 sm:flex-initial whitespace-nowrap"
                      title="Buka draf ini ke formulir editor"
                    >
                      <FileEdit className="w-3.5 h-3.5 shrink-0" />
                      <span>{isCurrent ? 'Lanjutkan Tulis' : 'Muat Draf'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDraftToDelete(draft)}
                      className="btn-interactive p-1.5 rounded-xl text-[var(--color-ink-muted)] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer shrink-0"
                      aria-label="Hapus draf ini"
                      title="Hapus draf"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[var(--color-paper-border)] flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <span className="text-[var(--color-ink-muted)] font-medium">
            Total {drafts.length} draf tersimpan
          </span>

          <button
            type="button"
            onClick={onClose}
            className="btn-interactive px-3.5 min-[340px]:px-4 py-1.5 min-[340px]:py-2 rounded-xl text-xs font-semibold bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Deleting Draft */}
      <ConfirmDecisionModal
        isOpen={Boolean(draftToDelete)}
        onClose={() => setDraftToDelete(null)}
        onConfirm={() => {
          if (draftToDelete) {
            deleteDraft(draftToDelete.id);
            setDraftToDelete(null);
          }
        }}
        title="Hapus Draf Artikel?"
        description={`Apakah Anda yakin ingin menghapus draf "${
          draftToDelete?.title.trim() || 'Draf Tanpa Judul'
        }"? Tindakan ini akan menghapus draf dari penyimpanan lokal secara permanen.`}
        confirmLabel="Hapus Draf"
        cancelLabel="Batal"
        variant="danger"
      />
    </div>,
    document.body
  );
}
