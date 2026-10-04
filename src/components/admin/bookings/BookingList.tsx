'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { Booking, BookingStatus } from '@/types';
import { BookingCard } from './BookingCard';
import { SkeletonBookingCard } from '@/components/ui/Skeleton';

interface BookingListProps {
  bookings: Booking[];
  loading: boolean;
  updatingId: string | null;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  onDelete: (booking: Booking) => void;
}

export function BookingList({
  bookings,
  loading,
  updatingId,
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
      <div className="p-8 sm:p-12 text-center bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl text-xs text-[var(--color-ink-muted)] space-y-2">
        <Calendar className="w-8 h-8 text-[var(--color-ink-muted)]/50 mx-auto mb-1" />
        <p className="font-semibold text-sm text-[var(--color-ink)]">Tidak ada janji temu ditemukan</p>
        <p>Coba sesuaikan kata kunci pencarian atau filter status yang dipilih.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 sm:space-y-4">
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
