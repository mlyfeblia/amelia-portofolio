'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { getBookingConfirmationWhatsAppUrl } from '@/lib/whatsapp';

interface BookingSuccessCardProps {
  success: {
    code: string;
    name: string;
    alias?: string;
    date: string;
    slot: string;
  };
  onReset: () => void;
}

export function BookingSuccessCard({ success, onReset }: BookingSuccessCardProps) {
  return (
    <div
      className="max-w-xl mx-auto space-y-6 text-center py-6"
      role="alert"
      aria-live="polite"
    >
      <div className="w-12 h-12 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] mx-auto flex items-center justify-center">
        <CheckCircle className="w-6 h-6" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-medium text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
          Permintaan Janji Temu Diterima
        </h2>
        <p className="text-sm text-[var(--color-ink-muted)]">
          Terima kasih, <strong>{success.name}</strong>. Kode referensi Anda:
        </p>
        <div className="p-3 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-md font-mono text-base font-bold text-[var(--color-accent)] inline-block mt-2">
          {success.code}
        </div>
      </div>

      <div className="text-xs text-[var(--color-ink-soft)] space-y-1">
        <p>Jadwal: {success.date} ({success.slot})</p>
        <p>Amel akan menghubungi nomor WhatsApp Anda untuk konfirmasi.</p>
      </div>

      <div className="pt-2 flex flex-wrap justify-center gap-3">
        <a
          href={getBookingConfirmationWhatsAppUrl({
            name: success.name,
            alias: success.alias,
            code: success.code,
            date: success.date,
            slot: success.slot,
          })}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-sm"
        >
          Konfirmasi via WhatsApp
        </a>
        <button
          onClick={onReset}
          type="button"
          className="btn-secondary text-sm cursor-pointer"
        >
          Ajukan Jadwal Lain
        </button>
      </div>
    </div>
  );
}
