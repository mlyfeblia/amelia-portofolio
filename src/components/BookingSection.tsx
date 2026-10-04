'use client';

import React, { useState, useId } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  BookingFormState,
  DEFAULT_BOOKING_FORM,
  getTodayDateString,
  getMaxBookingDateString,
} from '@/data/booking-data';
import { BookingSuccessCard } from './booking/BookingSuccessCard';
import { BookingClientInfoStep } from './booking/BookingClientInfoStep';
import { BookingSessionDetailsStep } from './booking/BookingSessionDetailsStep';

export default function BookingSection() {
  const formId = useId();
  const [form, setForm] = useState<BookingFormState>(DEFAULT_BOOKING_FORM);
  const [botTrap, setBotTrap] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{
    code: string;
    name: string;
    alias?: string;
    date: string;
    slot: string;
  } | null>(null);

  const handleChange = (key: keyof BookingFormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Silently trap automated bot submissions
    if (botTrap) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSuccess({
          code: 'BK-CONF-OK',
          name: form.name || 'Sahabat',
          date: form.date,
          slot: form.timeSlot,
        });
      }, 500);
      return;
    }

    if (!form.name.trim()) {
      setError('Mohon masukkan nama lengkap Anda.');
      return;
    }

    const cleanPhone = form.phone.replace(/[\s-]/g, '');
    if (!/^\+?[0-9]{9,15}$/.test(cleanPhone)) {
      setError('Nomor WhatsApp harus terdiri dari 9–15 digit angka yang valid.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
      setError('Mohon masukkan alamat email yang valid (contoh: nama@email.com).');
      return;
    }

    if (!form.date) {
      setError('Mohon tentukan tanggal sesi konseling.');
      return;
    }
    const today = getTodayDateString();
    if (form.date < today) {
      setError('Tanggal sesi tidak boleh memilih hari yang sudah lewat.');
      return;
    }
    const maxDate = getMaxBookingDateString(60);
    if (form.date > maxDate) {
      setError('Jadwal konsultasi dapat diajukan maksimal 60 hari ke depan.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, botTrap }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Gagal memproses janji temu.');
      setSuccess({
        code: data.data.code,
        name: data.data.name,
        alias: data.data.alias || form.alias || undefined,
        date: data.data.date,
        slot: data.data.timeSlot,
      });
      setForm(DEFAULT_BOOKING_FORM);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kendala sistem. Silakan ulangi sesaat lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl p-6 sm:p-10 shadow-xs">
      {success ? (
        <BookingSuccessCard
          success={success}
          onReset={() => setSuccess(null)}
        />
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          id={formId}
          aria-label="Formulir reservasi konseling"
          className="space-y-8"
        >
          {/* Honeypot field for bot protection */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor={`${formId}-hp`}>Jangan isi kolom ini</label>
            <input
              id={`${formId}-hp`}
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={botTrap}
              onChange={(e) => setBotTrap(e.target.value)}
            />
          </div>

          {error && (
            <div
              className="flex items-start gap-2.5 p-3.5 text-xs sm:text-sm text-[var(--color-error)] bg-[var(--color-error-soft)] border border-[var(--color-error-border)] rounded-md"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <BookingClientInfoStep
              form={form}
              formId={formId}
              onChange={handleChange}
            />
            <BookingSessionDetailsStep
              form={form}
              formId={formId}
              loading={loading}
              onChange={handleChange}
            />
          </div>
        </form>
      )}
    </div>
  );
}
