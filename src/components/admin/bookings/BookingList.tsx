'use client';

import React, { useRef } from 'react';
import { Calendar, SearchX, RotateCcw, ExternalLink } from 'lucide-react';
import { Booking, BookingStatus } from '@/types';
import { BookingCard } from './BookingCard';
import { SkeletonBookingCard } from '@/components/ui/Skeleton';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { scrollContainerIntoViewIfAbove } from '@/lib/dom-utils';

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
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
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
  currentPage = 1,
  totalPages,
  totalItems,
  itemsPerPage = 6,
  onPageChange,
}: BookingListProps) {
  const listTopRef = useRef<HTMLDivElement>(null);

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
    if (hasActiveFilters) {
      const activeFiltersList: { label: string; value: string }[] = [];
      if (search) activeFiltersList.push({ label: 'Kata Kunci', value: search });
      if (statusFilter !== 'semua') activeFiltersList.push({ label: 'Status', value: statusFilter });
      if (categoryFilter !== 'Semua Topik') activeFiltersList.push({ label: 'Topik', value: categoryFilter });
      if (dateFilter) activeFiltersList.push({ label: 'Tanggal', value: dateFilter });

      return (
        <EmptyState
          icon={<SearchX className="w-6 h-6 stroke-[1.75]" />}
          title="Tidak Ada Janji Temu yang Cocok"
          description="Tidak ditemukan rekaman janji temu yang memenuhi kriteria filter atau kata kunci saat ini. Coba periksa kembali ejaan atau reset filter."
          activeFilters={activeFiltersList}
          action={
            onResetFilters ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onResetFilters();
                }}
                className="btn-secondary btn-interactive inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold cursor-pointer shadow-xs whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span className="sm:hidden">Reset Filter</span>
                <span className="hidden sm:inline">Reset Semua Filter &amp; Pencarian</span>
              </button>
            ) : undefined
          }
        />
      );
    }

    return (
      <EmptyState
        icon={<Calendar className="w-6 h-6 stroke-[1.75]" />}
        title="Belum Ada Janji Temu Terdaftar"
        description="Setiap permohonan sesi konseling yang diajukan oleh konseli melalui formulir reservasi online akan otomatis tercatat dan tersinkronisasi di sini."
        action={
          <a
            href="/schedule"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary btn-interactive inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold cursor-pointer shadow-xs whitespace-nowrap"
          >
            <span className="sm:hidden">Formulir Reservasi</span>
            <span className="hidden sm:inline">Buka Formulir Reservasi Publik</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        }
      />
    );
  }

  const handlePageChange = (newPage: number) => {
    onPageChange?.(newPage);
    scrollContainerIntoViewIfAbove('admin-bookings-list-container', 90);
  };

  return (
    <div ref={listTopRef} id="admin-bookings-list-container" className="space-y-4 scroll-mt-24">
      <div key={currentPage} className="space-y-3.5 sm:space-y-4 pagination-slide-enter">
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

      {totalPages && totalPages >= 1 && onPageChange && (
        <PaginationBar
          currentPage={currentPage || 1}
          totalPages={totalPages}
          totalItems={totalItems || bookings.length}
          itemsPerPage={itemsPerPage || 6}
          itemLabel="janji temu"
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
