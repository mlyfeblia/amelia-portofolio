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
  if (!booking) return null;

  return (
    <ConfirmDecisionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => onConfirm(booking)}
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
              {booking.name}
            </strong>{' '}
            (
            <code className="text-[var(--color-accent)] font-semibold break-all">
              {booking.code}
            </code>
            ) akan dihapus secara permanen.
          </p>
          <div className="pt-2 border-t border-[var(--color-paper-border)]/60 space-y-1 text-[11px]">
            <div className="break-words">
              <strong className="text-[var(--color-ink)] font-medium">Jadwal:</strong>{' '}
              {booking.date} ({booking.timeSlot})
            </div>
            <div className="break-words">
              <strong className="text-[var(--color-ink)] font-medium">Topik:</strong>{' '}
              {booking.category}
            </div>
          </div>
        </div>
      }
    />
  );
}
