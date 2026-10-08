'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  Trash2, 
  Phone, 
  Mail, 
  Video, 
  MessageSquare, 
  Users,
  Copy,
  Check,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Booking, BookingStatus, CounselingMode } from '@/types';
import { getAdminContactWhatsAppUrl } from '@/lib/whatsapp';
import { getAdminContactEmailUrl } from '@/lib/email-template';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Tooltip } from '@/components/ui/Tooltip';
import { useToast } from '@/components/ui/Toast';
import { ConfirmDecisionModal } from '@/components/ui/ConfirmDecisionModal';

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

  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<BookingStatus | null>(null);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(item.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(`Kode ${item.code} disalin ke clipboard!`);
    } catch {
      toast.info(`Kode: ${item.code}`);
    }
  };

  const getModalConfig = () => {
    switch (pendingStatus) {
      case 'terkonfirmasi':
        return {
          title: 'Konfirmasi Jadwal Konseling?',
          description:
            'Status reservasi akan diubah menjadi terkonfirmasi. Slot waktu ini terkunci resmi dan Anda dapat langsung menghubungi konseli via WhatsApp untuk konfirmasi detail pertemuan.',
          variant: 'primary' as const,
          confirmLabel: 'Ya, Konfirmasi Jadwal',
        };
      case 'selesai':
        return {
          title: 'Tandai Sesi Telah Selesai?',
          description:
            'Sesi konseling ini telah selesai dilaksanakan. Rekam jejak status akan diperbarui ke arsip sesi selesai.',
          variant: 'warning' as const,
          confirmLabel: 'Ya, Tandai Selesai',
        };
      case 'dibatalkan':
        return {
          title: 'Batalkan Jadwal Konseling?',
          description:
            'Reservasi ini akan dibatalkan. Konseli dapat mengajukan kembali jadwal pengganti di lain waktu jika diperlukan.',
          variant: 'danger' as const,
          confirmLabel: 'Ya, Batalkan Jadwal',
        };
      default:
        return {
          title: '',
          description: '',
          variant: 'primary' as const,
          confirmLabel: 'Konfirmasi',
        };
    }
  };

  const modalConfig = getModalConfig();

  return (
    <div className="card-interactive p-3 min-[340px]:p-3.5 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-xs space-y-3.5">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--color-paper-border)]">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <Tooltip content="Salin kode booking" position="top">
            <button
              type="button"
              onClick={handleCopyCode}
              className="btn-interactive font-mono text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-md bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-accent)] hover:bg-[var(--color-paper-muted)] cursor-pointer inline-flex items-center gap-1 sm:gap-1.5 transition-colors select-text shrink-0"
              aria-label={`Salin kode booking ${item.code}`}
            >
              <span>{item.code}</span>
              {copied ? (
                <Check className="w-3 h-3 text-emerald-600 animate-pop-success shrink-0" />
              ) : (
                <Copy className="w-3 h-3 text-[var(--color-ink-muted)] shrink-0" />
              )}
            </button>
          </Tooltip>
          <div className="min-w-0">
            <h3 className="font-semibold text-[var(--color-ink)] text-xs sm:text-base leading-tight truncate sm:whitespace-normal">
              {item.name}
            </h3>
            {item.alias && item.alias !== item.name && (
              <p className="text-[10px] sm:text-[11px] text-[var(--color-ink-muted)] truncate">Panggilan: {item.alias}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {getStatusBadgeElement()}

          <Tooltip content="Hapus janji temu" position="top">
            <button
              onClick={() => onDelete(item)}
              type="button"
              className="btn-interactive p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-soft)] transition-colors cursor-pointer"
              aria-label="Hapus janji temu ini"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Details grid: 1 col on mobile, 3 cols on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
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
        <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-xs text-[var(--color-ink-muted)]">
          <strong className="text-[var(--color-ink)] block mb-0.5 text-[11px]">Catatan dari Konseli:</strong>
          <p className="italic leading-relaxed">&ldquo;{item.notes}&rdquo;</p>
        </div>
      )}

      {/* Confirmed Status Follow-up Banner */}
      {item.status === 'terkonfirmasi' && (
        <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-950 flex flex-col min-[340px]:flex-row items-start min-[340px]:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium text-[11px] sm:text-xs leading-snug">
              Sesi ini terkonfirmasi. Kirim kabar atau tautan Google Meet ke konseli:
            </span>
          </div>
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
            className="btn-interactive inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-semibold text-xs shadow-2xs hover:bg-[#20ba5a] transition-all shrink-0 cursor-pointer whitespace-nowrap w-full min-[340px]:w-auto"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Kirim Kabar WhatsApp</span>
          </a>
        </div>
      )}

      {/* Contact and Status Actions - Responsive Mobile First */}
      <div className="pt-2.5 border-t border-[var(--color-paper-border)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        
        {/* Left: Contact actions */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
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
            className="btn-interactive h-8 px-2.5 sm:px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap flex-1 sm:flex-initial"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          <a
            href={getAdminContactEmailUrl({
              clientEmail: item.email,
              clientName: item.alias || item.name,
              code: item.code,
              date: item.date,
              slot: item.timeSlot,
            })}
            className="btn-interactive h-8 px-2.5 sm:px-3 rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-xs font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)] inline-flex items-center justify-center gap-1.5 whitespace-nowrap flex-1 sm:flex-initial"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </a>
        </div>

        {/* Right: Status Change Actions */}
        <div className="flex flex-wrap items-center gap-1.5 justify-start sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--color-paper-border)] w-full sm:w-auto">
          <span className="text-[11px] text-[var(--color-ink-muted)] w-full min-[320px]:w-auto mr-1 shrink-0">Ubah Status:</span>

          {item.status !== 'terkonfirmasi' && (
            <button
              onClick={() => setPendingStatus('terkonfirmasi')}
              disabled={isUpdating}
              type="button"
              className="btn-interactive h-7 sm:h-8 px-2 sm:px-2.5 text-[11px] sm:text-xs font-semibold rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white cursor-pointer inline-flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap disabled:opacity-50 flex-1 min-[340px]:flex-initial"
            >
              {isUpdating && pendingStatus === 'terkonfirmasi' ? (
                <Spinner size="xs" variant="accent" label="Memperbarui..." />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>Konfirmasi</span>
            </button>
          )}

          {item.status !== 'selesai' && (
            <button
              onClick={() => setPendingStatus('selesai')}
              disabled={isUpdating}
              type="button"
              className="btn-interactive h-7 sm:h-8 px-2 sm:px-2.5 text-[11px] sm:text-xs font-semibold rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] cursor-pointer inline-flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap disabled:opacity-50 flex-1 min-[340px]:flex-initial"
            >
              {isUpdating && pendingStatus === 'selesai' ? (
                <Spinner size="xs" variant="muted" label="Memperbarui..." />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Selesai</span>
            </button>
          )}

          {item.status !== 'dibatalkan' && (
            <button
              onClick={() => setPendingStatus('dibatalkan')}
              disabled={isUpdating}
              type="button"
              className="btn-interactive h-7 sm:h-8 px-2 sm:px-2.5 text-[11px] sm:text-xs font-semibold rounded-lg text-[var(--color-error)] bg-[var(--color-error-soft)]/60 hover:bg-[var(--color-error-soft)] border border-[var(--color-error-border)] cursor-pointer inline-flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap disabled:opacity-50 flex-1 min-[340px]:flex-initial"
            >
              {isUpdating && pendingStatus === 'dibatalkan' ? (
                <Spinner size="xs" variant="ink" label="Memperbarui..." />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              <span>Batal</span>
            </button>
          )}
        </div>

      </div>

      {/* Decision Modal for Status Change */}
      <ConfirmDecisionModal
        isOpen={pendingStatus !== null}
        onClose={() => setPendingStatus(null)}
        onConfirm={() => {
          if (pendingStatus) {
            onUpdateStatus(item.id, pendingStatus);
            setPendingStatus(null);
          }
        }}
        title={modalConfig.title}
        description={modalConfig.description}
        confirmLabel={modalConfig.confirmLabel}
        variant={modalConfig.variant}
        loading={isUpdating}
        itemDetail={
          <div className="space-y-1.5 text-xs text-[var(--color-ink-muted)]">
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="font-semibold text-[var(--color-ink)] shrink-0">Konseli:</span>
              <span className="font-medium text-[var(--color-ink)]">
                {item.name} {item.alias && item.alias !== item.name ? `(${item.alias})` : ''}
              </span>
              <span className="font-mono text-[11px] text-[var(--color-accent)]">({item.code})</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="font-semibold text-[var(--color-ink)] shrink-0">Kontak:</span>
              <span>{item.phone} &bull; {item.email}</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="font-semibold text-[var(--color-ink)] shrink-0">Jadwal:</span>
              <span>{item.date} &bull; {item.timeSlot}</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="font-semibold text-[var(--color-ink)] shrink-0">Format:</span>
              <span>{mode.label}</span>
            </div>
            {pendingStatus && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-[var(--color-paper-border)]">
                <span className="font-semibold text-[var(--color-ink)] shrink-0">Perubahan Status:</span>
                <span className="capitalize px-1.5 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-[11px] font-medium">
                  {item.status}
                </span>
                <span className="text-[var(--color-ink-muted)]">&rarr;</span>
                <span className="capitalize font-semibold text-[var(--color-accent)] px-1.5 py-0.5 rounded bg-[var(--color-accent-soft)] text-[11px]">
                  {pendingStatus}
                </span>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}
