'use client';

import React from 'react';
import { Shield, Send, Clock } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import {
  BookingFormState,
  BOOKING_MODES,
  BOOKING_TIME_SLOTS,
  getTodayDateString,
  getMaxBookingDateString,
} from '@/data/booking-data';
import { formatSentenceCase } from '@/lib/text-formatter';

interface BookingSessionDetailsStepProps {
  form: BookingFormState;
  formId: string;
  loading: boolean;
  isCoolingDown?: boolean;
  cooldownSeconds?: number;
  onChange: (key: keyof BookingFormState, value: string) => void;
}

export function BookingSessionDetailsStep({
  form,
  formId,
  loading,
  isCoolingDown = false,
  cooldownSeconds = 0,
  onChange,
}: BookingSessionDetailsStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-ink-soft)] pb-2 border-b border-[var(--color-paper-border)]">
        2. Format &amp; Jadwal
      </h2>

      <div>
        <label className="block text-xs font-semibold text-[var(--color-ink)] mb-2">
          Format Sesi Konseling <span className="text-[var(--color-error)]" aria-hidden="true">*</span>
        </label>
        <div className="space-y-2" role="radiogroup" aria-label="Format Sesi Konseling">
          {BOOKING_MODES.map((m) => {
            const Icon = m.icon;
            const active = form.mode === m.id;
            return (
              <label
                key={m.id}
                className={`chip-interactive flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${
                  active
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] shadow-xs'
                    : 'border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] bg-[var(--color-surface)]'
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value={m.id}
                  checked={active}
                  onChange={() => onChange('mode', m.id)}
                  className="sr-only"
                />
                <Icon
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    active ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-soft)]'
                  }`}
                />
                <div>
                  <span className="block text-xs sm:text-sm font-semibold text-[var(--color-ink)]">
                    {m.label}
                  </span>
                  <span className="block text-xs text-[var(--color-ink-soft)]">
                    {m.desc}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 w-full min-w-0">
        <div className="w-full min-w-0">
          <label
            htmlFor={`${formId}-date`}
            className="block text-xs font-semibold text-[var(--color-ink)] mb-1"
          >
            Tanggal <span className="text-[var(--color-error)]" aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-date`}
            type="date"
            required
            min={getTodayDateString()}
            max={getMaxBookingDateString(60)}
            suppressHydrationWarning
            value={form.date}
            onChange={(e) => onChange('date', e.target.value)}
            className="form-input text-sm py-2 w-full max-w-full min-w-0"
          />
        </div>

        <div className="w-full min-w-0">
          <label
            htmlFor={`${formId}-slot`}
            className="block text-xs font-semibold text-[var(--color-ink)] mb-1"
          >
            Waktu Sesi <span className="text-[var(--color-error)]" aria-hidden="true">*</span>
          </label>
          <select
            id={`${formId}-slot`}
            value={form.timeSlot}
            onChange={(e) => onChange('timeSlot', e.target.value)}
            className="form-input text-sm py-2 w-full max-w-full min-w-0"
          >
            {BOOKING_TIME_SLOTS.map((ts) => (
              <option key={ts} value={ts}>{ts}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor={`${formId}-notes`}
            className="block text-xs font-semibold text-[var(--color-ink)]"
          >
            Gambaran Singkat Masalah <span className="text-[var(--color-ink-soft)] font-normal">(opsional)</span>
          </label>
          {form.notes.length > 0 && (
            <span className="text-[11px] text-[var(--color-ink-muted)]">
              {form.notes.length}/500
            </span>
          )}
        </div>
        <textarea
          id={`${formId}-notes`}
          rows={2}
          maxLength={500}
          value={form.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          onBlur={() => {
            if (form.notes.trim()) {
              onChange('notes', formatSentenceCase(form.notes));
            }
          }}
          placeholder="Ceritakan harapan atau hal yang ingin diurai dalam sesi ini..."
          className="form-input text-sm py-2 resize-y min-h-[72px] max-h-[220px] overflow-y-auto textarea-custom-scroll overscroll-contain scroll-isolated cursor-text select-text"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || isCoolingDown}
          className="btn-primary btn-interactive w-full text-sm py-2.5 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {loading ? (
            <>
              <Spinner size="sm" variant="white" label="Memproses pengajuan janji temu..." />
              <span>Memproses Pengajuan...</span>
            </>
          ) : isCoolingDown ? (
            <>
              <Clock className="w-4 h-4 text-white" aria-hidden="true" />
              <span>Tunggu {cooldownSeconds} detik...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>
                <span className="sm:hidden">Kirim Permohonan</span>
                <span className="hidden sm:inline">Kirim Permintaan Janji Temu</span>
              </span>
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 mt-2.5 text-xs text-[var(--color-ink-soft)]">
          <Shield className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span>Kerahasiaan data terjamin sesuai kode etik bimbingan konseling.</span>
        </div>
      </div>
    </div>
  );
}
