'use client';

import React, { useState, useId } from 'react';
import { AlertCircle, CalendarPlus, Search } from 'lucide-react';
import {
  BookingFormState,
  DEFAULT_BOOKING_FORM,
  getTodayDateString,
  getMaxBookingDateString,
} from '@/data/booking-data';
import { BookingSuccessCard } from './booking/BookingSuccessCard';
import { BookingClientInfoStep } from './booking/BookingClientInfoStep';
import { BookingSessionDetailsStep } from './booking/BookingSessionDetailsStep';
import { BookingTracker } from './booking/BookingTracker';
import { saveDeviceBooking, useDeviceBookings } from '@/lib/booking-storage';

interface BookingSectionProps {
  initialTab?: 'new' | 'tracker';
  initialCode?: string;
}

export default function BookingSection({ initialTab, initialCode }: BookingSectionProps = {}) {
  const formId = useId();
  const [activeTab, setActiveTab] = useState<'new' | 'tracker'>(initialTab || 'new');
  const deviceBookings = useDeviceBookings();
  const deviceBookingCount = deviceBookings.length;
  const [trackCode, setTrackCode] = useState<string>(initialCode || '');

  // Keep tab & trackCode synchronized with URL on mount
  React.useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get('tab');
      const hash = window.location.hash;

      if (tabParam === 'tracker' || hash === '#tracker' || hash === '#lacak') {
        setActiveTab('tracker');
      } else if (tabParam === 'new') {
        setActiveTab('new');
      }

      const codeParam = searchParams.get('code');
      if (codeParam) {
        setTrackCode(codeParam);
      } else {
        setTrackCode('');
        sessionStorage.removeItem('booking_track_code');
      }
    } catch {}
  }, []);

  const handleTabChange = (tab: 'new' | 'tracker') => {
    setActiveTab(tab);
    // When switching tabs, reset trackCode so returning to tracker is always clean & empty
    setTrackCode('');
    try {
      sessionStorage.removeItem('booking_active_tab');
      sessionStorage.removeItem('booking_track_code');
      const url = new URL(window.location.href);
      if (tab === 'tracker') {
        url.searchParams.set('tab', 'tracker');
      } else {
        url.searchParams.delete('tab');
      }
      url.searchParams.delete('code');
      window.history.replaceState({}, '', url.toString());
    } catch {}
  };

  const handleTrackCodeChange = (code: string) => {
    setTrackCode(code);
    try {
      const url = new URL(window.location.href);
      if (code) {
        sessionStorage.setItem('booking_track_code', code);
        url.searchParams.set('code', code);
      } else {
        sessionStorage.removeItem('booking_track_code');
        url.searchParams.delete('code');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {}
  };

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
      setError('Mohon masukkan nama lengkapmu ya.');
      return;
    }

    const cleanPhone = form.phone.replace(/[\s-]/g, '');
    if (!/^\+?[0-9]{9,15}$/.test(cleanPhone)) {
      setError('Nomor WhatsApp harus terdiri dari 9-15 digit angka yang valid.');
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

      const newBooking = data.data;

      // Automatically persist to device storage for track-without-login
      saveDeviceBooking({
        code: newBooking.code,
        name: newBooking.alias || newBooking.name,
        category: newBooking.category,
        date: newBooking.date,
        timeSlot: newBooking.timeSlot,
      });

      setSuccess({
        code: newBooking.code,
        name: newBooking.name,
        alias: newBooking.alias || form.alias || undefined,
        date: newBooking.date,
        slot: newBooking.timeSlot,
      });
      setForm(DEFAULT_BOOKING_FORM);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kendala sistem. Silakan ulangi sesaat lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackFromSuccess = (code: string) => {
    handleTrackCodeChange(code);
    handleTabChange('tracker');
    setSuccess(null);
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
      {/* Top Header with Unified Segmented Navigation Bar */}
      <div className="relative px-4 py-3.5 sm:px-8 sm:py-5 border-b border-[var(--color-paper-border)] bg-[var(--color-paper)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Segmented Tab Controls: Anchored at top on mobile (order-1) so position NEVER shifts */}
        <div 
          className="order-1 sm:order-2 w-full sm:w-auto grid grid-cols-2 sm:flex items-center p-1 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] shrink-0 self-stretch sm:self-auto"
          role="tablist"
          aria-label="Pilihan reservasi dan pelacakan"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'new'}
            onClick={() => handleTabChange('new')}
            className={`group relative flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border text-center select-none ${
              activeTab === 'new'
                ? 'bg-[var(--color-surface)] text-[var(--color-ink)] border-[var(--color-paper-border)] shadow-xs scale-100'
                : 'border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)]/70 hover:shadow-2xs active:scale-[0.98]'
            }`}
          >
            <CalendarPlus className={`w-4 h-4 text-[var(--color-accent)] shrink-0 transition-transform duration-200 ${
              activeTab === 'new' ? 'scale-105' : 'group-hover:scale-110 group-hover:-rotate-3'
            }`} />
            <span className="truncate">
              <span className="inline sm:hidden">Janji Temu</span>
              <span className="hidden sm:inline">Ajukan Janji Temu</span>
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'tracker'}
            onClick={() => handleTabChange('tracker')}
            className={`group relative flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border text-center select-none ${
              activeTab === 'tracker'
                ? 'bg-[var(--color-surface)] text-[var(--color-ink)] border-[var(--color-paper-border)] shadow-xs scale-100'
                : 'border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)]/70 hover:shadow-2xs active:scale-[0.98]'
            }`}
          >
            <Search className={`w-4 h-4 text-[var(--color-accent)] shrink-0 transition-transform duration-200 ${
              activeTab === 'tracker' ? 'scale-105' : 'group-hover:scale-110 group-hover:rotate-6'
            }`} />
            <span className="truncate">
              <span className="inline sm:hidden">Lacak Status</span>
              <span className="hidden sm:inline">Lacak Status Sesi</span>
            </span>
            {deviceBookingCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-[var(--color-accent)] text-white group-hover:scale-110 transition-transform duration-200 shrink-0">
                {deviceBookingCount}
              </span>
            )}
          </button>
        </div>

        {/* Title and Subtitle: order-2 on mobile, order-1 on desktop */}
        <div className="order-2 sm:order-1 space-y-0.5 min-h-[42px] sm:min-h-0 flex flex-col justify-center">
          <h2 
            className="text-base sm:text-xl font-medium text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {activeTab === 'new' ? 'Formulir Reservasi Sesi' : 'Pelacakan Status Janji Temu'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
            {activeTab === 'new'
              ? 'Tentukan jadwal, format sesi, dan fokus bimbingan konseling privat'
              : 'Pantau perkembangan sesi dan informasi janji temu tanpa perlu login'}
          </p>
        </div>
      </div>

      {/* Main Unified Card Body with Smooth Tab Content Transition */}
      <div className="p-4 sm:p-8 md:p-10">
        <div key={activeTab} className="tab-content-enter">
          {activeTab === 'tracker' ? (
            <BookingTracker
              initialCode={trackCode}
              onCodeChange={handleTrackCodeChange}
              onNavigateToNewBooking={() => {
                handleTrackCodeChange('');
                handleTabChange('new');
              }}
            />
          ) : success ? (
            <BookingSuccessCard
              success={success}
              onReset={() => setSuccess(null)}
              onTrack={handleTrackFromSuccess}
            />
          ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            id={formId}
            aria-label="Formulir reservasi konseling"
            className="space-y-6 sm:space-y-8"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
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
      </div>
    </div>
  );
}
