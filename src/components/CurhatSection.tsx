'use client';

import React, { useState, useEffect, useId, useCallback } from 'react';
import { Send, AlertCircle, MessageCircle, CheckCircle2, Lock } from 'lucide-react';
import { AnonymousMessage } from '@/types';

const CATEGORIES = [
  'Semua',
  'Quarter-Life Crisis',
  'Kecemasan & Ibadah',
  'Akademik & Burnout',
  'Keluarga & Relasi',
];

export default function CurhatSection() {
  const formId = useId();
  const [list, setList] = useState<AnonymousMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Semua');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState('');

  const [alias, setAlias] = useState('');
  const [category, setCategory] = useState('Quarter-Life Crisis');
  const [message, setMessage] = useState('');

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch('/api/curhat');
      const data = await res.json();
      if (data.success) {
        setList(data.data.filter((c: AnonymousMessage) => c.isPublic));
      }
    } catch (e) {
      console.error('Failed to load curhat:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (trimmed.length < 10) {
      setSendError('Pesan minimal 10 karakter agar Amel dapat memahami situasimu.');
      return;
    }
    setSubmitting(true);
    setSendError('');
    try {
      const res = await fetch('/api/curhat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alias: alias.trim() || 'Hamba Allah',
          category,
          message: trimmed,
          isPublic: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setSent(true);
      setMessage('');
      setAlias('');
      fetchList();
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : 'Gagal mengirim pesan. Silakan coba kembali.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered =
    activeTab === 'Semua' ? list : list.filter((c) => c.category === activeTab);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

      {/* Left Column: Form Curhat */}
      <div className="md:col-span-5">
        <div className="bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[var(--color-paper-border)]">
            <Lock className="w-4 h-4 text-[var(--color-accent)]" aria-hidden="true" />
            <div>
              <h2 className="text-base font-semibold text-[var(--color-ink)]">
                Kirim Pesan Rahasia
              </h2>
              <p className="text-xs text-[var(--color-ink-soft)]">
                Tanpa login, nama asli tidak akan ditampilkan.
              </p>
            </div>
          </div>

          {sent ? (
            <div
              className="py-8 text-center space-y-3"
              role="status"
              aria-live="polite"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-[var(--color-ink)]">
                Pesanmu Telah Terkirim
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                Terima kasih telah berbagi. Amel akan membaca dan memberikan tanggapan yang menenteramkan di dinding curhat ini.
              </p>
              <button
                onClick={() => setSent(false)}
                type="button"
                className="btn-secondary text-xs py-1.5 px-3 mt-2"
              >
                Tulis Pesan Lain
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              aria-label="Formulir curhat anonim"
              noValidate
            >
              {sendError && (
                <div
                  className="flex items-start gap-2 p-3 text-xs text-[var(--color-error)] bg-[var(--color-error-soft)] border border-[var(--color-error-border)] rounded-md"
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{sendError}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor={`${formId}-alias`}
                  className="block text-xs font-semibold text-[var(--color-ink)] mb-1"
                >
                  Nama Samaran <span className="text-[var(--color-ink-soft)] font-normal">(opsional)</span>
                </label>
                <input
                  id={`${formId}-alias`}
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="Misal: Jiwa yang Lelah, Pejuang Skripsi"
                  className="form-input text-sm py-2"
                />
              </div>

              <div>
                <label
                  htmlFor={`${formId}-cat`}
                  className="block text-xs font-semibold text-[var(--color-ink)] mb-1"
                >
                  Kategori Masalah
                </label>
                <select
                  id={`${formId}-cat`}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-input text-sm py-2"
                >
                  {CATEGORIES.slice(1).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor={`${formId}-msg`}
                  className="block text-xs font-semibold text-[var(--color-ink)] mb-1"
                >
                  Isi Cerita Hati <span className="text-[var(--color-error)]" aria-hidden="true">*</span>
                </label>
                <textarea
                  id={`${formId}-msg`}
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan apa pun yang mengganjal di pikiran dan hatimu secara jujur..."
                  className="form-input text-sm py-2 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full text-sm py-2.5"
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
                {submitting ? 'Mengirim...' : 'Kirim Secara Anonim'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Right Column: Wall of Messages */}
      <div className="md:col-span-7 space-y-4">
        {/* Category Filter Tabs */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Filter kategori curhat"
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeTab === cat;
            return (
              <button
                key={cat}
                id={`tab-${cat}`}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(cat)}
                type="button"
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[var(--color-accent)] text-white font-semibold'
                    : 'bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-accent)]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* List of Messages */}
        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="space-y-4"
        >
          {loading ? (
            <div className="p-8 text-center border border-[var(--color-paper-border)] rounded-lg bg-[var(--color-surface)]">
              <p className="text-sm text-[var(--color-ink-soft)]">
                Memuat pesan dari sahabat…
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center border border-[var(--color-paper-border)] rounded-lg bg-[var(--color-surface)]">
              <MessageCircle className="w-8 h-8 text-[var(--color-ink-soft)] mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm text-[var(--color-ink-muted)]">
                Belum ada curhat di kategori ini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="p-5 sm:p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[var(--color-ink)]">
                      {item.alias}
                    </span>
                    <span className="text-[var(--color-accent)] font-medium">
                      {item.category}
                    </span>
                  </div>

                  <blockquote className="text-sm sm:text-base text-[var(--color-ink-muted)] italic leading-relaxed border-l-2 border-[var(--color-paper-border)] pl-3">
                    &ldquo;{item.message}&rdquo;
                  </blockquote>

                  {item.isAnswered && item.answer && (
                    <div className="p-4 bg-[var(--color-accent-soft)] border border-[var(--color-accent-border)] rounded-md space-y-1 mt-2">
                      <span className="text-xs font-semibold text-[var(--color-accent)] block">
                        Tanggapan Amel:
                      </span>
                      <p className="text-xs sm:text-sm text-[var(--color-ink)] leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
