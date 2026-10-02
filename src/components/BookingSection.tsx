'use client';

import React, { useState, useId } from 'react';
import { AlertCircle, CheckCircle, Shield, Video, MessageSquare, Users } from 'lucide-react';
import { ConsultationCategory, CounselingMode } from '@/types';

const CATEGORIES: ConsultationCategory[] = [
  'Manajemen Stres & Kecemasan',
  'Akademik & Karier',
  'Krisis Identitas Diri & Quarter-Life Crisis',
  'Hubungan Keluarga & Pra-Nikah',
  'Pengembangan Diri & Spiritual Islami',
];

const TIME_SLOTS = [
  '09:30 – 10:30 WIB (Pagi)',
  '13:30 – 14:30 WIB (Siang)',
  '16:00 – 17:00 WIB (Sore)',
  '19:30 – 20:30 WIB (Malam)',
];

const MODES: { id: CounselingMode; label: string; desc: string; icon: typeof Video }[] = [
  { id: 'online_meet', label: 'Google Meet', desc: 'Tatap muka virtual privat', icon: Video },
  { id: 'online_chat', label: 'Chat Terjadwal', desc: 'Percakapan teks intensif 60 menit', icon: MessageSquare },
  { id: 'tatap_muka_cirebon', label: 'Tatap Muka Langsung', desc: 'Area Kampus UIN Siber Cirebon', icon: Users },
];

interface FormState {
  name: string;
  alias: string;
  phone: string;
  email: string;
  category: ConsultationCategory;
  mode: CounselingMode;
  date: string;
  timeSlot: string;
  notes: string;
}

const DEFAULT: FormState = {
  name: '',
  alias: '',
  phone: '',
  email: '',
  category: 'Manajemen Stres & Kecemasan',
  mode: 'online_meet',
  date: '',
  timeSlot: '16:00 – 17:00 WIB (Sore)',
  notes: '',
};

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

export default function BookingSection() {
  const formId = useId();
  const [form, setForm] = useState<FormState>(DEFAULT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{
    code: string;
    name: string;
    date: string;
    slot: string;
  } | null>(null);

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Mohon masukkan nama lengkap Anda.'); return; }
    if (!form.phone.trim()) { setError('Mohon masukkan nomor WhatsApp aktif Anda.'); return; }
    if (!form.email.trim()) { setError('Mohon masukkan alamat email yang valid.'); return; }
    if (!form.date) { setError('Mohon tentukan tanggal sesi konseling.'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Gagal memproses janji temu.');
      setSuccess({
        code: data.data.code,
        name: data.data.name,
        date: data.data.date,
        slot: data.data.timeSlot,
      });
      setForm(DEFAULT);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kendala sistem. Silakan ulangi sesaat lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl p-6 sm:p-10 shadow-xs">
      {success ? (
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
              href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                `Halo Kak Amel, saya telah mengajukan janji temu konseling dengan kode ${success.code}. Mohon konfirmasinya.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm"
            >
              Konfirmasi via WhatsApp
            </a>
            <button
              onClick={() => setSuccess(null)}
              type="button"
              className="btn-secondary text-sm"
            >
              Ajukan Jadwal Lain
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          id={formId}
          aria-label="Formulir reservasi konseling"
          className="space-y-8"
        >
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
            {/* Step 1: Info Pemohon */}
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
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Nama lengkap Anda"
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
                  autoComplete="nickname"
                  value={form.alias}
                  onChange={(e) => set('alias', e.target.value)}
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
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="08xxxxxxxxxx"
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
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
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
                  onChange={(e) => set('category', e.target.value as ConsultationCategory)}
                  className="form-input text-sm py-2"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 2: Format & Jadwal */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-ink-soft)] pb-2 border-b border-[var(--color-paper-border)]">
                2. Format &amp; Jadwal
              </h2>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink)] mb-2">
                  Format Sesi Konseling <span className="text-[var(--color-error)]" aria-hidden="true">*</span>
                </label>
                <div className="space-y-2" role="radiogroup">
                  {MODES.map((m) => {
                    const Icon = m.icon;
                    const active = form.mode === m.id;
                    return (
                      <label
                        key={m.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          active
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                            : 'border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="mode"
                          value={m.id}
                          checked={active}
                          onChange={() => set('mode', m.id)}
                          className="sr-only"
                        />
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${active ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-soft)]'}`} />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
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
                    min={getTodayString()}
                    value={form.date}
                    onChange={(e) => set('date', e.target.value)}
                    className="form-input text-sm py-2"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`${formId}-slot`}
                    className="block text-xs font-semibold text-[var(--color-ink)] mb-1"
                  >
                    Waktu Sesi <span className="text-[var(--color-error)]" aria-hidden="true">*</span>
                  </label>
                  <select
                    id={`${formId}-slot`}
                    value={form.timeSlot}
                    onChange={(e) => set('timeSlot', e.target.value)}
                    className="form-input text-sm py-2"
                  >
                    {TIME_SLOTS.map((ts) => (
                      <option key={ts} value={ts}>{ts}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor={`${formId}-notes`}
                  className="block text-xs font-semibold text-[var(--color-ink)] mb-1"
                >
                  Gambaran Singkat Masalah <span className="text-[var(--color-ink-soft)] font-normal">(opsional)</span>
                </label>
                <textarea
                  id={`${formId}-notes`}
                  rows={2}
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="Ceritakan harapan atau hal yang ingin diurai dalam sesi ini..."
                  className="form-input text-sm py-2 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full text-sm py-2.5"
                >
                  {loading ? 'Memproses Pengajuan...' : 'Kirim Permintaan Janji Temu'}
                </button>

                <div className="flex items-center justify-center gap-1.5 mt-2.5 text-xs text-[var(--color-ink-soft)]">
                  <Shield className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  <span>Kerahasiaan data terjamin sesuai kode etik bimbingan konseling.</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
