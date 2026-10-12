'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

interface CounselingHeaderProps {
  totalCount: number;
  unansweredCount: number;
  answeredCount: number;
  loading: boolean;
  onRefresh: () => void;
}

export function CounselingHeader({
  totalCount,
  unansweredCount,
  answeredCount,
  loading,
  onRefresh,
}: CounselingHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      <div>
        <h1
          className="text-xl sm:text-2xl lg:text-3xl font-medium text-[var(--color-ink)] leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Kelola Ruang Curhat Anonim
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
          Total {totalCount} pesan ({unansweredCount} butuh tanggapan &bull; {answeredCount} terjawab).
        </p>
      </div>

      <button
        onClick={onRefresh}
        type="button"
        disabled={loading}
        className="btn-interactive inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/50 text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] shadow-2xs cursor-pointer shrink-0 transition-all disabled:opacity-60"
      >
        {loading ? (
          <Spinner size="xs" variant="accent" label="Menyegarkan data..." />
        ) : (
          <RefreshCw className="w-3.5 h-3.5 text-[var(--color-ink-soft)]" />
        )}
        <span>Segarkan</span>
      </button>
    </div>
  );
}
