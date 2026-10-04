'use client';

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { AnonymousMessage } from '@/types';
import { SkeletonCurhatCard } from '@/components/ui/Skeleton';

const CATEGORIES = [
  'Semua',
  'Quarter-Life Crisis',
  'Kecemasan & Ibadah',
  'Akademik & Burnout',
  'Keluarga & Relasi',
];

interface CurhatWallProps {
  messages: AnonymousMessage[];
  loading?: boolean;
}

export function CurhatWall({ messages, loading = false }: CurhatWallProps) {
  const [activeTab, setActiveTab] = useState('Semua');

  const filtered =
    activeTab === 'Semua' ? messages : messages.filter((c) => c.category === activeTab);

  return (
    <div className="space-y-4">
      {/* Category Filter Tabs */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Filter kategori curhat"
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeTab === cat;
          return (
            <button
              key={cat}
              id={`tab-${cat}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(cat)}
              type="button"
              className={`chip-interactive px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[var(--color-accent)] text-white font-semibold shadow-xs'
                  : 'bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-accent)]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* List of Messages */}
      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="space-y-4"
      >
        {loading ? (
          <div className="space-y-4">
            <SkeletonCurhatCard />
            <SkeletonCurhatCard />
            <SkeletonCurhatCard />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center border border-[var(--color-paper-border)] rounded-lg bg-[var(--color-surface)]">
            <MessageCircle className="w-8 h-8 text-[var(--color-ink-soft)] mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm text-[var(--color-ink-muted)]">
              Belum ada curhat di kategori ini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="p-5 sm:p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-3 card-interactive animate-fade-in"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[var(--color-ink)]">
                    {item.alias}
                  </span>
                  <span className="text-[var(--color-accent)] font-medium">
                    {item.category}
                  </span>
                </div>

                <blockquote className="text-sm sm:text-base text-[var(--color-ink-muted)] italic leading-relaxed border-l-2 border-[var(--color-paper-border)] pl-3 break-words [overflow-wrap:anywhere]">
                  &ldquo;{item.message}&rdquo;
                </blockquote>

                {item.isAnswered && item.answer && (
                  <div className="p-4 bg-[var(--color-accent-soft)] border border-[var(--color-accent-border)] rounded-md space-y-1 mt-2">
                    <span className="text-xs font-semibold text-[var(--color-accent)] block">
                      Tanggapan Amel:
                    </span>
                    <p className="text-xs sm:text-sm text-[var(--color-ink)] leading-relaxed break-words [overflow-wrap:anywhere]">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
