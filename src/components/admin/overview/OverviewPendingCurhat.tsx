'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Send } from 'lucide-react';
import { AnonymousMessage } from '@/types';
import { SkeletonCurhatCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface OverviewPendingCurhatProps {
  curhatList: AnonymousMessage[];
  loading: boolean;
}

export function OverviewPendingCurhat({
  curhatList,
  loading,
}: OverviewPendingCurhatProps) {
  const unansweredCurhat = curhatList.filter((c) => !c.isAnswered);

  return (
    <div className="lg:col-span-5 flex flex-col h-full space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <h2
            className="text-base sm:text-lg font-medium text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Curhat Menanti Tanggapan
          </h2>
          <p className="text-[11px] sm:text-xs text-[var(--color-ink-muted)]">
            Pesan anonim yang butuh ruang dengar dan arahan.
          </p>
        </div>
        <Link
          href="/admin/counseling"
          className="btn-interactive inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-[var(--color-paper-muted)] hover:bg-[var(--color-paper-border)] text-[var(--color-accent)] font-semibold text-xs shrink-0 whitespace-nowrap border border-[var(--color-paper-border)] transition-colors group"
        >
          <span>Semua ({curhatList.length})</span>
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3 flex-1">
          <SkeletonCurhatCard />
          <SkeletonCurhatCard />
        </div>
      ) : unansweredCurhat.length === 0 ? (
        <EmptyState
          size="sm"
          icon={<CheckCircle2 className="w-5 h-5 text-[var(--color-accent)]" />}
          title="Semua Curhat Telah Terjawab"
          description="Tidak ada pesan anonim yang menunggu balasan saat ini. Ruang dengar berjalan dengan optimal."
          className="min-h-[240px] flex-1"
        />
      ) : (
        <div className="space-y-3">
          {unansweredCurhat.slice(0, 3).map((c) => (
            <div
              key={c.id}
              className="p-3.5 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-xs space-y-3 transition-all"
            >
              <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] italic leading-relaxed line-clamp-3">
                &ldquo;{c.message}&rdquo;
              </p>

              <div className="pt-2.5 border-t border-[var(--color-paper-border)] space-y-2.5">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="font-semibold text-[var(--color-ink)]">{c.alias}</span>
                  <span className="text-[var(--color-paper-border)]">&bull;</span>
                  <span className="text-[11px] text-[var(--color-accent)] font-medium">
                    {c.category}
                  </span>
                </div>

                <div>
                  <Link
                    href="/admin/counseling"
                    className="btn-primary btn-interactive !text-xs !py-1.5 !px-3 inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Beri Tanggapan</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
