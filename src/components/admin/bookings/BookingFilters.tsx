'use client';

import React from 'react';
import { Search, X, Filter, Calendar } from 'lucide-react';
import { BookingStatus } from '@/types';

const STATUS_TABS: { label: string; value: BookingStatus | 'semua' }[] = [
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
  categories: string[];
  statusCounts: Record<string, number>;
  totalCount: number;
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
  categories,
  statusCounts,
  totalCount,
}: BookingFiltersProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl p-3.5 sm:p-5 space-y-3.5 shadow-xs">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[var(--color-ink-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama, kode referensi, WhatsApp, email, atau topik..."
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

      {/* Status Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-t border-[var(--color-paper-border)] pt-2.5">
        {STATUS_TABS.map((tab) => {
          const count = tab.value === 'semua' ? totalCount : statusCounts[tab.value] || 0;
          const isActive = statusFilter === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => onStatusChange(tab.value)}
              type="button"
              className={`chip-interactive inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[var(--color-accent)] text-white shadow-xs font-semibold'
                  : 'bg-[var(--color-paper)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] border border-[var(--color-paper-border)]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-[var(--color-paper-muted)] text-[var(--color-ink-muted)]'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Filters: Category & Date on Mobile/Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[var(--color-paper-border)] text-xs">
        {/* Category Dropdown */}
        <div className="flex items-center gap-2 bg-[var(--color-paper)] px-3 py-1.5 rounded-xl border border-[var(--color-paper-border)]">
          <Filter className="w-3.5 h-3.5 text-[var(--color-ink-muted)] shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-transparent text-xs text-[var(--color-ink)] focus:outline-none cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Date Input / Clear */}
        <div className="flex items-center gap-2 bg-[var(--color-paper)] px-3 py-1.5 rounded-xl border border-[var(--color-paper-border)]">
          <Calendar className="w-3.5 h-3.5 text-[var(--color-ink-muted)] shrink-0" />
          <input
            type="text"
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
            placeholder="Filter tanggal (misal: 2026-10 atau Oktober)..."
            className="w-full bg-transparent text-xs text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]/70 focus:outline-none"
          />
          {dateFilter && (
            <button
              onClick={() => onDateChange('')}
              className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] p-0.5"
              title="Hapus filter tanggal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
