'use client';

import React from 'react';
import { Search, X, Eye, Filter, Calendar } from 'lucide-react';

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
          onKeyDown={(e) => {
            if (e.key === 'Escape') onSearchChange('');
          }}
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

      {/* Unified Filters Row: 3 Dropdowns (Status & Tampilan, Kategori, Tanggal Rilis) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[var(--color-paper-border)] text-xs">
        {/* 1. Status Publikasi & Beranda Dropdown */}
        <div className="flex items-center gap-2 bg-[var(--color-paper)] px-3 py-1.5 rounded-xl border border-[var(--color-paper-border)]">
          <Eye className="w-3.5 h-3.5 text-[var(--color-ink-muted)] shrink-0" />
          <select
            value={landingFilter === 'landing' ? 'landing' : statusFilter}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'landing') {
                onLandingFilterChange('landing');
                onStatusChange('semua');
              } else {
                onLandingFilterChange('semua');
                onStatusChange(val as 'semua' | 'published' | 'draft');
              }
            }}
            className="w-full bg-transparent text-xs text-[var(--color-ink)] focus:outline-none cursor-pointer"
          >
            <option value="semua">Status: Semua ({counts.total})</option>
            <option value="published">Status: Publik ({counts.published})</option>
            <option value="draft">Status: Draf / Tersembunyi ({counts.draft})</option>
            <option value="landing">Tampilan: ★ Di Beranda ({counts.landingCount})</option>
          </select>
          {(statusFilter !== 'semua' || landingFilter === 'landing') && (
            <button
              onClick={() => {
                onStatusChange('semua');
                onLandingFilterChange('semua');
              }}
              className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] p-0.5"
              title="Reset filter status"
              type="button"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. Category Dropdown */}
        <div className="flex items-center gap-2 bg-[var(--color-paper)] px-3 py-1.5 rounded-xl border border-[var(--color-paper-border)]">
          <Filter className="w-3.5 h-3.5 text-[var(--color-ink-muted)] shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="w-full bg-transparent text-xs text-[var(--color-ink)] focus:outline-none cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'Semua' ? 'Topik: Semua Topik' : cat}
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

        {/* 3. Date Dropdown / Clear */}
        <div className="flex items-center gap-2 bg-[var(--color-paper)] px-3 py-1.5 rounded-xl border border-[var(--color-paper-border)]">
          <Calendar className="w-3.5 h-3.5 text-[var(--color-ink-muted)] shrink-0" />
          <select
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full bg-transparent text-xs text-[var(--color-ink)] focus:outline-none cursor-pointer"
          >
            <option value="">Tanggal: Semua</option>
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
  );
}
