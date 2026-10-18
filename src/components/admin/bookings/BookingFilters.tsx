'use client';

import React from 'react';
import { Search, X, Filter, Calendar, ListFilter, RotateCcw } from 'lucide-react';
import { BookingStatus } from '@/types';
import { useSearchShortcut } from '@/lib/use-search-shortcut';

const STATUS_OPTIONS: { label: string; value: BookingStatus | 'semua' }[] = [
  { label: 'Semua', value: 'semua' },
  { label: 'Menunggu', value: 'menunggu' },
  { label: 'Terkonfirmasi', value: 'terkonfirmasi' },
  { label: 'Selesai', value: 'selesai' },
  { label: 'Dibatalkan', value: 'dibatalkan' },
];

interface BookingFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: BookingStatus | 'semua';
  onStatusChange: (st: BookingStatus | 'semua') => void;
  categoryFilter: string;
  onCategoryChange: (cat: string) => void;
  dateFilter: string;
  onDateChange: (d: string) => void;
  availableDates: { value: string; label: string; count: number }[];
  categories: string[];
  statusCounts: Record<string, number>;
  totalCount: number;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
}

export function BookingFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  dateFilter,
  onDateChange,
  availableDates,
  categories,
  statusCounts,
  totalCount,
  hasActiveFilters = false,
  onResetFilters,
}: BookingFiltersProps) {
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
          placeholder="Cari nama, kode referensi, WhatsApp, email, atau topik..."
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

      {/* 3-Column Dropdown Filters: Status, Topik & Tanggal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[var(--color-paper-border)] text-xs">
        {/* Status Dropdown */}
        <div className="flex items-center gap-2 bg-[var(--color-paper)] px-3 py-1.5 rounded-xl border border-[var(--color-paper-border)]">
          <ListFilter className="w-3.5 h-3.5 text-[var(--color-ink-muted)] shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as BookingStatus | 'semua')}
            className="w-full bg-transparent text-xs text-[var(--color-ink)] focus:outline-none cursor-pointer"
            aria-label="Filter status janji temu"
          >
            {STATUS_OPTIONS.map((opt) => {
              const count = opt.value === 'semua' ? totalCount : statusCounts[opt.value] || 0;
              return (
                <option key={opt.value} value={opt.value}>
                  Status: {opt.label}{count > 0 ? ` (${count})` : ''}
                </option>
              );
            })}
          </select>
          {statusFilter !== 'semua' && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onStatusChange('semua');
              }}
              className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] p-0.5 cursor-pointer"
              title="Reset status ke Semua"
              type="button"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2 bg-[var(--color-paper)] px-3 py-1.5 rounded-xl border border-[var(--color-paper-border)]">
          <Filter className="w-3.5 h-3.5 text-[var(--color-ink-muted)] shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-transparent text-xs text-[var(--color-ink)] focus:outline-none cursor-pointer"
            aria-label="Filter topik konseling"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'Semua Topik' ? 'Topik: Semua Topik' : cat}
              </option>
            ))}
          </select>
          {categoryFilter !== 'Semua Topik' && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCategoryChange('Semua Topik');
              }}
              className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] p-0.5 cursor-pointer"
              title="Reset pilihan topik"
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
            aria-label="Filter tanggal janji temu"
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
