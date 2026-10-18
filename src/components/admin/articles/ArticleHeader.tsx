'use client';

import React from 'react';
import { Plus, RefreshCw, FolderArchive } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

interface ArticleHeaderProps {
  totalCount: number;
  loading: boolean;
  onRefresh: () => void;
  onCreateNew: () => void;
  onOpenDrafts?: () => void;
  draftCount?: number;
}

export function ArticleHeader({
  totalCount,
  loading,
  onRefresh,
  onCreateNew,
  onOpenDrafts,
  draftCount,
}: ArticleHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      <div className="min-w-0">
        <h1
          className="text-xl sm:text-2xl lg:text-3xl font-medium text-[var(--color-ink)] leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Kelola Artikel &amp; Publikasi
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1 flex items-center gap-1.5 flex-wrap">
          {loading && totalCount === 0 ? (
            <span className="inline-flex items-center gap-1 text-[var(--color-ink-soft)]">
              <span>Memuat koleksi artikel...</span>
            </span>
          ) : (
            <span>Total {totalCount} artikel terbit</span>
          )}
          <span>&bull;</span>
          <span>Terbuka untuk dibaca publik secara luas.</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0 w-full sm:w-auto">
        <button
          onClick={onRefresh}
          disabled={loading}
          type="button"
          className="btn-interactive inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/50 text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] shadow-2xs cursor-pointer shrink-0 transition-all disabled:opacity-60"
          title="Segarkan artikel"
        >
          {loading ? (
            <Spinner size="xs" variant="accent" label="Menyegarkan data..." />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 text-[var(--color-ink-soft)]" />
          )}
          <span>Segarkan</span>
        </button>

        {onOpenDrafts && (
          <button
            onClick={onOpenDrafts}
            type="button"
            className="btn-interactive inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/50 text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] shadow-2xs cursor-pointer shrink-0 transition-all"
            title="Buka kotak kumpulan draf artikel"
          >
            <FolderArchive className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
            <span><span className="hidden min-[320px]:inline">Kotak </span>Draf</span>
            {typeof draftCount === 'number' && draftCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                {draftCount}
              </span>
            )}
          </button>
        )}

        <button
          onClick={onCreateNew}
          type="button"
          className="btn-interactive inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/50 text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] shadow-2xs cursor-pointer shrink-0 transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
          <span><span className="hidden min-[320px]:inline">Tambah </span>Artikel</span>
        </button>
      </div>
    </div>
  );
}
