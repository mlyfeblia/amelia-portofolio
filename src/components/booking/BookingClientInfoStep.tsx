'use client';

import React from 'react';
import { BookingFormState, BOOKING_CATEGORIES } from '@/data/booking-data';
import { ConsultationCategory } from '@/types';

interface BookingClientInfoStepProps {
  form: BookingFormState;
  formId: string;
  onChange: (key: keyof BookingFormState, value: string) => void;
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
        <input
          id={`${formId}-name`}
          type="text"
          required
          maxLength={80}
          autoComplete="name"
          value={form.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Nama lengkapmu"
          className="form-input text-sm py-2"
        />
      </div>

      <div>
        <label
          htmlFor={`${formId}-alias`}
          className="block text-xs font-semibold text-[var(--color-ink)] mb-1"
        >
          Nama Panggilan Nyaman <span className="text-[var(--color-ink-soft)] font-normal">(opsional)</span>
        </label>
        <input
          id={`${formId}-alias`}
          type="text"
          maxLength={40}
          autoComplete="nickname"
          value={form.alias}
          onChange={(e) => onChange('alias', e.target.value)}
          placeholder="Nama sapaan saat sesi berlangsung"
          className="form-input text-sm py-2"
        />
      </div>

      <div>
        <label
          htmlFor={`${formId}-phone`}
          className="block text-xs font-semibold text-[var(--color-ink)] mb-1"
        >
          Nomor WhatsApp Aktif <span className="text-[var(--color-error)]" aria-hidden="true">*</span>
        </label>
        <input
          id={`${formId}-phone`}
          type="tel"
          required
          maxLength={20}
          autoComplete="tel"
          value={form.phone}
          onChange={(e) => {
            const raw = e.target.value;
            // Allow digits, hyphens, spaces, and leading plus sign
            const sanitized = raw.replace(/[^\d+\s-]/g, '');
            onChange('phone', sanitized);
          }}
          placeholder="0812-3456-7890"
          className="form-input text-sm py-2"
        />
      </div>

      <div>
        <label
          htmlFor={`${formId}-email`}
          className="block text-xs font-semibold text-[var(--color-ink)] mb-1"
        >
          Email <span className="text-[var(--color-error)]" aria-hidden="true">*</span>
        </label>
        <input
          id={`${formId}-email`}
          type="email"
          required
          maxLength={100}
          autoComplete="email"
          value={form.email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="nama@email.com"
          className="form-input text-sm py-2"
        />
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
