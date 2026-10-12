'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

interface BookingHeaderProps {
  totalCount: number;
  loading: boolean;
  onRefresh: () => void;
}

export function BookingHeader({
  totalCount,
  loading,
  onRefresh,
}: BookingHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      <div className="min-w-0">
        <h1
          className="text-xl sm:text-2xl lg:text-3xl font-medium text-[var(--color-ink)] leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Kelola Janji Temu Konseling
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
          Total {totalCount} reservasi terdaftar &bull; Pantau kepastian jadwal konseli.
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
