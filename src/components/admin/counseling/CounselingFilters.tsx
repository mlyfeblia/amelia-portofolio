'use client';

import React from 'react';
import { Search, X, Eye, Filter, Calendar } from 'lucide-react';

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
  dateFilter: string;
  onDateChange: (d: string) => void;
  availableDates: { value: string; label: string; count: number }[];
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
  dateFilter,
  onDateChange,
  availableDates,
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
          onKeyDown={(e) => {
            if (e.key === 'Escape') onSearchChange('');
          }}
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

      {/* Unified Filters Grid: 4 Dropdowns (Status Balasan, Visibilitas/Beranda, Topik, Tanggal) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-[var(--color-paper-border)] text-xs">
        {/* 1. Status Balasan Dropdown */}
        <div className="flex items-center gap-2 bg-[var(--color-paper)] px-3 py-1.5 rounded-xl border border-[var(--color-paper-border)]">
          <Filter className="w-3.5 h-3.5 text-[var(--color-ink-muted)] shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as 'semua' | 'unanswered' | 'answered')}
            className="w-full bg-transparent text-xs text-[var(--color-ink)] focus:outline-none cursor-pointer"
          >
            <option value="semua">Status: Semua ({counts.total})</option>
            <option value="unanswered">Status: Belum Dibalas ({counts.unanswered})</option>
            <option value="answered">Status: Sudah Dijawab ({counts.answered})</option>
          </select>
          {statusFilter !== 'semua' && (
            <button
              onClick={() => onStatusChange('semua')}
              className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] p-0.5"
              title="Reset status balasan"
              type="button"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. Visibilitas & Beranda Dropdown */}
        <div className="flex items-center gap-2 bg-[var(--color-paper)] px-3 py-1.5 rounded-xl border border-[var(--color-paper-border)]">
          <Eye className="w-3.5 h-3.5 text-[var(--color-ink-muted)] shrink-0" />
          <select
            value={landingFilter === 'landing' ? 'landing' : visibilityFilter}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'landing') {
                onLandingFilterChange('landing');
                onVisibilityChange('semua');
              } else {
                onLandingFilterChange('semua');
                onVisibilityChange(val as 'semua' | 'public' | 'private');
              }
            }}
            className="w-full bg-transparent text-xs text-[var(--color-ink)] focus:outline-none cursor-pointer"
          >
            <option value="semua">Tampilan: Semua</option>
            <option value="public">Tampilan: Publik ({counts.publicCount})</option>
            <option value="private">Tampilan: Privat ({counts.privateCount})</option>
            <option value="landing">Tampilan: ★ Di Beranda ({counts.landingCount})</option>
          </select>
          {(visibilityFilter !== 'semua' || landingFilter === 'landing') && (
            <button
              onClick={() => {
                onVisibilityChange('semua');
                onLandingFilterChange('semua');
              }}
              className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] p-0.5"
              title="Reset filter tampilan"
              type="button"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 3. Topik Dropdown */}
        <div className="flex items-center gap-2 bg-[var(--color-paper)] px-3 py-1.5 rounded-xl border border-[var(--color-paper-border)]">
          <Filter className="w-3.5 h-3.5 text-[var(--color-ink-muted)] shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-transparent text-xs text-[var(--color-ink)] focus:outline-none cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'Semua' ? 'Topik: Semua Topik' : cat}
              </option>
            ))}
          </select>
          {categoryFilter !== 'Semua' && (
            <button
              onClick={() => onCategoryChange('Semua')}
              className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] p-0.5"
              title="Reset pilihan topik"
              type="button"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 4. Tanggal Dropdown */}
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
