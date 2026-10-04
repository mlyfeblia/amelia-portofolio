'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

interface OverviewHeaderProps {
  loading: boolean;
  onRefresh: () => void;
}

export function OverviewHeader({ loading, onRefresh }: OverviewHeaderProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
      <div className="space-y-1">
        <h1
          className="text-xl sm:text-2xl lg:text-3xl font-medium text-[var(--color-ink)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Selamat Datang, Amel
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
          Pantau permohonan janji temu konseling, tanggapi curhat anonim sahabat, dan kelola publikasi artikel.
        </p>
      </div>

      <button
        onClick={onRefresh}
        type="button"
        disabled={loading}
        className="btn-interactive inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] cursor-pointer self-start sm:self-auto shrink-0 disabled:opacity-60"
      >
        {loading ? (
          <Spinner size="xs" variant="accent" label="Menyegarkan data..." />
        ) : (
          <RefreshCw className="w-3.5 h-3.5 text-[var(--color-ink-soft)]" />
        )}
        <span>Segarkan Data</span>
      </button>
    </div>
  );
}
