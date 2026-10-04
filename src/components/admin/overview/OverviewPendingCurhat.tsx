'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Send } from 'lucide-react';
import { AnonymousMessage } from '@/types';
import { SkeletonCurhatCard } from '@/components/ui/Skeleton';

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
    <div className="lg:col-span-5 space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
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
          className="text-xs font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
        >
          Semua ({curhatList.length})
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          <SkeletonCurhatCard />
          <SkeletonCurhatCard />
        </div>
      ) : unansweredCurhat.length === 0 ? (
        <div className="p-8 text-center bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl text-xs text-[var(--color-ink-muted)] space-y-1">
          <CheckCircle2 className="w-6 h-6 text-[var(--color-accent)] mx-auto mb-2" />
          <p className="font-semibold text-[var(--color-ink)]">Hebat! Semua curhat sudah terjawab.</p>
          <p>Tidak ada pesan yang menunggu balasan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {unansweredCurhat.slice(0, 3).map((c) => (
            <div
              key={c.id}
              className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-xs space-y-2.5 transition-all"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--color-ink)]">{c.alias}</span>
                <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-medium">
                  {c.category}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] italic leading-relaxed line-clamp-3">
                &ldquo;{c.message}&rdquo;
              </p>

              <div className="pt-2 border-t border-[var(--color-paper-border)] flex justify-end">
                <Link
                  href="/admin/counseling"
                  className="px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer inline-flex items-center gap-1 shadow-xs"
                >
                  <Send className="w-3 h-3" />
                  <span>Beri Tanggapan</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
