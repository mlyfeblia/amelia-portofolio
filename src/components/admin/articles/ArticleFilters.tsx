'use client';

import React from 'react';
import { Search, X, Eye, Filter, Calendar, RotateCcw } from 'lucide-react';
import { useSearchShortcut } from '@/lib/use-search-shortcut';

interface ArticleFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'semua' | 'published' | 'draft';
  onStatusChange: (st: 'semua' | 'published' | 'draft') => void;
  landingFilter: 'semua' | 'landing';
  onLandingFilterChange: (l: 'semua' | 'landing') => void;
  onStatusAndLandingChange?: (st: 'semua' | 'published' | 'draft', landing: 'semua' | 'landing') => void;
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
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
}

export function ArticleFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  landingFilter,
  onLandingFilterChange,
  onStatusAndLandingChange,
  selectedCategory,
  onSelectCategory,
  dateFilter,
  onDateChange,
  availableDates,
  categories,
  counts,
  hasActiveFilters = false,
  onResetFilters,
}: ArticleFiltersProps) {
  const searchInputRef = useSearchShortcut();

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl p-3.5 sm:p-5 space-y-3.5 shadow-xs">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[var(--color-ink-muted)] search-icon" />
        <input
          ref={searchInputRef}
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onSearchChange('');
              e.currentTarget.blur();
            }
          }}
          placeholder="Cari judul artikel, topik kategori, slug URL, atau tag..."
          className="search-input w-full pl-9 pr-9 py-2 text-xs sm:text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]/70"
        />
        {!search && (
          <div className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none items-center">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-ink-soft)] bg-[var(--color-paper-muted)] border border-[var(--color-paper-border)] rounded shadow-2xs">
              /
            </kbd>
          </div>
        )}
        {search && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSearchChange('');
            }}
            className="search-clear-btn text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] rounded-lg cursor-pointer"
            aria-label="Bersihkan pencarian"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Active Filters Toolbar Indicator & Quick Reset with Smooth Enter & Exit */}
      <div
        className={`grid transition-all duration-300 ease-out overflow-hidden ${
          hasActiveFilters
            ? 'grid-rows-[1fr] opacity-100 pt-2 border-t border-[var(--color-paper-border)]'
            : 'grid-rows-[0fr] opacity-0 pt-0 border-t-0 pointer-events-none'
        }`}
        aria-hidden={!hasActiveFilters}
      >
        <div className="min-h-0 overflow-hidden flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center text-[var(--color-ink-muted)]">
            <span className="font-medium text-[var(--color-ink)]">Filter Aktif Diterapkan</span>
          </div>
          {onResetFilters && (
            <button
              type="button"
              tabIndex={hasActiveFilters ? 0 : -1}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onResetFilters();
              }}
              className="btn-interactive inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-[var(--color-accent)] bg-[var(--color-accent-soft)] hover:bg-[var(--color-accent-border)]/50 transition-colors cursor-pointer shadow-2xs active:scale-95"
              title="Reset semua kriteria filter dan pencarian ke bawaan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Semua Filter</span>
            </button>
          )}
        </div>
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
              if (onStatusAndLandingChange) {
                if (val === 'landing') {
                  onStatusAndLandingChange('semua', 'landing');
                } else {
                  onStatusAndLandingChange(val as 'semua' | 'published' | 'draft', 'semua');
                }
              } else {
                if (val === 'landing') {
                  onLandingFilterChange('landing');
                  onStatusChange('semua');
                } else {
                  onLandingFilterChange('semua');
                  onStatusChange(val as 'semua' | 'published' | 'draft');
                }
              }
            }}
            className="w-full bg-transparent text-xs text-[var(--color-ink)] focus:outline-none cursor-pointer"
            aria-label="Filter status publikasi dan beranda"
          >
            <option value="semua">
              Status: Semua{counts.total > 0 ? ` (${counts.total})` : ''}
            </option>
            <option value="published">
              Status: Publik{counts.published > 0 ? ` (${counts.published})` : ''}
            </option>
            <option value="draft">
              Status: Draf / Tersembunyi{counts.draft > 0 ? ` (${counts.draft})` : ''}
            </option>
            <option value="landing">
              Tampilan: ★ Di Beranda{counts.landingCount > 0 ? ` (${counts.landingCount})` : ''}
            </option>
          </select>
          {(statusFilter !== 'semua' || landingFilter === 'landing') && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onStatusAndLandingChange) {
                  onStatusAndLandingChange('semua', 'semua');
                } else {
                  onStatusChange('semua');
                  onLandingFilterChange('semua');
                }
              }}
              className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] p-0.5 cursor-pointer"
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
            aria-label="Filter topik artikel"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'Semua' ? 'Topik: Semua Topik' : cat}
              </option>
            ))}
          </select>
          {selectedCategory !== 'Semua' && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectCategory('Semua');
              }}
              className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] p-0.5 cursor-pointer"
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
            aria-label="Filter tanggal rilis artikel"
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDateChange('');
              }}
              className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] p-0.5 cursor-pointer"
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
