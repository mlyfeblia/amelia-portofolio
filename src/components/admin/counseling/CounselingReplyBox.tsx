'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Send, Eye, EyeOff, Star, Check, X } from 'lucide-react';
import { useMounted } from '@/lib/use-mounted';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { cn } from '@/lib/utils';
import { ConfirmDecisionModal } from '@/components/ui/ConfirmDecisionModal';
import { Spinner } from '@/components/ui/Spinner';
import { useUnsavedChangesWarning } from '@/lib/use-unsaved-changes';

export interface CounselingReplyBoxProps {
  isOpen?: boolean;
  initialText: string;
  initialPublic: boolean;
  initialLanding?: boolean;
  itemId?: string;
  itemAlias?: string;
  originalMessage?: string;
  onCancel: () => void;
  onSave: (text: string, isPublic: boolean, showOnLandingPage: boolean) => Promise<void>;
}

export function CounselingReplyBox({
  isOpen = true,
  initialText,
  initialPublic,
  initialLanding = false,
  itemId,
  itemAlias,
  originalMessage,
  onCancel,
  onSave,
}: CounselingReplyBoxProps) {
  const storageKey = itemId ? `amel_curhat_draft_${itemId}` : null;
  const mounted = useMounted();

  // SSR-safe initial state
  const [replyText, setReplyText] = useState(initialText);
  const [replyPublic, setReplyPublic] = useState(initialPublic);
  const [replyLanding, setReplyLanding] = useState(initialLanding);
  const [saving, setSaving] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const isRestoredRef = useRef(false);
  const windowRef = useRef<HTMLDivElement>(null);

  const isDirty = replyText.trim() !== (initialText || '').trim() && replyText.trim().length > 0;
  const { confirmDiscard } = useUnsavedChangesWarning(
    isDirty && !saving,
    'Tanggapan curhat yang Anda ketik belum disimpan. Yakin ingin keluar?'
  );

  const { isRendered, isExiting, backdropClass, windowClass } = useModalAnimation({
    isOpen,
    onClose: () => confirmDiscard(onCancel),
    closeOnEscape: !saving,
    lockScroll: true,
    containerRef: windowRef,
  });

  // Synchronize state when modal is opened or item changes
  useEffect(() => {
    if (isOpen) {
      setReplyText(initialText);
      setReplyPublic(initialPublic);
      setReplyLanding(initialLanding);
    }
  }, [isOpen, initialText, initialPublic, initialLanding, itemId]);

  // Restore saved draft safely on mount post-hydration
  useEffect(() => {
    if (!storageKey) return;
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved && saved.trim() && saved !== initialText) {
          setReplyText(saved);
          setLastSavedTime('Draf tersimpan dimuat');
        }
      } catch {}
      isRestoredRef.current = true;
    }, 0);

    return () => clearTimeout(timer);
  }, [storageKey, initialText]);

  // Autosave to localStorage debounced
  useEffect(() => {
    if (!isRestoredRef.current) return;
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

  const isClearingReply = !replyText.trim() && Boolean(initialText);
  const canSubmit = replyText.trim().length > 0 || isClearingReply;

  const handleSave = async () => {
    if (!canSubmit) return;
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

  if (!mounted || !isRendered || typeof document === 'undefined') {
    return null;
  }

  const modalDialog = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="counseling-reply-modal-title"
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 overflow-hidden select-none',
        isExiting && 'pointer-events-none'
      )}
    >
      {/* Standardized Blurred Backdrop with scroll protection */}
      <div
        className={cn(backdropClass)}
        aria-hidden="true"
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
        onClick={() => confirmDiscard(onCancel)}
      />

      {/* Unified Modal Dialog Container with Standardized Animation */}
      <div
        ref={windowRef}
        className={cn(
          'relative z-10 w-full sm:max-w-xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col pointer-events-auto my-auto select-text modal-window-sheet-mobile',
          windowClass
        )}
      >
        <div className="w-full h-full bg-[var(--color-surface)] sm:border sm:border-[var(--color-paper-border)] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          
          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[var(--color-paper-border)] bg-[var(--color-surface)] shrink-0">
            <div className="min-w-0 pr-3">
              <h3
                id="counseling-reply-modal-title"
                className="text-base sm:text-lg font-semibold text-[var(--color-ink)] truncate"
              >
                {initialText ? 'Ubah Tanggapan' : 'Beri Tanggapan'} untuk {itemAlias ? <span className="text-[var(--color-accent)]">{itemAlias}</span> : 'Konseli'}
              </h3>
              {lastSavedTime && (
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium mt-0.5">
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{lastSavedTime}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => confirmDiscard(onCancel)}
              className="btn-interactive inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] cursor-pointer shrink-0 transition-colors"
              aria-label="Tutup modal tanggapan"
            >
              <X className="w-4 h-4 shrink-0" />
              <span>Tutup</span>
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto textarea-custom-scroll p-4 sm:p-6 space-y-4">
            {/* Conseli message quote preview */}
            {originalMessage && (
              <div className="bg-[var(--color-paper)] p-3.5 sm:p-4 rounded-xl border border-[var(--color-paper-border)] space-y-1.5">
                <span className="text-[11px] font-semibold text-[var(--color-ink-soft)] uppercase tracking-wider block">
                  Cerita dari Konseli:
                </span>
                <p className="text-xs sm:text-sm text-[var(--color-ink)] italic line-clamp-4 leading-relaxed">
                  &ldquo;{originalMessage}&rdquo;
                </p>
              </div>
            )}

            {/* Reply textarea */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs text-[var(--color-ink-soft)]">
                <label htmlFor="reply-textarea-input" className="font-semibold text-[var(--color-ink)]">
                  Isi Tanggapan Penguatan
                </label>
                <span>{replyText.length} karakter</span>
              </div>
              <textarea
                id="reply-textarea-input"
                rows={6}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Tuliskan penerimaan, validasi empati, perspektif konseling Islam / CBT, dan kata-kata penenteram jiwa..."
                className="form-input text-xs sm:text-sm p-3 resize-y w-full min-h-[140px] sm:min-h-[160px] textarea-custom-scroll leading-relaxed overscroll-contain scroll-isolated cursor-text select-text"
                autoFocus
              />
            </div>

            {/* Visibility Options */}
            <div className="space-y-2.5 pt-1">
              <label
                onClick={() => {
                  const next = !replyPublic;
                  setReplyPublic(next);
                  if (!next) setReplyLanding(false);
                }}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                  replyPublic
                    ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent-border)] text-[var(--color-ink)]'
                    : 'bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-[var(--color-ink-muted)]'
                }`}
              >
                <div className="flex items-center gap-2.5 text-xs min-w-0 pr-2">
                  {replyPublic ? (
                    <Eye className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-[var(--color-ink-muted)] shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-[var(--color-ink)] block truncate">
                      {replyPublic ? 'Tampilkan di Dinding Curhat Publik' : 'Simpan Sebagai Catatan Privat'}
                    </span>
                    <span className="text-[11px] text-[var(--color-ink-muted)] block truncate">
                      {replyPublic ? 'Dapat dibaca pengunjung umum' : 'Hanya tampak di dashboard admin'}
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
                  className="w-4 h-4 rounded text-[var(--color-accent)] shrink-0"
                />
              </label>

              {replyPublic && (
                <label
                  onClick={() => setReplyLanding(!replyLanding)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                    replyLanding
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-[var(--color-ink-muted)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs min-w-0 pr-2">
                    <Star className={`w-4 h-4 shrink-0 ${replyLanding ? 'fill-amber-500 text-amber-600' : 'text-[var(--color-ink-muted)]'}`} />
                    <div className="min-w-0">
                      <span className="font-semibold text-xs text-[var(--color-ink)] block truncate">
                        {replyLanding ? '★ Di Beranda Utama' : 'Tampilkan di Beranda Utama'}
                      </span>
                      <span className="text-[11px] text-[var(--color-ink-muted)] block truncate">
                        Sorotan pilihan di etalase beranda depan
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={replyLanding}
                    onChange={(e) => setReplyLanding(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 shrink-0"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 px-4 sm:px-6 py-3.5 border-t border-[var(--color-paper-border)] bg-[var(--color-surface)] shrink-0">
            <button
              onClick={() => confirmDiscard(onCancel)}
              type="button"
              className="btn-secondary btn-interactive inline-flex items-center justify-center gap-1.5 h-10 px-4 text-xs font-semibold rounded-xl cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Batal</span>
            </button>
            <button
              onClick={() => setShowSendConfirm(true)}
              disabled={saving || !canSubmit}
              type="button"
              className={cn(
                "btn-interactive inline-flex items-center justify-center gap-2 h-10 px-5 text-xs font-semibold rounded-xl cursor-pointer shadow-xs disabled:opacity-50",
                isClearingReply ? "bg-red-600 hover:bg-red-700 text-white" : "btn-primary"
              )}
            >
              {saving ? (
                <>
                  <Spinner size="xs" variant="white" />
                  <span>Menyimpan...</span>
                </>
              ) : isClearingReply ? (
                <>
                  <X className="w-3.5 h-3.5 shrink-0" />
                  <span>Hapus Tanggapan</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 shrink-0" />
                  <span>{initialText ? 'Simpan Tanggapan' : 'Kirim Tanggapan'}</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );

  return (
    <>
      {createPortal(modalDialog, document.body)}

      {/* Decision Modal for Submitting Counseling Reply */}
      <ConfirmDecisionModal
        isOpen={showSendConfirm}
        onClose={() => setShowSendConfirm(false)}
        onConfirm={async () => {
          setShowSendConfirm(false);
          await handleSave();
        }}
        title={
          isClearingReply
            ? 'Hapus Tanggapan Konseling?'
            : initialText
            ? 'Simpan Pembaruan Tanggapan?'
            : 'Kirim Tanggapan Penguatan?'
        }
        description={
          isClearingReply
            ? 'Tanggapan konselor akan dihapus dan status curhat konseli akan dikembalikan menjadi belum ditanggapi.'
            : initialText
            ? 'Pembaruan tanggapan konselor akan disimpan dan disinkronkan ke ruang curhat konseli.'
            : 'Tanggapan penguatan ini akan dikirimkan kepada konseli sesuai pengaturan visibilitas yang dipilih.'
        }
        confirmLabel={
          isClearingReply
            ? 'Ya, Hapus Tanggapan'
            : initialText
            ? 'Ya, Simpan Pembaruan'
            : 'Ya, Kirim Tanggapan'
        }
        variant={isClearingReply ? 'danger' : 'primary'}
        icon={
          isClearingReply ? (
            <X className="w-5 h-5 text-red-600" />
          ) : (
            <Send className="w-5 h-5 text-[var(--color-accent)]" />
          )
        }
        loading={saving}
        itemDetail={
          <div className="space-y-1">
            {itemAlias && (
              <div>
                <span className="font-semibold text-[var(--color-ink)]">Konseli:</span> {itemAlias}
              </div>
            )}
            {!isClearingReply && (
              <>
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
              </>
            )}
            {isClearingReply && (
              <div className="text-[11px] text-red-600 font-medium">
                Catatan: Mengosongkan isi jawaban akan mereset status curhat menjadi Belum Ditanggapi.
              </div>
            )}
          </div>
        }
      />
    </>
  );
}
