'use client';

import React from 'react';
import { Search, X, Filter, Calendar } from 'lucide-react';
import { BookingStatus } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';

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
        <Search className="w-4 h-4 text-[var(--color-ink-muted)] search-icon" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onSearchChange('');
          }}
          placeholder="Cari nama, kode referensi, WhatsApp, email, atau topik..."
          className="search-input w-full pl-9 pr-9 py-2 text-xs sm:text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]/70"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="search-clear-btn text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] rounded-lg cursor-pointer"
            aria-label="Bersihkan pencarian"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Status Tabs */}
      <div className="pt-2 border-t border-[var(--color-paper-border)]">
        <Tabs
          value={statusFilter}
          onValueChange={(val) => onStatusChange(val as BookingStatus | 'semua')}
        >
          <TabsList aria-label="Filter status janji temu">
            {STATUS_TABS.map((tab) => {
              const count = tab.value === 'semua' ? totalCount : statusCounts[tab.value] || 0;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  badge={
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        statusFilter === tab.value
                          ? 'bg-white/20 text-white font-bold'
                          : 'bg-[var(--color-paper-muted)] text-[var(--color-ink-muted)]'
                      }`}
                    >
                      {count}
                    </span>
                  }
                >
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Secondary Filters: Topik & Tanggal Dropdowns */}
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
                {cat === 'Semua Topik' ? 'Topik: Semua Topik' : cat}
              </option>
            ))}
          </select>
          {categoryFilter !== 'Semua Topik' && (
            <button
              onClick={() => onCategoryChange('Semua Topik')}
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
