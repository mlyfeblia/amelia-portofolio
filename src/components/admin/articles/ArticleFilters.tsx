'use client';

import React from 'react';
import { Search, X, Eye, EyeOff } from 'lucide-react';

interface ArticleFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'semua' | 'published' | 'draft';
  onStatusChange: (st: 'semua' | 'published' | 'draft') => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: string[];
  counts: {
    total: number;
    published: number;
    draft: number;
  };
}

export function ArticleFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  selectedCategory,
  onSelectCategory,
  categories,
  counts,
}: ArticleFiltersProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl p-3.5 sm:p-5 space-y-3.5 shadow-xs">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[var(--color-ink-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari judul artikel, topik kategori, slug URL, atau tag..."
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

      {/* Row: Status Publikasi & Kategori */}
      <div className="pt-2 border-t border-[var(--color-paper-border)] space-y-2.5">
        {/* Status Publikasi Tabs */}
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
            onClick={() => onStatusChange('published')}
            type="button"
            className={`chip-interactive inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer shrink-0 whitespace-nowrap ${
              statusFilter === 'published'
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'bg-[var(--color-paper)] text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Publik ({counts.published})</span>
          </button>
          <button
            onClick={() => onStatusChange('draft')}
            type="button"
            className={`chip-interactive inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer shrink-0 whitespace-nowrap ${
              statusFilter === 'draft'
                ? 'bg-zinc-700 text-white shadow-xs font-semibold'
                : 'bg-[var(--color-paper)] text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            <EyeOff className="w-3 h-3" />
            <span>Draf / Tersembunyi ({counts.draft})</span>
          </button>
        </div>

        {/* Categories Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1.5 border-t border-[var(--color-paper-border)]">
          <span className="text-[11px] font-medium text-[var(--color-ink-muted)] shrink-0 mr-1">
            Kategori:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              type="button"
              className={`chip-interactive px-2.5 py-1 rounded-lg text-xs whitespace-nowrap cursor-pointer shrink-0 ${
                selectedCategory === cat
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
