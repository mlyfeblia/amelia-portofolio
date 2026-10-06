'use client';

import React from 'react';
import { Search, X, Eye, EyeOff, Filter, Calendar } from 'lucide-react';

interface ArticleFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'semua' | 'published' | 'draft';
  onStatusChange: (st: 'semua' | 'published' | 'draft') => void;
  landingFilter: 'semua' | 'landing';
  onLandingFilterChange: (l: 'semua' | 'landing') => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  dateFilter: string;
  onDateChange: (d: string) => void;
  availableDates: { value: string; label: string; count: number }[];
  categories: string[];
  counts: {
    total: number;
    published: number;
    draft: number;
    landingCount: number;
  };
}

export function ArticleFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  landingFilter,
  onLandingFilterChange,
  selectedCategory,
  onSelectCategory,
  dateFilter,
  onDateChange,
  availableDates,
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

      {/* Row: Status Publikasi, Landing Page & Kategori */}
      <div className="pt-2 border-t border-[var(--color-paper-border)] space-y-2.5">
        {/* Status Publikasi & Landing Page Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <span className="text-[11px] font-medium text-[var(--color-ink-muted)] shrink-0 mr-1">
            Status:
          </span>
          <button
            onClick={() => onStatusChange('semua')}
            type="button"
            className={`chip-interactive px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer shrink-0 whitespace-nowrap ${
              statusFilter === 'semua' && landingFilter !== 'landing'
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
              statusFilter === 'published' && landingFilter !== 'landing'
                ? 'bg-[var(--color-accent)] text-white shadow-xs font-semibold'
                : 'bg-[var(--color-paper)] text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] border border-[var(--color-accent-border)]'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Publik ({counts.published})</span>
          </button>
          <button
            onClick={() => onStatusChange('draft')}
            type="button"
            className={`chip-interactive inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer shrink-0 whitespace-nowrap ${
              statusFilter === 'draft' && landingFilter !== 'landing'
                ? 'bg-[var(--color-ink)] text-white shadow-xs font-semibold'
                : 'bg-[var(--color-paper)] text-[var(--color-ink-muted)] hover:bg-[var(--color-paper-muted)] border border-[var(--color-paper-border)]'
            }`}
          >
            <EyeOff className="w-3 h-3" />
            <span>Draf / Tersembunyi ({counts.draft})</span>
          </button>

          <span className="text-[var(--color-paper-border)] select-none shrink-0 mx-0.5">|</span>

          {/* Landing Showcase Filter Button */}
          <button
            onClick={() => onLandingFilterChange(landingFilter === 'landing' ? 'semua' : 'landing')}
            type="button"
            className={`chip-interactive inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer shrink-0 whitespace-nowrap transition-colors ${
              landingFilter === 'landing'
                ? 'bg-amber-500 text-white shadow-xs font-bold'
                : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
            }`}
            title="Filter artikel yang disorot tampil di beranda utama (fleksibel sesuai kurasi admin)"
          >
            <span className={landingFilter === 'landing' ? 'text-white' : 'text-amber-500'}>★</span>
            <span>Di Beranda ({counts.landingCount})</span>
          </button>
        </div>

        {/* Row 2: Secondary Dropdowns (Kategori & Tanggal Rilis) matching bookings style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[var(--color-paper-border)] text-xs">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2 bg-[var(--color-paper)] px-3 py-1.5 rounded-xl border border-[var(--color-paper-border)]">
            <Filter className="w-3.5 h-3.5 text-[var(--color-ink-muted)] shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
              className="w-full bg-transparent text-xs text-[var(--color-ink)] focus:outline-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'Semua' ? 'Semua Topik' : cat}
                </option>
              ))}
            </select>
            {selectedCategory !== 'Semua' && (
              <button
                onClick={() => onSelectCategory('Semua')}
                className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] p-0.5"
                title="Reset pilihan kategori"
                type="button"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Dropdown / Clear */}
          <div className="flex items-center gap-2 bg-[var(--color-paper)] px-3 py-1.5 rounded-xl border border-[var(--color-paper-border)]">
            <Calendar className="w-3.5 h-3.5 text-[var(--color-ink-muted)] shrink-0" />
            <select
              value={dateFilter}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full bg-transparent text-xs text-[var(--color-ink)] focus:outline-none cursor-pointer"
            >
              <option value="">Semua Tanggal</option>
              {availableDates.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label} ({item.count})
                </option>
              ))}
            </select>
            {dateFilter && (
              <button
                onClick={() => onDateChange('')}
                className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] p-0.5"
                title="Hapus filter tanggal"
                type="button"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
