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
  ArrowLeft
} from 'lucide-react';
import { BookingStatus, CounselingMode } from '@/types';
import { BookingTimelineStepper } from './BookingTimelineStepper';
import { getBookingConfirmationWhatsAppUrl } from '@/lib/whatsapp';
import { copyToClipboard } from '@/lib/clipboard';
import { downloadIcsFile, getGoogleCalendarUrl } from '@/lib/calendar-export';

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
  isExiting?: boolean;
}

export function BookingDetailCard({
  booking,
  onRemoveFromDevice,
  onBack,
  isExiting = false,
}: BookingDetailCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    const ok = await copyToClipboard(booking.code);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getModeDetails = (mode: CounselingMode) => {
    switch (mode) {
      case 'online_chat':
        return { label: 'Chat Terjadwal', desc: 'Percakapan teks intensif via WhatsApp 60 menit', icon: MessageSquare };
      case 'online_meet':
        return { label: 'Video Call via WhatsApp', desc: 'Tatap muka video virtual privat langsung di WhatsApp', icon: Video };
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
    mode: booking.mode,
  });

  return (
    <div className={`p-4 sm:p-6 rounded-2xl bg-[var(--color-paper)]/60 border border-[var(--color-paper-border)] shadow-xs space-y-4 sm:space-y-5 transition-all ${
      isExiting ? 'animate-detail-card-exit pointer-events-none' : 'animate-detail-card-enter'
    }`}>
      {/* Header with Code, Applicant & Actions */}
      <div className="flex items-start justify-between gap-3 pb-3.5 sm:pb-4 border-b border-[var(--color-paper-border)]">
        {/* Left: Metadata info (Kode Referensi & Diajukan Oleh) */}
        <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-0 sm:flex sm:items-center sm:gap-4 sm:flex-wrap">
          {/* Kode Referensi */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs text-[var(--color-ink-muted)] shrink-0 font-medium">
              Kode Referensi:
            </span>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-paper-border)] font-mono font-semibold text-xs text-[var(--color-accent)] shrink-0 shadow-2xs">
              <span>{booking.code}</span>
              <button
                onClick={handleCopyCode}
                type="button"
                className="p-0.5 rounded text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] cursor-pointer inline-flex items-center justify-center transition-colors shrink-0"
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

          <span className="hidden sm:inline-block text-[var(--color-paper-border)]">•</span>

          {/* Diajukan oleh */}
          <div className="flex items-center gap-1.5 text-xs min-w-0">
            <span className="text-xs text-[var(--color-ink-muted)] shrink-0 font-medium">
              Diajukan oleh:
            </span>
            <span className="font-semibold text-xs sm:text-sm text-[var(--color-ink)] truncate">
              {booking.alias || booking.name}
            </span>
          </div>
        </div>

        {/* Right: Hapus dari histori perangkat */}
        {onRemoveFromDevice && (
          <button
            onClick={() => onRemoveFromDevice(booking.code)}
            type="button"
            className="btn-interactive inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50/80 hover:bg-rose-100/80 border border-rose-200/70 transition-colors cursor-pointer shadow-2xs active:scale-95 shrink-0 self-start"
            title="Hapus dari histori perangkat ini"
            aria-label="Hapus dari histori perangkat ini"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Hapus Histori</span>
          </button>
        )}
      </div>

      {/* Stepper Phase */}
      <BookingTimelineStepper
        status={booking.status}
        date={booking.date}
        timeSlot={booking.timeSlot}
      />

      {/* Booking Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
        <div className="p-3.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] space-y-1 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)]">
            <Calendar className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
            <span className="font-medium">Tanggal Sesi:</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[var(--color-ink)]">
            {booking.date}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] space-y-1 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)]">
            <Clock className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
            <span className="font-medium">Waktu / Sesi:</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[var(--color-ink)]">
            {booking.timeSlot}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] space-y-1 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)]">
            <ModeIcon className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
            <span className="font-medium">Moda Konseling:</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[var(--color-ink)]">
            {modeInfo.label}
          </p>
          <p className="text-[11px] text-[var(--color-ink-muted)] leading-relaxed">{modeInfo.desc}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] space-y-1 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)]">
            <FileText className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
            <span className="font-medium">Topik Konseling:</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[var(--color-ink)]">
            {booking.category}
          </p>
        </div>
      </div>

      {/* Notes if available */}
      {booking.notes && (
        <div className="p-3.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] space-y-1 shadow-2xs">
          <span className="text-xs font-semibold text-[var(--color-ink-muted)] block">
            Catatan / Ekspektasi Konseli:
          </span>
          <p className="text-xs sm:text-sm text-[var(--color-ink)] italic leading-relaxed">
            &ldquo;{booking.notes}&rdquo;
          </p>
        </div>
      )}

      {/* Calendar Integration */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-xs text-[var(--color-ink-muted)]">
        <span className="inline-flex items-center gap-1.5 font-medium text-[var(--color-ink)]">
          <Calendar className="w-3.5 h-3.5 text-[var(--color-accent)]" /> Simpan Sesi ke Kalender:
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              downloadIcsFile({
                code: booking.code,
                name: booking.name,
                category: booking.category,
                date: booking.date,
                timeSlot: booking.timeSlot,
                mode: booking.mode,
                notes: booking.notes,
              })
            }
            className="hover:text-[var(--color-accent)] underline decoration-dotted underline-offset-2 cursor-pointer font-medium"
          >
            Download .ICS
          </button>
          <span className="text-[var(--color-paper-border)]">•</span>
          <a
            href={getGoogleCalendarUrl({
              code: booking.code,
              name: booking.name,
              category: booking.category,
              date: booking.date,
              timeSlot: booking.timeSlot,
              mode: booking.mode,
              notes: booking.notes,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-accent)] underline decoration-dotted underline-offset-2 cursor-pointer font-medium"
          >
            Google Calendar
          </a>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-[var(--color-paper-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <p className="text-[11px] text-[var(--color-ink-muted)] sm:max-w-xs md:max-w-sm leading-relaxed">
          Butuh konfirmasi langsung atau ingin mengubah jadwal? Silakan hubungi Amel melalui WhatsApp.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 shrink-0">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary btn-interactive px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 whitespace-nowrap order-1 sm:order-2"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>
              <span className="sm:hidden">Tanya via WhatsApp</span>
              <span className="hidden sm:inline">Tanya Amel via WhatsApp</span>
            </span>
          </a>

          {onBack && (
            <button
              onClick={onBack}
              type="button"
              className="btn-secondary btn-interactive px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xs inline-flex items-center justify-center gap-2 cursor-pointer shrink-0 whitespace-nowrap order-2 sm:order-1 active:scale-98"
            >
              <ArrowLeft className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
              <span>Tutup Rincian</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
