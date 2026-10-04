'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Clock, 
  CheckCircle2, 
  MessageSquareText, 
  FileText, 
  ArrowRight 
} from 'lucide-react';

interface OverviewMetricsProps {
  waitingBookingsCount: number;
  confirmedBookingsCount: number;
  unansweredCurhatCount: number;
  articlesCount: number;
}

export function OverviewMetrics({
  waitingBookingsCount,
  confirmedBookingsCount,
  unansweredCurhatCount,
  articlesCount,
}: OverviewMetricsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* Card 1: Perlu Konfirmasi */}
      <Link
        href="/admin/bookings"
        className="card-interactive p-3.5 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] transition-all shadow-xs group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-xs text-[var(--color-ink-muted)] mb-2 sm:mb-3">
          <span className="text-[11px] sm:text-xs">Perlu Konfirmasi</span>
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </span>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            {waitingBookingsCount}
          </div>
          <div className="text-[11px] sm:text-xs text-[var(--color-ink-muted)] mt-1 flex items-center justify-between">
            <span>Janji temu baru</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-0.5 text-[var(--color-accent)]" />
          </div>
        </div>
      </Link>

      {/* Card 2: Sesi Terkonfirmasi */}
      <Link
        href="/admin/bookings"
        className="card-interactive p-3.5 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] transition-all shadow-xs group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-xs text-[var(--color-ink-muted)] mb-2 sm:mb-3">
          <span className="text-[11px] sm:text-xs">Terkonfirmasi</span>
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </span>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-medium text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-display)' }}>
            {confirmedBookingsCount}
          </div>
          <div className="text-[11px] sm:text-xs text-[var(--color-ink-muted)] mt-1 flex items-center justify-between">
            <span>Jadwal aktif</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-0.5 text-[var(--color-accent)]" />
          </div>
        </div>
      </Link>

      {/* Card 3: Curhat Menunggu */}
      <Link
        href="/admin/counseling"
        className="card-interactive p-3.5 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] transition-all shadow-xs group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-xs text-[var(--color-ink-muted)] mb-2 sm:mb-3">
          <span className="text-[11px] sm:text-xs">Curhat Menanti</span>
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <MessageSquareText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </span>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            {unansweredCurhatCount}
          </div>
          <div className="text-[11px] sm:text-xs text-[var(--color-ink-muted)] mt-1 flex items-center justify-between">
            <span>Belum dibalas</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-0.5 text-[var(--color-accent)]" />
          </div>
        </div>
      </Link>

      {/* Card 4: Artikel Terpublikasi */}
      <Link
        href="/admin/articles"
        className="card-interactive p-3.5 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] transition-all shadow-xs group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-xs text-[var(--color-ink-muted)] mb-2 sm:mb-3">
          <span className="text-[11px] sm:text-xs">Artikel Terbit</span>
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </span>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            {articlesCount}
          </div>
          <div className="text-[11px] sm:text-xs text-[var(--color-ink-muted)] mt-1 flex items-center justify-between">
            <span>Tulisan aktif</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-0.5 text-[var(--color-accent)]" />
          </div>
        </div>
      </Link>
    </div>
  );
}
