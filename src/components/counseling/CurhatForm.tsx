'use client';

import React, { useState, useEffect, useId, useRef } from 'react';
import { Send, CheckCircle2, Lock, PenLine, Check, X, Clock } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDecisionModal } from '@/components/ui/ConfirmDecisionModal';
import { FormErrorMessage } from '@/components/ui/FormErrorMessage';
import { CURHAT_CATEGORIES, CurhatCategory } from '@/types';
import { formatPersonName, formatSentenceCase } from '@/lib/text-formatter';
import { enqueueOfflineMutation } from '@/lib/offline-queue';
import { focusAndScrollToField } from '@/lib/dom-utils';
import { useCooldownTimer } from '@/lib/use-cooldown';

const CATEGORIES = CURHAT_CATEGORIES;

export function resolveCurhatCategory(query?: string | null): CurhatCategory {
  if (!query || typeof query !== 'string') return CATEGORIES[0];
  const clean = query.trim();
  if (!clean) return CATEGORIES[0];

  const exact = CATEGORIES.find((c) => c.toLowerCase() === clean.toLowerCase());
  if (exact) return exact;

  const lower = clean.toLowerCase();
  if (lower.includes('mental') || lower.includes('emosi') || lower.includes('overthinking') || lower.includes('stres') || lower.includes('burnout')) {
    return 'Kesehatan Mental & Emosi';
  }
  if (lower.includes('spiritual') || lower.includes('ibadah') || lower.includes('islam')) {
    return 'Spiritualitas & Ibadah';
  }
  if (lower.includes('quarter') || lower.includes('crisis') || lower.includes('arah hidup') || lower.includes('self growth')) {
    return 'Quarter-Life Crisis & Arah Hidup';
  }
  if (lower.includes('akademik') || lower.includes('skripsi') || lower.includes('kuliah')) {
    return 'Akademik, Skripsi & Kuliah';
  }
  if (lower.includes('karier') || lower.includes('kerja') || lower.includes('finansial') || lower.includes('produktivitas')) {
    return 'Karier, Kerja & Finansial';
  }
  if (lower.includes('percintaan') || lower.includes('pasangan') || lower.includes('cinta')) {
    return 'Percintaan & Pasangan';
  }
  if (lower.includes('keluarga') || lower.includes('rumah') || lower.includes('orang tua')) {
    return 'Keluarga & Rumah';
  }
  if (lower.includes('percaya diri') || lower.includes('citra diri') || lower.includes('insecure')) {
    return 'Kepercayaan Diri & Citra Diri';
  }
  if (lower.includes('teman') || lower.includes('sosial') || lower.includes('hubungan')) {
    return 'Pertemanan & Sosial';
  }
  if (lower.includes('cyber') || lower.includes('edukasi') || lower.includes('sebaya') || lower.includes('bebas') || lower.includes('lainnya')) {
    return 'Kisah Bebas & Lainnya';
  }

  return CATEGORIES[0];
}

const ALIAS_PLACEHOLDERS = [
  'Misal: Jiwa yang Lelah, Pejuang Skripsi',
  'Misal: Pengembara Batin, Penanti Fajar',
  'Misal: Sahabat yang Bingung, Pencari Ketenangan',
  'Misal: Hati yang Gundah, Mahasiswa Akhir',
];

const MESSAGE_PLACEHOLDERS = [
  'Tuliskan apa pun yang mengganjal di pikiran dan hatimu secara jujur...',
  'Keluarkan rasa lelah, cemas, atau beban pikiran yang sulit kamu ceritakan pada orang lain...',
  'Ceritakan fase hidup yang sedang kamu lalui, Amel ada di sini untuk mendengarkan...',
];

interface CurhatFormProps {
  onSuccess: () => void;
}

