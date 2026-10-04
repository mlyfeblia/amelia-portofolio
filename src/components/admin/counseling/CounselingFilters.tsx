'use client';

import React from 'react';
import { Search, X, Eye, EyeOff } from 'lucide-react';

interface CounselingFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: 'semua' | 'unanswered' | 'answered';
  onStatusChange: (st: 'semua' | 'unanswered' | 'answered') => void;
  visibilityFilter: 'semua' | 'public' | 'private';
  onVisibilityChange: (vis: 'semua' | 'public' | 'private') => void;
  categoryFilter: string;
  onCategoryChange: (cat: string) => void;
  categories: string[];
  counts: {
    total: number;
    unanswered: number;
    answered: number;
    publicCount: number;
    privateCount: number;
  };
}

export function CounselingFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  visibilityFilter,
  onVisibilityChange,
  categoryFilter,
  onCategoryChange,
  categories,
  counts,
}: CounselingFiltersProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl p-3.5 sm:p-5 space-y-3.5 shadow-xs">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[var(--color-ink-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama/alias, kategori topik, isi curhat, atau jawaban..."
          className="w-full pl-9 pr-9 py-2 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-xs sm:text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]/70 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent-soft)]"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] p-0.5 cursor-pointer"
            aria-label="Bersihkan pencarian"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Row 1: Status Respons & Visibilitas Publik */}
      <div className="pt-2 border-t border-[var(--color-paper-border)] space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Status Respon Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            <span className="text-[11px] font-medium text-[var(--color-ink-muted)] shrink-0 mr-1">
              Status:
            </span>
            <button
              onClick={() => onStatusChange('semua')}
              type="button"
              className={`chip-interactive px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer shrink-0 whitespace-nowrap ${
                statusFilter === 'semua'
                  ? 'bg-[var(--color-accent)] text-white shadow-xs font-semibold'
                  : 'bg-[var(--color-paper)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] border border-[var(--color-paper-border)]'
              }`}
            >
              Semua ({counts.total})
            </button>
            <button
              onClick={() => onStatusChange('unanswered')}
              type="button"
              className={`chip-interactive px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer shrink-0 whitespace-nowrap ${
                statusFilter === 'unanswered'
                  ? 'bg-rose-600 text-white shadow-xs font-semibold'
                  : 'bg-[var(--color-paper)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] border border-[var(--color-paper-border)]'
              }`}
            >
              Belum Dibalas ({counts.unanswered})
            </button>
            <button
              onClick={() => onStatusChange('answered')}
              type="button"
              className={`chip-interactive px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer shrink-0 whitespace-nowrap ${
                statusFilter === 'answered'
                  ? 'bg-[var(--color-accent)] text-white shadow-xs font-semibold'
                  : 'bg-[var(--color-paper)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] border border-[var(--color-paper-border)]'
              }`}
            >
              Sudah Dijawab ({counts.answered})
            </button>
          </div>

          {/* Visibility Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            <span className="text-[11px] font-medium text-[var(--color-ink-muted)] shrink-0 mr-1">
              Visibilitas:
            </span>
            <button
              onClick={() => onVisibilityChange('semua')}
              type="button"
              className={`chip-interactive px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer shrink-0 whitespace-nowrap ${
                visibilityFilter === 'semua'
                  ? 'bg-[var(--color-ink)] text-white shadow-xs font-semibold'
                  : 'bg-[var(--color-paper)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] border border-[var(--color-paper-border)]'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => onVisibilityChange('public')}
              type="button"
              className={`chip-interactive inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer shrink-0 whitespace-nowrap ${
                visibilityFilter === 'public'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'bg-[var(--color-paper)] text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Publik ({counts.publicCount})</span>
            </button>
            <button
              onClick={() => onVisibilityChange('private')}
              type="button"
              className={`chip-interactive inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer shrink-0 whitespace-nowrap ${
                visibilityFilter === 'private'
                  ? 'bg-zinc-700 text-white shadow-xs font-semibold'
                  : 'bg-[var(--color-paper)] text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
              }`}
            >
              <EyeOff className="w-3 h-3" />
              <span>Privat ({counts.privateCount})</span>
            </button>
          </div>
        </div>

        {/* Row 2: Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1.5 border-t border-[var(--color-paper-border)]">
          <span className="text-[11px] font-medium text-[var(--color-ink-muted)] shrink-0 mr-1">
            Topik:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              type="button"
              className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap cursor-pointer transition-colors shrink-0 ${
                categoryFilter === cat
                  ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-semibold border border-[var(--color-accent-border)]'
                  : 'bg-[var(--color-paper)] text-[var(--color-ink-muted)] border border-transparent hover:bg-[var(--color-paper-muted)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
