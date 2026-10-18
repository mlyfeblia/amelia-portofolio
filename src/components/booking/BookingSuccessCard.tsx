'use client';

import React, { useState } from 'react';
import { CheckCircle, MessageCircle, RotateCcw, Copy, Check, Search } from 'lucide-react';
import { getBookingConfirmationWhatsAppUrl } from '@/lib/whatsapp';
import { copyToClipboard } from '@/lib/clipboard';

interface BookingSuccessCardProps {
  success: {
    code: string;
    name: string;
    alias?: string;
    date: string;
    slot: string;
    mode?: string;
  };
  onReset: () => void;
  onTrack?: (code: string) => void;
}

export function BookingSuccessCard({ success, onReset, onTrack }: BookingSuccessCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    const ok = await copyToClipboard(success.code);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
          Terima kasih, <strong>{success.name}</strong>. Kode referensi kamu:
        </p>
        <div className="inline-flex items-center gap-2 p-2.5 sm:p-3 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-xl font-mono text-base sm:text-lg font-bold text-[var(--color-accent)] mt-2">
          <span>{success.code}</span>
          <button
            onClick={handleCopyCode}
            type="button"
            className="btn-icon-interactive p-1 text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] rounded-md cursor-pointer"
            title="Salin kode referensi"
            aria-label="Salin kode referensi"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600 animate-pop-success" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="text-xs text-[var(--color-ink-soft)] space-y-1">
        <p>Jadwal: {success.date} ({success.slot})</p>
        <p>
          Format:{' '}
          <span className="font-semibold text-[var(--color-ink)]">
            {success.mode === 'online_meet'
              ? 'Video Call via WhatsApp'
              : success.mode === 'online_chat'
              ? 'Chat WhatsApp Terjadwal'
              : success.mode === 'tatap_muka_cirebon'
              ? 'Tatap Muka di Kampus'
              : 'Konseling Privat'}
          </span>
        </p>
        <p>Amel akan menghubungi nomor WhatsApp kamu buat konfirmasi sesi ya.</p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3">
        <a
          href={getBookingConfirmationWhatsAppUrl({
            name: success.name,
            alias: success.alias,
            code: success.code,
            date: success.date,
            slot: success.slot,
            mode: success.mode,
          })}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary btn-interactive text-sm inline-flex items-center justify-center gap-2 w-full sm:w-auto shadow-xs whitespace-nowrap"
        >
          <MessageCircle className="w-4 h-4 text-white" />
          <span>
            <span className="sm:hidden">Konfirmasi WhatsApp</span>
            <span className="hidden sm:inline">Konfirmasi via WhatsApp</span>
          </span>
        </a>
        {onTrack && (
          <button
            onClick={() => onTrack(success.code)}
            type="button"
            className="btn-secondary btn-interactive text-sm cursor-pointer inline-flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap"
          >
            <Search className="w-4 h-4 text-[var(--color-ink-soft)]" />
            <span>Lacak Status</span>
          </button>
        )}
        <button
          onClick={onReset}
          type="button"
          className="btn-secondary btn-interactive text-sm cursor-pointer inline-flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap"
        >
          <RotateCcw className="w-4 h-4 text-[var(--color-ink-soft)]" />
          <span>
            <span className="sm:hidden">Jadwal Lain</span>
            <span className="hidden sm:inline">Ajukan Jadwal Lain</span>
          </span>
        </button>
      </div>
    </div>
  );
}