export function CurhatForm({ onSuccess }: CurhatFormProps) {
  const formId = useId();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentOffline, setSentOffline] = useState(false);
  const [sendError, setSendError] = useState('');
  const { cooldownSeconds, isCoolingDown, startCooldown } = useCooldownTimer();

  // Always initialize with SSR-safe defaults to avoid hydration mismatch
  const [alias, setAlias] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [message, setMessage] = useState('');
  const [botTrap, setBotTrap] = useState('');
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [showCurhatConfirmModal, setShowCurhatConfirmModal] = useState(false);
  const [aliasPlaceholder, setAliasPlaceholder] = useState(ALIAS_PLACEHOLDERS[0]);
  const [messagePlaceholder, setMessagePlaceholder] = useState(MESSAGE_PLACEHOLDERS[0]);
  const isRestoredRef = useRef(false);

  // Rotate placeholders per visit post-hydration asynchronously
  useEffect(() => {
    const timer = setTimeout(() => {
      const aliasIdx = Math.floor(Math.random() * ALIAS_PLACEHOLDERS.length);
      const msgIdx = Math.floor(Math.random() * MESSAGE_PLACEHOLDERS.length);
      setAliasPlaceholder(ALIAS_PLACEHOLDERS[aliasIdx]);
      setMessagePlaceholder(MESSAGE_PLACEHOLDERS[msgIdx]);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Restore draft from sessionStorage or prefill category from URL on client mount after hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      let hasDraftCategory = false;
      try {
        const saved = sessionStorage.getItem('curhat_draft_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.alias) setAlias(parsed.alias);
          if (parsed.category && (CATEGORIES as readonly string[]).includes(parsed.category)) {
            setCategory(parsed.category);
            hasDraftCategory = true;
          }
          if (parsed.message) setMessage(parsed.message);
          setIsDraftSaved(true);
        }
      } catch {}

      if (!hasDraftCategory) {
        try {
          const params = new URLSearchParams(window.location.search);
          const catParam = params.get('kategori') || params.get('category') || params.get('topik');
          if (catParam && catParam !== 'Semua') {
            setCategory(resolveCurhatCategory(catParam));
          }
        } catch {}
      }

      isRestoredRef.current = true;
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Autosave draft to sessionStorage (debounced)
  useEffect(() => {
    if (!isRestoredRef.current) return;
    if (sent) return;

    if (!message && !alias) {
      const clearTimer = setTimeout(() => {
        try {
          sessionStorage.removeItem('curhat_draft_v1');
        } catch {}
        setIsDraftSaved(false);
      }, 0);
      return () => clearTimeout(clearTimer);
    }

    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(
          'curhat_draft_v1',
          JSON.stringify({ message, alias, category })
        );
        setIsDraftSaved(true);
      } catch {}
    }, 300);

    return () => clearTimeout(timer);
  }, [message, alias, category, sent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Silently trap bot submissions
    if (botTrap) {
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        setSentOffline(false);
        setSent(true);
        setMessage('');
        setAlias('');
        setIsDraftSaved(false);
        try {
          sessionStorage.removeItem('curhat_draft_v1');
        } catch {}
      }, 400);
      return;
    }

    if (isCoolingDown) {
      setSendError(`Mohon tunggu ${cooldownSeconds} detik sebelum mengirim cerita kembali.`);
      return;
    }

    const trimmed = message.trim();
    if (trimmed.length < 10) {
      setSendError('Pesan minimal 10 karakter agar Amel dapat memahami situasimu.');
      focusAndScrollToField(`${formId}-msg`);
      return;
    }

    setSendError('');
    setShowCurhatConfirmModal(true);
  };

  const executeCurhatSubmit = async () => {
    const trimmed = message.trim();
    setSubmitting(true);
    setSendError('');
    const payload = {
      alias: alias.trim() || 'Hamba Allah',
      category,
      message: trimmed,
      isPublic: true,
      botTrap,
    };

    if (typeof window !== 'undefined' && !navigator.onLine) {
      enqueueOfflineMutation('curhat', '/api/curhat', payload);
      setSentOffline(true);
      setSent(true);
      setMessage('');
      setAlias('');
      setIsDraftSaved(false);
      try {
        sessionStorage.removeItem('curhat_draft_v1');
      } catch {}
      setShowCurhatConfirmModal(false);
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/curhat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 429) {
          const retryAfter = parseInt(res.headers.get('Retry-After') || '', 10);
          const seconds = !isNaN(retryAfter) && retryAfter > 0 ? retryAfter : 60;
          startCooldown(seconds);
        }
        throw new Error(data.message || 'Gagal mengirim pesan.');
      }
      setSentOffline(false);
      setSent(true);
      setMessage('');
      setAlias('');
      setIsDraftSaved(false);
      try {
        sessionStorage.removeItem('curhat_draft_v1');
      } catch {}
      setShowCurhatConfirmModal(false);
      onSuccess();
    } catch (err: unknown) {
      // Jika error karena jaringan terputus tiba-tiba, simpan ke antrean offline
      if (typeof window !== 'undefined' && !navigator.onLine) {
        enqueueOfflineMutation('curhat', '/api/curhat', payload);
        setSentOffline(true);
        setSent(true);
        setMessage('');
        setAlias('');
        setIsDraftSaved(false);
        try {
          sessionStorage.removeItem('curhat_draft_v1');
        } catch {}
        setShowCurhatConfirmModal(false);
      } else {
        setSendError(err instanceof Error ? err.message : 'Gagal mengirim pesan. Silakan coba kembali.');
        setShowCurhatConfirmModal(false);
      }
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div id="curhat-form" className="bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl p-6 shadow-xs space-y-4 scroll-mt-24">
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
            {sentOffline ? 'Pesanmu Disimpan di Antrean Offline' : 'Pesanmu Telah Terkirim'}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
            {sentOffline
              ? 'Perangkatmu sedang tidak terhubung ke internet. Ceritamu telah diamankan di perangkat ini dan akan dikirimkan secara otomatis saat koneksi kembali stabil.'
              : 'Terima kasih telah berbagi. Amel akan membaca dan memberikan tanggapan yang menenteramkan di dinding curhat ini.'}
          </p>
          <button
            onClick={() => {
              setSent(false);
              setSentOffline(false);
            }}
            type="button"
            className="btn-secondary btn-interactive text-xs py-1.5 px-3 mt-2 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <PenLine className="w-3.5 h-3.5 text-[var(--color-ink-soft)]" />
            <span>Tulis Pesan Lain</span>
          </button>
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

          <FormErrorMessage
            message={sendError}
            onClose={() => setSendError('')}
            autoDismissMs={6000}
          />

          <div>
            <label
              htmlFor={`${formId}-alias`}
              className="block text-xs font-semibold text-[var(--color-ink)] mb-1"
            >
              Nama Samaran <span className="text-[var(--color-ink-soft)] font-normal">(opsional)</span>
            </label>
            <div className="relative flex items-center">
              <input
                id={`${formId}-alias`}
                type="text"
                maxLength={50}
                value={alias}
                onChange={(e) => {
                  setAlias(formatPersonName(e.target.value));
                  if (sendError) setSendError('');
                }}
                placeholder={aliasPlaceholder}
                className="form-input text-sm py-2 !pr-10 w-full"
              />
              {alias && (
                <button
                  type="button"
                  onClick={() => setAlias('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] p-1 rounded-md transition-colors"
                  aria-label="Hapus nama samaran"
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
                  <span className="text-[var(--color-ink-soft)] font-medium">Min. 10 ({message.trim().length}/10)</span>
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
              onChange={(e) => {
                setMessage(e.target.value);
                if (sendError) setSendError('');
              }}
              onBlur={() => {
                if (message.trim()) {
                  setMessage(formatSentenceCase(message));
                }
              }}
              placeholder={messagePlaceholder}
              className="form-input text-sm py-2 resize-y min-h-[108px] max-h-[320px] overflow-y-auto textarea-custom-scroll overscroll-contain scroll-isolated cursor-text select-text"
            />
            {isDraftSaved && (
              <div className="pt-1.5 flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>Draf tersimpan otomatis</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || isCoolingDown}
            className="btn-primary btn-interactive w-full text-sm py-2.5 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Spinner size="sm" variant="white" label="Sedang mengirim pesan..." />
                <span>Mengirim Pesan...</span>
              </>
            ) : isCoolingDown ? (
              <>
                <Clock className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                <span>Tunggu {cooldownSeconds} detik...</span>
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

      {/* Confirmation Modal for Curhat Submission */}
      <ConfirmDecisionModal
        isOpen={showCurhatConfirmModal}
        onClose={() => setShowCurhatConfirmModal(false)}
        onConfirm={executeCurhatSubmit}
        title="Kirim Cerita ke Ruang Curhat?"
        description="Pesanmu akan dikirimkan secara aman dan anonim tanpa menampilkan identitas asli. Kak Amel akan membaca dan memberikan tanggapan penguatan di Dinding Cerita."
        confirmLabel="Ya, Kirim Cerita"
        variant="primary"
        loading={submitting}
        icon={<Send className="w-5 h-5 text-[var(--color-accent)]" />}
        itemDetail={
          <div className="space-y-1.5 text-xs text-[var(--color-ink)]">
            <div className="flex justify-between gap-2">
              <span className="text-[var(--color-ink-muted)]">Nama Samaran:</span>
              <span className="font-semibold text-right break-words">{alias.trim() || 'Hamba Allah'}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[var(--color-ink-muted)]">Kategori:</span>
              <span className="font-semibold text-right">{category}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[var(--color-ink-muted)]">Panjang Cerita:</span>
              <span className="font-medium text-right">{message.trim().length} karakter</span>
            </div>
          </div>
        }
      />
    </div>
  );
}
