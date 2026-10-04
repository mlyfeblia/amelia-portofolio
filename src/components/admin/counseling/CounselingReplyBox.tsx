'use client';

import React, { useState } from 'react';
import { Send, Eye, EyeOff } from 'lucide-react';

interface CounselingReplyBoxProps {
  initialText: string;
  initialPublic: boolean;
  onCancel: () => void;
  onSave: (text: string, isPublic: boolean) => Promise<void>;
}

export function CounselingReplyBox({
  initialText,
  initialPublic,
  onCancel,
  onSave,
}: CounselingReplyBoxProps) {
  const [replyText, setReplyText] = useState(initialText);
  const [replyPublic, setReplyPublic] = useState(initialPublic);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!replyText.trim()) return;
    setSaving(true);
    try {
      await onSave(replyText.trim(), replyPublic);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-3.5 sm:p-5 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] space-y-3.5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[var(--color-ink)]">
          Tulis Tanggapan Konseling / Penguatan Sahabat:
        </label>
        <span className="text-[11px] text-[var(--color-ink-muted)]">
          {replyText.length} karakter
        </span>
      </div>

      <textarea
        rows={4}
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Tuliskan penerimaan, validasi empati, panduan CBT/spiritual islami, dan dorongan semangat..."
        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-xs sm:text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]/70 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent-soft)] resize-y min-h-[100px]"
        autoFocus
      />

      <div className="space-y-3 pt-1">
        {/* Visibility Checkbox Card */}
        <label
          onClick={() => setReplyPublic(!replyPublic)}
          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
            replyPublic
              ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent-border)] text-[var(--color-ink)]'
              : 'bg-[var(--color-surface)] border-[var(--color-paper-border)] text-[var(--color-ink-muted)]'
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
                {replyPublic ? 'Tampilkan di Website Publik' : 'Simpan Sebagai Catatan Privat'}
              </span>
              <span className="text-[11px] text-[var(--color-ink-muted)]">
                {replyPublic
                  ? 'Pengunjung website dapat membaca cerita dan tanggapan ini'
                  : 'Hanya dapat dilihat oleh admin di portal pengelola'}
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={replyPublic}
            onChange={(e) => setReplyPublic(e.target.checked)}
            className="w-4 h-4 rounded border-[var(--color-paper-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] shrink-0"
          />
        </label>

        {/* Balanced Button Controls */}
        <div className="flex items-center gap-2.5 justify-end w-full">
          <button
            onClick={onCancel}
            type="button"
            className="h-9 px-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-xs font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] transition-all cursor-pointer inline-flex items-center justify-center whitespace-nowrap flex-1 sm:flex-initial"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !replyText.trim()}
            type="button"
            className="h-9 px-5 rounded-xl bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 text-xs font-semibold shadow-xs whitespace-nowrap flex-1 sm:flex-initial"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Tanggapan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
