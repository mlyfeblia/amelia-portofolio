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
  availableDates: { value: string; label: string; count: number }[];
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
  availableDates,
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

      {/* Unified Filters Row: 3 Dropdowns (Status, Topik, Tanggal) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[var(--color-paper-border)] text-xs">
        {/* Status Dropdown */}
        <div className="flex items-center gap-2 bg-[var(--color-paper)] px-3 py-1.5 rounded-xl border border-[var(--color-paper-border)]">
          <Filter className="w-3.5 h-3.5 text-[var(--color-ink-muted)] shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as BookingStatus | 'semua')}
            className="w-full bg-transparent text-xs text-[var(--color-ink)] focus:outline-none cursor-pointer"
          >
            {STATUS_TABS.map((tab) => {
              const count = tab.value === 'semua' ? totalCount : statusCounts[tab.value] || 0;
              return (
                <option key={tab.value} value={tab.value}>
                  Status: {tab.label} ({count})
                </option>
              );
            })}
          </select>
          {statusFilter !== 'semua' && (
            <button
              onClick={() => onStatusChange('semua')}
              className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] p-0.5"
              title="Reset status"
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
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'Semua Topik' ? 'Topik: Semua Topik' : cat}
              </option>
            ))}
          </select>
          {categoryFilter !== 'Semua Topik' && (
            <button
              onClick={() => onCategoryChange('Semua Topik')}
              className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] p-0.5"
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
