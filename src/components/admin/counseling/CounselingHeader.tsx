'use client';

import React from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

interface CounselingHeaderProps {
  totalCount: number;
  unansweredCount: number;
  answeredCount: number;
  loading: boolean;
  onRefresh: () => void;
  onExport?: () => void;
}

export function CounselingHeader({
  totalCount,
  unansweredCount,
  answeredCount,
  loading,
  onRefresh,
  onExport,
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
        <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1 flex items-center gap-1.5 flex-wrap">
          {loading && totalCount === 0 ? (
            <span className="inline-flex items-center gap-1 text-[var(--color-ink-soft)]">
              <span>Memuat pesan curhat anonim...</span>
            </span>
          ) : (
            <span>
              Total {totalCount} pesan ({unansweredCount} butuh tanggapan &bull; {answeredCount} terjawab)
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
        {onExport && (
          <button
            onClick={onExport}
            type="button"
            disabled={loading || totalCount === 0}
            className="btn-interactive inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/50 text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] shadow-2xs cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-initial"
            title="Ekspor seluruh rekap curhat ke format CSV / Excel"
          >
            <Download className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>Ekspor CSV</span>
          </button>
        )}

        <button
          onClick={onRefresh}
          type="button"
          disabled={loading}
          className="btn-interactive inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/50 text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] shadow-2xs cursor-pointer transition-all disabled:opacity-60 flex-1 sm:flex-initial"
        >
          {loading ? (
            <Spinner size="xs" variant="accent" label="Menyegarkan data..." />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 text-[var(--color-ink-soft)]" />
          )}
          <span>Segarkan</span>
        </button>
      </div>
    </div>
  );
}
