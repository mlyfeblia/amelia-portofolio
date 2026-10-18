'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Mail, ExternalLink, Copy, Check, X, Calendar, Clock, User } from 'lucide-react';
import { Booking } from '@/types';
import { useMounted } from '@/lib/use-mounted';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { useToast } from '@/components/ui/Toast';
import {
  getAdminContactEmailContent,
  getAdminContactEmailUrl,
  getAdminContactGmailUrl,
} from '@/lib/email-template';
import { copyToClipboard } from '@/lib/clipboard';
import { cn } from '@/lib/utils';

export interface BookingContactEmailModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingContactEmailModal({
  booking,
  isOpen,
  onClose,
}: BookingContactEmailModalProps) {
  const mounted = useMounted();
  const { toast } = useToast();
  const windowRef = React.useRef<HTMLDivElement>(null);

  // Retain active booking during exit transition to prevent sudden unmount or crash
  const [cachedBooking, setCachedBooking] = useState<Booking | null>(booking);
  if (booking && booking !== cachedBooking) {
    setCachedBooking(booking);
  }
  const activeBooking = booking ?? cachedBooking;

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  const { isRendered, isExiting, backdropClass, windowClass } = useModalAnimation({
    isOpen,
    onClose,
    closeOnEscape: true,
    lockScroll: true,
    containerRef: windowRef,
  });

  if (!mounted || !isRendered || !activeBooking) {
    return null;
  }

  const clientName = activeBooking.alias || activeBooking.name;
  const emailParams = {
    clientEmail: activeBooking.email,
    clientName,
    code: activeBooking.code,
    date: activeBooking.date,
    slot: activeBooking.timeSlot,
  };

  const { subject, body } = getAdminContactEmailContent(emailParams);
  const gmailUrl = getAdminContactGmailUrl(emailParams);
  const mailtoUrl = getAdminContactEmailUrl(emailParams);

  const handleCopyEmail = async () => {
    const ok = await copyToClipboard(activeBooking.email);
    if (ok) {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
      toast.success(`Alamat email ${activeBooking.email} disalin!`);
    } else {
      toast.info(`Email: ${activeBooking.email}`);
    }
  };

  const handleCopyDraft = async () => {
    const fullText = `Subjek: ${subject}\n\n${body}`;
    const ok = await copyToClipboard(fullText);
    if (ok) {
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2000);
      toast.success('Draf pesan email lengkap disalin ke clipboard!');
    } else {
      toast.info('Gagal menyalin draf pesan ke clipboard.');
    }
  };

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 flex items-center justify-center p-2.5 min-[340px]:p-4 sm:p-6 overflow-hidden select-none z-[11000]',
        isExiting && 'pointer-events-none'
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-email-title"
    >
      {/* Backdrop */}
      <div
        className={cn(backdropClass)}
        aria-hidden="true"
        onClick={onClose}
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
      />

      {/* Modal Window */}
      <div
        ref={windowRef}
        className={cn(
          'relative z-10 w-full max-w-lg sm:max-w-xl bg-white rounded-2xl min-[340px]:rounded-3xl p-4 min-[340px]:p-5 sm:p-6 shadow-2xl border border-[var(--color-paper-border)] flex flex-col gap-4 my-auto select-text pointer-events-auto max-h-[92vh] overflow-hidden',
          windowClass
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--color-paper-border)] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/20 flex items-center justify-center shrink-0 shadow-2xs">
              <Mail className="w-5 h-5 shrink-0" />
            </div>
            <div className="min-w-0">
              <h3
                id="contact-email-title"
                className="text-base sm:text-lg font-medium text-[var(--color-ink)] leading-snug truncate"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Hubungi Konseli via Email
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] truncate">
                {activeBooking.name} &bull; Kode: <span className="font-mono font-semibold text-[var(--color-accent)]">{activeBooking.code}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] transition-colors cursor-pointer shrink-0"
            aria-label="Tutup jendela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5 text-xs text-[var(--color-ink)]">
          {/* Recipient summary info */}
          <div className="bg-[var(--color-paper)] p-3 min-[340px]:p-3.5 rounded-xl border border-[var(--color-paper-border)] space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
                <User className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
                <span className="font-semibold text-[var(--color-ink)]">{clientName}</span>
                {activeBooking.alias && activeBooking.alias !== activeBooking.name && (
                  <span className="text-[11px] text-[var(--color-ink-muted)]">({activeBooking.name})</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[var(--color-ink-muted)] font-medium">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[var(--color-accent)] shrink-0" />
                  {activeBooking.date}
                </span>
                <span>&bull;</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[var(--color-accent)] shrink-0" />
                  {activeBooking.timeSlot}
                </span>
              </div>
            </div>

            {/* Email Address with Copy Button */}
            <div className="pt-2 border-t border-[var(--color-paper-border)]/70 flex items-center justify-between gap-2 bg-white/80 p-2 rounded-lg border border-[var(--color-paper-border)]">
              <div className="min-w-0 flex items-center gap-1.5 flex-1">
                <span className="text-[11px] text-[var(--color-ink-muted)] shrink-0">Email:</span>
                <span className="font-mono font-semibold text-xs text-[var(--color-ink)] truncate select-all">
                  {activeBooking.email}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="btn-interactive inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[var(--color-paper-muted)] text-[var(--color-ink)] hover:text-[var(--color-accent)] border border-[var(--color-paper-border)] transition-colors shrink-0 cursor-pointer"
                title="Salin alamat email"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600 animate-pop-success shrink-0" />
                    <span className="text-emerald-700">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 shrink-0" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider block">
              Pilihan Tindakan Pengiriman:
            </span>

            {/* 1. Gmail Web (Recommended) */}
            <a
              href={gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-interactive flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white shadow-xs group hover:opacity-95 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <ExternalLink className="w-4 h-4 text-white shrink-0 group-hover:scale-110 transition-transform" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">Buka di Gmail Web</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white/30 text-white">
                      Rekomendasi
                    </span>
                  </div>
                  <p className="text-[11px] text-white/90 truncate">
                    Buka tab baru dengan email, subjek, &amp; draf pesan terisi
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-white/80 shrink-0 ml-2" />
            </a>

            {/* 2. Default Desktop Mail Client */}
            <a
              href={mailtoUrl}
              className="btn-interactive flex items-center justify-between p-3 rounded-xl bg-[var(--color-paper)] hover:bg-[var(--color-paper-muted)] border border-[var(--color-paper-border)] text-[var(--color-ink)] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white border border-[var(--color-paper-border)] flex items-center justify-center shrink-0 text-[var(--color-ink-muted)] group-hover:text-[var(--color-accent)] transition-colors">
                  <Mail className="w-4 h-4 shrink-0" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="font-semibold text-xs text-[var(--color-ink)] block">
                    Buka Aplikasi Email Default
                  </span>
                  <p className="text-[11px] text-[var(--color-ink-muted)] truncate">
                    Membuka protokol mailto untuk Outlook, Thunderbird, atau Mail OS
                  </p>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[var(--color-ink-muted)] shrink-0 ml-2" />
            </a>
          </div>

          {/* Draft Preview & Copy */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">
                Pratinjau Draf Pesan:
              </span>
              <button
                type="button"
                onClick={handleCopyDraft}
                className="btn-interactive inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-[var(--color-accent)] hover:underline cursor-pointer"
              >
                {copiedDraft ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600 animate-pop-success shrink-0" />
                    <span className="text-emerald-700">Draf Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 shrink-0" />
                    <span>Salin Seluruh Draf</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-xs space-y-2">
              <div className="text-[11px] font-semibold text-[var(--color-ink)] pb-1.5 border-b border-[var(--color-paper-border)] break-words">
                <span className="text-[var(--color-ink-muted)] font-normal">Subjek: </span>
                {subject}
              </div>
              <div className="max-h-36 sm:max-h-44 overflow-y-auto pr-1">
                <pre className="font-sans whitespace-pre-wrap text-[11px] leading-relaxed text-[var(--color-ink-muted)] select-text">
                  {body}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[var(--color-paper-border)] flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary btn-interactive px-4 py-2 text-xs font-medium rounded-xl cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
