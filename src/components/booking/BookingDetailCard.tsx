'use client';

import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  MessageCircle, 
  Calendar, 
  Clock, 
  Video, 
  MessageSquare, 
  Users, 
  FileText, 
  Trash2,
  ExternalLink
} from 'lucide-react';
import { BookingStatus, CounselingMode } from '@/types';
import { BookingTimelineStepper } from './BookingTimelineStepper';
import { getBookingConfirmationWhatsAppUrl } from '@/lib/whatsapp';

export interface BookingDetailData {
  id?: string;
  code: string;
  name: string;
  alias?: string;
  category: string;
  mode: CounselingMode;
  date: string;
  timeSlot: string;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
}

interface BookingDetailCardProps {
  booking: BookingDetailData;
  onRemoveFromDevice?: (code: string) => void;
  onBack?: () => void;
}

export function BookingDetailCard({
  booking,
  onRemoveFromDevice,
  onBack,
}: BookingDetailCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(booking.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const getModeDetails = (mode: CounselingMode) => {
    switch (mode) {
      case 'online_meet':
        return { label: 'Google Meet', desc: 'Tatap muka video virtual privat', icon: Video };
      case 'online_chat':
        return { label: 'Chat Terjadwal', desc: 'Percakapan intensif via WhatsApp 60 menit', icon: MessageSquare };
      case 'tatap_muka_cirebon':
        return { label: 'Tatap Muka Langsung', desc: 'Area Kampus UIN Siber Syekh Nurjati Cirebon', icon: Users };
      default:
        return { label: mode, desc: 'Sesi konseling', icon: Video };
    }
  };

  const modeInfo = getModeDetails(booking.mode);
  const ModeIcon = modeInfo.icon;

  const waUrl = getBookingConfirmationWhatsAppUrl({
    name: booking.name,
    alias: booking.alias,
    code: booking.code,
    date: booking.date,
    slot: booking.timeSlot,
  });

  return (
    <div className="p-5 sm:p-6 rounded-xl bg-[var(--color-paper)]/50 border border-[var(--color-paper-border)] space-y-5">
      {/* Header with Code & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--color-paper-border)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-ink-muted)]">Kode Referensi:</span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] font-mono font-bold text-xs sm:text-sm text-[var(--color-accent)]">
              <span>{booking.code}</span>
              <button
                onClick={handleCopyCode}
                type="button"
                className="btn-icon-interactive text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] p-0.5 cursor-pointer rounded"
                title="Salin kode referensi"
                aria-label="Salin kode referensi"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 animate-pop-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-[var(--color-ink-muted)]">
            Diajukan oleh: <strong className="text-[var(--color-ink)]">{booking.alias || booking.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRemoveFromDevice && (
            <button
              onClick={() => onRemoveFromDevice(booking.code)}
              type="button"
              className="text-xs text-[var(--color-ink-muted)] hover:text-rose-600 px-2 py-1 rounded-lg border border-transparent hover:border-rose-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
              title="Hapus dari histori perangkat ini"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hapus Histori</span>
            </button>
          )}

          {onBack && (
            <button
              onClick={onBack}
              type="button"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] cursor-pointer transition-colors"
            >
              Tutup Rincian
            </button>
          )}
        </div>
      </div>

      {/* Stepper Phase */}
      <BookingTimelineStepper
        status={booking.status}
        date={booking.date}
        timeSlot={booking.timeSlot}
      />

      {/* Booking Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
        <div className="p-3.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)]">
            <Calendar className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>Tanggal Sesi:</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[var(--color-ink)]">
            {booking.date}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)]">
            <Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>Waktu / Sesi:</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[var(--color-ink)]">
            {booking.timeSlot}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)]">
            <ModeIcon className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>Moda Konseling:</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[var(--color-ink)]">
            {modeInfo.label}
          </p>
          <p className="text-[11px] text-[var(--color-ink-muted)]">{modeInfo.desc}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)]">
            <FileText className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>Topik Konseling:</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[var(--color-ink)]">
            {booking.category}
          </p>
        </div>
      </div>

      {/* Notes if available */}
      {booking.notes && (
        <div className="p-3.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] space-y-1">
          <span className="text-xs font-semibold text-[var(--color-ink-muted)] block">
            Catatan / Ekspektasi Konseli:
          </span>
          <p className="text-xs sm:text-sm text-[var(--color-ink)] italic leading-relaxed">
            &ldquo;{booking.notes}&rdquo;
          </p>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-[11px] text-[var(--color-ink-muted)]">
          Butuh konfirmasi langsung atau ingin mengubah jadwal? Silakan hubungi Amel melalui WhatsApp.
        </p>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-interactive px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Tanya Amel via WhatsApp</span>
          <ExternalLink className="w-3 h-3 opacity-80" />
        </a>
      </div>
    </div>
  );
}
