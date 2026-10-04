'use client';

import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';

interface ArticleHeaderProps {
  totalCount: number;
  loading: boolean;
  onRefresh: () => void;
  onCreateNew: () => void;
}

export function ArticleHeader({
  totalCount,
  loading,
  onRefresh,
  onCreateNew,
}: ArticleHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      <div>
        <h1
          className="text-xl sm:text-2xl lg:text-3xl font-medium text-[var(--color-ink)] leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Kelola Artikel &amp; Publikasi
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
          Total {totalCount} artikel terbit &bull; Terbuka untuk dibaca publik secara luas.
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
        <button
          onClick={onRefresh}
          disabled={loading}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] transition-all cursor-pointer"
          title="Segarkan artikel"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan</span>
        </button>

        <button
          onClick={onCreateNew}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Artikel Baru</span>
        </button>
      </div>
    </div>
  );
}
