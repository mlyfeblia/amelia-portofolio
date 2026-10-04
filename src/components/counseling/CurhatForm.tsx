'use client';

import React, { useState, useId } from 'react';
import Image from 'next/image';
import { Send, AlertCircle, CheckCircle2, Lock, Download, PenLine } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { usePwa, triggerPwaInstall } from '@/lib/pwa-store';

const CATEGORIES = [
  'Quarter-Life Crisis',
  'Kecemasan & Ibadah',
  'Akademik & Burnout',
  'Keluarga & Relasi',
];

interface CurhatFormProps {
  onSuccess: () => void;
}

export function CurhatForm({ onSuccess }: CurhatFormProps) {
  const formId = useId();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState('');
  const { isInstalled } = usePwa();

  const [alias, setAlias] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [message, setMessage] = useState('');
  const [botTrap, setBotTrap] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Silently trap bot submissions
    if (botTrap) {
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        setSent(true);
        setMessage('');
        setAlias('');
      }, 400);
      return;
    }

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
          botTrap,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setSent(true);
      setMessage('');
      setAlias('');
      onSuccess();
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : 'Gagal mengirim pesan. Silakan coba kembali.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
            className="btn-secondary text-xs py-1.5 px-3 mt-2 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <PenLine className="w-3.5 h-3.5 text-[var(--color-ink-soft)]" />
            <span>Tulis Pesan Lain</span>
          </button>

          {!isInstalled && (
            <div className="mt-4 pt-4 border-t border-[var(--color-paper-border)] bg-[var(--color-paper)] p-3 rounded-xl flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-[var(--color-paper-border)] bg-[#f7f2eb]">
                  <Image
                    src="/icons/icon-192x192.png"
                    alt="Logo Amelia"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--color-ink)] truncate">
                    Pasang Aplikasi Amelia
                  </p>
                  <p className="text-[11px] text-[var(--color-ink-muted)] line-clamp-1">
                    Pantau balasan curhat dan materi konseling lebih mudah di HP.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => triggerPwaInstall()}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-[11px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors shrink-0 shadow-xs cursor-pointer inline-flex items-center gap-1 active:scale-95"
              >
                <Download className="w-3 h-3" />
                <span>Pasang</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-label="Formulir curhat anonim"
          noValidate
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

          {sendError && (
            <div
              className="flex items-start gap-2 p-3 text-xs text-[var(--color-error)] bg-[var(--color-error-soft)] border border-[var(--color-error-border)] rounded-md animate-shake"
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
              maxLength={50}
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
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor={`${formId}-msg`}
                className="block text-xs font-semibold text-[var(--color-ink)]"
              >
                Isi Cerita Hati <span className="text-[var(--color-error)]" aria-hidden="true">*</span>
              </label>
              <span className="text-[11px] text-[var(--color-ink-soft)]">
                {message.trim().length < 10 ? (
                  <span className="text-amber-700 font-medium">Min. 10 ({message.trim().length}/10)</span>
                ) : (
                  <span className="text-[var(--color-accent)] font-medium">{message.trim().length}/1000</span>
                )}
              </span>
            </div>
            <textarea
              id={`${formId}-msg`}
              required
              rows={4}
              maxLength={1000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan apa pun yang mengganjal di pikiran dan hatimu secara jujur..."
              className="form-input text-sm py-2 resize-y min-h-[108px] max-h-[320px] overflow-y-auto"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary btn-interactive w-full text-sm py-2.5 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Spinner size="sm" variant="white" label="Sedang mengirim pesan..." />
                <span>Mengirim Pesan...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Kirim Secara Anonim</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
