'use client';

import React from 'react';
import { 
  Clock, 
  Trash2, 
  Phone, 
  Mail, 
  Video, 
  MessageSquare, 
  Users 
} from 'lucide-react';
import { Booking, BookingStatus, CounselingMode } from '@/types';
import { getAdminContactWhatsAppUrl } from '@/lib/whatsapp';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

function getModeInfo(mode: CounselingMode) {
  switch (mode) {
    case 'online_meet':
      return { label: 'Google Meet', icon: Video };
    case 'online_chat':
      return { label: 'Chat Terjadwal', icon: MessageSquare };
    case 'tatap_muka_cirebon':
      return { label: 'Tatap Muka Cirebon', icon: Users };
    default:
      return { label: mode, icon: Video };
  }
}

interface BookingCardProps {
  item: Booking;
  isUpdating: boolean;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  onDelete: (item: Booking) => void;
}

export function BookingCard({
  item,
  isUpdating,
  onUpdateStatus,
  onDelete,
}: BookingCardProps) {
  const mode = getModeInfo(item.mode);
  const ModeIcon = mode.icon;

  const getStatusBadgeElement = () => {
    switch (item.status) {
      case 'terkonfirmasi':
        return <Badge variant="accent" size="xs" dot>Terkonfirmasi</Badge>;
      case 'menunggu':
        return <Badge variant="warning" size="xs" dot>Menunggu</Badge>;
      case 'selesai':
        return <Badge variant="info" size="xs">Selesai</Badge>;
      case 'dibatalkan':
        return <Badge variant="danger" size="xs">Dibatalkan</Badge>;
      default:
        return <Badge variant="neutral" size="xs">{item.status}</Badge>;
    }
  };

  return (
    <div className="card-interactive p-4 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-xs space-y-3.5">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[var(--color-paper-border)]">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-accent)]">
            {item.code}
          </span>
          <div>
            <h3 className="font-semibold text-[var(--color-ink)] text-sm sm:text-base leading-tight">
              {item.name}
            </h3>
            {item.alias && item.alias !== item.name && (
              <p className="text-[11px] text-[var(--color-ink-muted)]">Panggilan: {item.alias}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {getStatusBadgeElement()}

          <button
            onClick={() => onDelete(item)}
            type="button"
            title="Hapus janji temu ini"
            className="btn-interactive p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Details grid: 1 col on mobile, 3 cols on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <span className="text-[var(--color-ink-muted)] block mb-0.5 text-[11px]">Topik Konseling</span>
          <span className="font-semibold text-[var(--color-ink)]">{item.category}</span>
        </div>

        <div>
          <span className="text-[var(--color-ink-muted)] block mb-0.5 text-[11px]">Waktu &amp; Tanggal</span>
          <div className="font-semibold text-[var(--color-ink)] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
            <span>{item.date} &bull; {item.timeSlot}</span>
          </div>
        </div>

        <div>
          <span className="text-[var(--color-ink-muted)] block mb-0.5 text-[11px]">Format Pertemuan</span>
          <div className="font-semibold text-[var(--color-ink)] flex items-center gap-1.5">
            <ModeIcon className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
            <span>{mode.label}</span>
          </div>
        </div>
      </div>

      {/* Notes if any */}
      {item.notes && (
        <div className="p-3 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-xs text-[var(--color-ink-muted)]">
          <strong className="text-[var(--color-ink)] block mb-0.5 text-[11px]">Catatan dari Konseli:</strong>
          <p className="italic leading-relaxed">&ldquo;{item.notes}&rdquo;</p>
        </div>
      )}

      {/* Contact and Status Actions - Responsive Mobile First */}
      <div className="pt-2.5 border-t border-[var(--color-paper-border)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        
        {/* Left: Contact actions */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2">
          <a
            href={getAdminContactWhatsAppUrl({
              clientPhone: item.phone,
              clientName: item.alias || item.name,
              code: item.code,
              date: item.date,
              slot: item.timeSlot,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-interactive h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          <a
            href={`mailto:${item.email}?subject=Konfirmasi%20Konseling%20Amelia%20(${item.code})`}
            className="btn-interactive h-8 px-3 rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-xs font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)] inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </a>
        </div>

        {/* Right: Status Change Actions */}
        <div className="flex flex-wrap items-center gap-1.5 justify-start sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--color-paper-border)]">
          <span className="text-[11px] text-[var(--color-ink-muted)] mr-1 shrink-0">Ubah Status:</span>

          {item.status !== 'terkonfirmasi' && (
            <button
              onClick={() => onUpdateStatus(item.id, 'terkonfirmasi')}
              disabled={isUpdating}
              type="button"
              className="btn-interactive h-8 px-2.5 text-xs font-semibold rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white cursor-pointer inline-flex items-center justify-center gap-1 whitespace-nowrap disabled:opacity-50"
            >
              {isUpdating ? <Spinner size="xs" variant="accent" label="Memperbarui..." /> : null}
              <span>Konfirmasi</span>
            </button>
          )}

          {item.status !== 'selesai' && (
            <button
              onClick={() => onUpdateStatus(item.id, 'selesai')}
              disabled={isUpdating}
              type="button"
              className="btn-interactive h-8 px-2.5 text-xs font-semibold rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] cursor-pointer inline-flex items-center justify-center gap-1 whitespace-nowrap disabled:opacity-50"
            >
              {isUpdating ? <Spinner size="xs" variant="muted" label="Memperbarui..." /> : null}
              <span>Selesai</span>
            </button>
          )}

          {item.status !== 'dibatalkan' && (
            <button
              onClick={() => onUpdateStatus(item.id, 'dibatalkan')}
              disabled={isUpdating}
              type="button"
              className="btn-interactive h-8 px-2.5 text-xs font-semibold rounded-lg text-rose-600 bg-rose-50/50 hover:bg-rose-50 border border-rose-200/60 cursor-pointer inline-flex items-center justify-center gap-1 whitespace-nowrap disabled:opacity-50"
            >
              {isUpdating ? <Spinner size="xs" variant="ink" label="Memperbarui..." /> : null}
              <span>Batal</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
