'use client';

import React from 'react';
import { Calendar, SearchX, RotateCcw } from 'lucide-react';
import { Booking, BookingStatus } from '@/types';
import { BookingCard } from './BookingCard';
import { SkeletonBookingCard } from '@/components/ui/Skeleton';

interface BookingListProps {
  bookings: Booking[];
  loading: boolean;
  updatingId: string | null;
  search?: string;
  statusFilter?: BookingStatus | 'semua';
  categoryFilter?: string;
  dateFilter?: string;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  onDelete: (booking: Booking) => void;
}

export function BookingList({
  bookings,
  loading,
  updatingId,
  search,
  statusFilter = 'semua',
  categoryFilter = 'Semua Topik',
  dateFilter,
  hasActiveFilters,
  onResetFilters,
  onUpdateStatus,
  onDelete,
}: BookingListProps) {
  if (loading) {
    return (
      <div className="space-y-3.5 sm:space-y-4">
        <SkeletonBookingCard />
        <SkeletonBookingCard />
        <SkeletonBookingCard />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl text-xs text-[var(--color-ink-muted)] space-y-3 tab-content-enter">
        {hasActiveFilters ? (
          <>
            <div className="w-12 h-12 rounded-full bg-[var(--color-paper-muted)] text-[var(--color-ink-muted)] mx-auto flex items-center justify-center">
              <SearchX className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-sm text-[var(--color-ink)]">
                Tidak ada janji temu yang cocok
              </p>
              <p className="max-w-md mx-auto leading-relaxed">
                {search ? (
                  <>
                    Tidak ditemukan hasil untuk kata kunci <span className="font-semibold text-[var(--color-ink)]">&ldquo;{search}&rdquo;</span>.
                  </>
                ) : (
                  'Tidak ada janji temu yang memenuhi kriteria filter saat ini.'
                )}
                {statusFilter !== 'semua' && (
                  <span className="block mt-0.5 text-[11px] text-[var(--color-ink-soft)]">
                    Filter status: &ldquo;{statusFilter}&rdquo;
                  </span>
                )}
                {categoryFilter !== 'Semua Topik' && (
                  <span className="block mt-0.5 text-[11px] text-[var(--color-ink-soft)]">
                    Filter topik: &ldquo;{categoryFilter}&rdquo;
                  </span>
                )}
                {dateFilter && (
                  <span className="block mt-0.5 text-[11px] text-[var(--color-ink-soft)]">
                    Filter tanggal: &ldquo;{dateFilter}&rdquo;
                  </span>
                )}
              </p>
            </div>
            {onResetFilters && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="btn-secondary btn-interactive inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Semua Filter &amp; Pencarian</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <Calendar className="w-8 h-8 text-[var(--color-ink-muted)]/50 mx-auto mb-1" />
            <p className="font-semibold text-sm text-[var(--color-ink)]">Belum ada janji temu terdaftar</p>
            <p>Setiap pengajuan janji temu dari konseli akan otomatis muncul di sini.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3.5 sm:space-y-4 tab-content-enter">
      {bookings.map((item) => (
        <BookingCard
          key={item.id}
          item={item}
          isUpdating={updatingId === item.id}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
