'use client';

import React from 'react';
import { Booking } from '@/types';
import { ConfirmDecisionModal } from '@/components/ui/ConfirmDecisionModal';

export interface BookingDeleteModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (booking: Booking) => Promise<void>;
}

export function BookingDeleteModal({
  booking,
  isOpen,
  onClose,
  onConfirm,
}: BookingDeleteModalProps) {
  // Retain active booking during exit transition without sudden unmount
  const [cachedBooking, setCachedBooking] = React.useState<Booking | null>(booking);
  if (booking && booking !== cachedBooking) {
    setCachedBooking(booking);
  }
  const activeBooking = booking ?? cachedBooking;

  if (!activeBooking) return null;

  return (
    <ConfirmDecisionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => onConfirm(activeBooking)}
      variant="danger"
      title="Hapus Janji Temu?"
      description="Penghapusan data reservasi konseli."
      confirmLabel="Ya, Hapus"
      cancelLabel="Batal"
      itemDetail={
        <div className="space-y-2">
          <p className="leading-relaxed break-words">
            Data janji temu konseli{' '}
            <strong className="text-[var(--color-ink)] font-semibold break-words">
              {activeBooking.name}
            </strong>{' '}
            (
            <code className="text-[var(--color-accent)] font-semibold break-all">
              {activeBooking.code}
            </code>
            ) akan dihapus secara permanen.
          </p>
          <div className="pt-2 border-t border-[var(--color-paper-border)]/60 space-y-1 text-[11px]">
            <div className="break-words">
              <strong className="text-[var(--color-ink)] font-medium">Jadwal:</strong>{' '}
              {activeBooking.date} ({activeBooking.timeSlot})
            </div>
            <div className="break-words">
              <strong className="text-[var(--color-ink)] font-medium">Topik:</strong>{' '}
              {activeBooking.category}
            </div>
          </div>
        </div>
      }
    />
  );
}
