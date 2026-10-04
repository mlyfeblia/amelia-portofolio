'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
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
        disabled={loading}
        type="button"
        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] transition-all cursor-pointer self-start sm:self-auto shrink-0"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        <span>Segarkan</span>
      </button>
    </div>
  );
}
