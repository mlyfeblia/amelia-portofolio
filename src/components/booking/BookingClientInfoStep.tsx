'use client';

import React from 'react';
import { X } from 'lucide-react';
import { BookingFormState, BOOKING_CATEGORIES } from '@/data/booking-data';
import { ConsultationCategory } from '@/types';

interface BookingClientInfoStepProps {
  form: BookingFormState;
  formId: string;
  onChange: (key: keyof BookingFormState, value: string) => void;
}

export function formatIndoPhoneNumber(val: string): string {
  let digits = val.replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  if (digits.startsWith('628')) {
    digits = '08' + digits.slice(3);
  } else if (digits.startsWith('62')) {
    digits = '0' + digits.slice(2);
  }

  // Bound to max 13 digits
  const trimmed = digits.slice(0, 13);

  if (trimmed.length <= 4) {
    return trimmed;
  }
  if (trimmed.length <= 8) {
    return `${trimmed.slice(0, 4)}-${trimmed.slice(4)}`;
  }
  return `${trimmed.slice(0, 4)}-${trimmed.slice(4, 8)}-${trimmed.slice(8)}`;
}

export function BookingClientInfoStep({
  form,
  formId,
  onChange,
}: BookingClientInfoStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-ink-soft)] pb-2 border-b border-[var(--color-paper-border)]">
        1. Data Konseli
      </h2>

      <div>
        <label
          htmlFor={`${formId}-name`}
          className="block text-xs font-semibold text-[var(--color-ink)] mb-1"
        >
          Nama Lengkap <span className="text-[var(--color-error)]" aria-hidden="true">*</span>
        </label>
        <div className="relative flex items-center">
          <input
            id={`${formId}-name`}
            type="text"
            required
            maxLength={80}
            autoComplete="name"
            value={form.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Nama lengkapmu"
            className="form-input text-sm py-2 !pr-10 w-full"
          />
          {form.name && (
            <button
              type="button"
              onClick={() => onChange('name', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] p-1 rounded-md transition-colors"
              aria-label="Hapus nama lengkap"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor={`${formId}-alias`}
          className="block text-xs font-semibold text-[var(--color-ink)] mb-1"
        >
          Nama Panggilan Nyaman <span className="text-[var(--color-ink-soft)] font-normal">(opsional)</span>
        </label>
        <div className="relative flex items-center">
          <input
            id={`${formId}-alias`}
            type="text"
            maxLength={40}
            autoComplete="nickname"
            value={form.alias}
            onChange={(e) => onChange('alias', e.target.value)}
            placeholder="Nama sapaan saat sesi berlangsung"
            className="form-input text-sm py-2 !pr-10 w-full"
          />
          {form.alias && (
            <button
              type="button"
              onClick={() => onChange('alias', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] p-1 rounded-md transition-colors"
              aria-label="Hapus nama panggilan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor={`${formId}-phone`}
          className="block text-xs font-semibold text-[var(--color-ink)] mb-1"
        >
          Nomor WhatsApp Aktif <span className="text-[var(--color-error)]" aria-hidden="true">*</span>
        </label>
        <div className="relative flex items-center">
          <input
            id={`${formId}-phone`}
            type="tel"
            required
            maxLength={16} // 13 digits + 2 hyphens
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => {
              const formatted = formatIndoPhoneNumber(e.target.value);
              onChange('phone', formatted);
            }}
            placeholder="0812-3456-7890"
            className="form-input text-sm py-2 !pr-10 w-full font-mono tracking-wide"
          />
          {form.phone && (
            <button
              type="button"
              onClick={() => onChange('phone', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] p-1 rounded-md transition-colors"
              aria-label="Hapus nomor WhatsApp"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor={`${formId}-email`}
          className="block text-xs font-semibold text-[var(--color-ink)] mb-1"
        >
          Email <span className="text-[var(--color-error)]" aria-hidden="true">*</span>
        </label>
        <div className="relative flex items-center">
          <input
            id={`${formId}-email`}
            type="email"
            required
            maxLength={100}
            autoComplete="email"
            value={form.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="nama@email.com"
            className="form-input text-sm py-2 !pr-10 w-full"
          />
          {form.email && (
            <button
              type="button"
              onClick={() => onChange('email', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] p-1 rounded-md transition-colors"
              aria-label="Hapus email"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor={`${formId}-cat`}
          className="block text-xs font-semibold text-[var(--color-ink)] mb-1"
        >
          Fokus Topik Bimbingan <span className="text-[var(--color-error)]" aria-hidden="true">*</span>
        </label>
        <select
          id={`${formId}-cat`}
          value={form.category}
          onChange={(e) => onChange('category', e.target.value as ConsultationCategory)}
          className="form-input text-sm py-2"
        >
          {BOOKING_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
