'use client';

import React, { useState, useEffect } from 'react';
import { Send, Eye, EyeOff, Star, Check } from 'lucide-react';
import { ConfirmDecisionModal } from '@/components/ui/ConfirmDecisionModal';

interface CounselingReplyBoxProps {
  initialText: string;
  initialPublic: boolean;
  initialLanding?: boolean;
  itemId?: string;
  itemAlias?: string;
  onCancel: () => void;
  onSave: (text: string, isPublic: boolean, showOnLandingPage: boolean) => Promise<void>;
}

export function CounselingReplyBox({
  initialText,
  initialPublic,
  initialLanding = false,
  itemId,
  itemAlias,
  onCancel,
  onSave,
}: CounselingReplyBoxProps) {
  const storageKey = itemId ? `amel_curhat_draft_${itemId}` : null;

  const [replyText, setReplyText] = useState(() => {
    if (typeof window !== 'undefined' && storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved && saved.trim() && saved !== initialText) {
          return saved;
        }
      } catch {
        // ignore
      }
    }
    return initialText;
  });

  const [replyPublic, setReplyPublic] = useState(initialPublic);
  const [replyLanding, setReplyLanding] = useState(initialLanding);
  const [saving, setSaving] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved && saved.trim() && saved !== initialText) {
          return 'Draf tersimpan dimuat';
        }
      } catch {
        // ignore
      }
    }
    return null;
  });

  // Autosave to localStorage debounced
  useEffect(() => {
    if (!storageKey) return;
    const timer = setTimeout(() => {
      try {
        if (replyText.trim()) {
          localStorage.setItem(storageKey, replyText);
          const now = new Intl.DateTimeFormat('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Jakarta',
          }).format(new Date());
          setLastSavedTime(`Tersimpan otomatis ${now} WIB`);
        } else {
          localStorage.removeItem(storageKey);
          setLastSavedTime(null);
        }
      } catch {
        // ignore
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [replyText, storageKey]);

  const handleSave = async () => {
    if (!replyText.trim()) return;
    setSaving(true);
    try {
      await onSave(replyText.trim(), replyPublic, replyLanding);
      if (storageKey) {
        try {
          localStorage.removeItem(storageKey);
        } catch {}
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] space-y-3.5 animate-fade-in-up">
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[var(--color-ink)] break-words">
          Tulis Tanggapan untuk {itemAlias ? <span className="text-[var(--color-accent)]">{itemAlias}</span> : 'Konseli'}:
        </label>
        <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] min-[340px]:text-[11px] text-[var(--color-ink-muted)]">
          {lastSavedTime && (
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <Check className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate max-w-[170px] min-[340px]:max-w-none">{lastSavedTime}</span>
            </span>
          )}
          <span className="shrink-0">{replyText.length} karakter</span>
        </div>
      </div>

      <textarea
        rows={4}
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Tuliskan penerimaan, validasi empati, perspektif konseling Islam / CBT, dan kata-kata penenteram jiwa..."
        className="form-input text-xs sm:text-sm py-2.5 resize-y min-h-[110px]"
        autoFocus
      />

      <div className="space-y-2.5 pt-1">
        {/* Visibility Card */}
        <label
          onClick={() => {
            const next = !replyPublic;
            setReplyPublic(next);
            if (!next) setReplyLanding(false);
          }}
          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
            replyPublic
              ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent-border)] text-[var(--color-ink)]'
              : 'bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-[var(--color-ink-muted)]'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs">
            {replyPublic ? (
              <Eye className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
            ) : (
              <EyeOff className="w-4 h-4 text-[var(--color-ink-muted)] shrink-0" />
            )}
            <div>
              <span className="font-semibold block text-[var(--color-ink)]">
                {replyPublic ? 'Tampilkan di Dinding Curhat Publik' : 'Simpan Sebagai Catatan Privat'}
              </span>
              <span className="text-[11px] text-[var(--color-ink-muted)]">
                {replyPublic
                  ? 'Pengunjung website dapat membaca cerita dan tanggapan ini di dinding curhat'
                  : 'Hanya dapat dilihat oleh pengelola di portal admin'}
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={replyPublic}
            onChange={(e) => {
              setReplyPublic(e.target.checked);
              if (!e.target.checked) setReplyLanding(false);
            }}
            className="w-4 h-4 rounded border-[var(--color-paper-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] shrink-0"
          />
        </label>

        {/* Landing Page Toggle Card */}
        {replyPublic && (
          <label
            onClick={() => setReplyLanding(!replyLanding)}
            className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
              replyLanding
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-[var(--color-ink-muted)]'
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs">
              <Star className={`w-4 h-4 shrink-0 ${replyLanding ? 'fill-amber-500 text-amber-600' : 'text-[var(--color-ink-muted)]'}`} />
              <div>
                <span className="font-semibold block text-[var(--color-ink)]">
                  {replyLanding ? '★ Ditampilkan di Beranda (Landing Page)' : 'Tampilkan di Beranda (Landing Page)'}
                </span>
                <span className="text-[11px] text-[var(--color-ink-muted)]">
                  Sorotan 2 curhat pilihan yang langsung muncul di halaman muka website utama.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={replyLanding}
              onChange={(e) => setReplyLanding(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--color-paper-border)] text-amber-600 focus:ring-amber-500 shrink-0"
            />
          </label>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col min-[320px]:flex-row items-center gap-2 justify-end w-full pt-1">
          <button
            onClick={onCancel}
            type="button"
            className="btn-secondary btn-interactive h-9 px-3.5 sm:px-4 text-xs font-semibold rounded-xl inline-flex items-center justify-center whitespace-nowrap w-full min-[320px]:w-auto cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={() => setShowSendConfirm(true)}
            disabled={saving || !replyText.trim()}
            type="button"
            className="btn-primary btn-interactive h-9 px-3.5 sm:px-4 text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-1.5 whitespace-nowrap w-full min-[320px]:w-auto cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>{saving ? 'Menyimpan...' : 'Kirim Tanggapan'}</span>
          </button>
        </div>
      </div>

      {/* Decision Modal for Submitting Counseling Reply */}
      <ConfirmDecisionModal
        isOpen={showSendConfirm}
        onClose={() => setShowSendConfirm(false)}
        onConfirm={async () => {
          setShowSendConfirm(false);
          await handleSave();
        }}
        title={initialText ? 'Simpan Pembaruan Tanggapan?' : 'Kirim Tanggapan Penguatan?'}
        description={
          initialText
            ? 'Pembaruan tanggapan konselor akan disimpan dan disinkronkan ke ruang curhat konseli.'
            : 'Tanggapan penguatan ini akan dikirimkan kepada konseli sesuai pengaturan visibilitas yang dipilih.'
        }
        confirmLabel={initialText ? 'Ya, Simpan Pembaruan' : 'Ya, Kirim Tanggapan'}
        variant="primary"
        icon={<Send className="w-5 h-5 text-[var(--color-accent)]" />}
        loading={saving}
        itemDetail={
          <div className="space-y-1">
            {itemAlias && (
              <div>
                <span className="font-semibold text-[var(--color-ink)]">Konseli:</span> {itemAlias}
              </div>
            )}
            <div>
              <span className="font-semibold text-[var(--color-ink)]">Visibilitas:</span>{' '}
              {replyPublic ? 'Publik (Dinding Curhat)' : 'Privat'}
              {replyLanding && replyPublic && ' • Sorotan Beranda Utama'}
            </div>
            <div className="line-clamp-2 italic text-[11px] pt-0.5">
              &ldquo;{replyText.trim()}&rdquo;
            </div>
            <div className="text-[10px] text-[var(--color-ink-muted)]">
              Panjang: {replyText.trim().length} karakter
            </div>
          </div>
        }
      />
    </div>
  );
}
