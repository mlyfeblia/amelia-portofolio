'use client';

import React from 'react';
import { Search, X, Eye, EyeOff, Star } from 'lucide-react';

interface CounselingFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: 'semua' | 'unanswered' | 'answered';
  onStatusChange: (st: 'semua' | 'unanswered' | 'answered') => void;
  visibilityFilter: 'semua' | 'public' | 'private';
  onVisibilityChange: (vis: 'semua' | 'public' | 'private') => void;
  landingFilter: 'semua' | 'landing';
  onLandingFilterChange: (l: 'semua' | 'landing') => void;
  categoryFilter: string;
  onCategoryChange: (cat: string) => void;
  categories: string[];
  counts: {
    total: number;
    unanswered: number;
    answered: number;
    publicCount: number;
    privateCount: number;
    landingCount: number;
  };
}

export function CounselingFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  visibilityFilter,
  onVisibilityChange,
  landingFilter,
  onLandingFilterChange,
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
          placeholder="Cari nama/alias, kategori topik, isi curhat, atau tanggapan..."
          className="search-input w-full pl-9 pr-9 py-2 text-xs sm:text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]/70"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="chip-interactive absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] p-1 rounded-lg cursor-pointer"
            aria-label="Bersihkan pencarian"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Row 1: Status Respons, Visibilitas & Landing Page */}
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
                  ? 'bg-[var(--color-error)] text-white shadow-xs font-semibold'
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

          {/* Visibility & Landing Page Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {/* Landing Filter */}
            <button
              onClick={() => onLandingFilterChange(landingFilter === 'landing' ? 'semua' : 'landing')}
              type="button"
              className={`chip-interactive inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer shrink-0 whitespace-nowrap transition-colors ${
                landingFilter === 'landing'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
              }`}
              title="Filter curhat yang disorot tampil di beranda utama (fleksibel sesuai kurasi admin)"
            >
              <Star className={`w-3.5 h-3.5 ${landingFilter === 'landing' ? 'fill-white text-white' : 'fill-amber-500 text-amber-600'}`} />
              <span>★ Di Beranda ({counts.landingCount})</span>
            </button>

            <span className="text-[var(--color-paper-border)] select-none">|</span>

            <button
              onClick={() => onVisibilityChange('semua')}
              type="button"
              className={`chip-interactive px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer shrink-0 whitespace-nowrap ${
                visibilityFilter === 'semua' && landingFilter !== 'landing'
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
                  ? 'bg-[var(--color-accent)] text-white shadow-xs font-semibold'
                  : 'bg-[var(--color-paper)] text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] border border-[var(--color-accent-border)]'
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
                  ? 'bg-[var(--color-ink)] text-white shadow-xs font-semibold'
                  : 'bg-[var(--color-paper)] text-[var(--color-ink-muted)] hover:bg-[var(--color-paper-muted)] border border-[var(--color-paper-border)]'
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
