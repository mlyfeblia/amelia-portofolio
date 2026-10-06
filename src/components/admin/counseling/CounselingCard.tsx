'use client';

import React from 'react';
import { 
  Calendar, 
  Eye, 
  EyeOff, 
  Trash2, 
  HeartHandshake, 
  Send,
  Star
} from 'lucide-react';
import { AnonymousMessage } from '@/types';
import { CounselingReplyBox } from './CounselingReplyBox';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Tooltip } from '@/components/ui/Tooltip';

function formatDate(isoString?: string) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(d) + ' WIB';
  } catch {
    return isoString;
  }
}

interface CounselingCardProps {
  item: AnonymousMessage;
  isReplying: boolean;
  isToggling: boolean;
  isTogglingLanding?: boolean;
  onStartReply: () => void;
  onCancelReply: () => void;
  onSaveReply: (text: string, isPublic: boolean, showOnLandingPage: boolean) => Promise<void>;
  onTogglePrivacy: () => void;
  onToggleLanding: () => void;
  onDelete: () => void;
}

export function CounselingCard({
  item,
  isReplying,
  isToggling,
  isTogglingLanding = false,
  onStartReply,
  onCancelReply,
  onSaveReply,
  onTogglePrivacy,
  onToggleLanding,
  onDelete,
}: CounselingCardProps) {
  return (
    <div className="card-interactive p-4 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-xs space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 pb-3 border-b border-[var(--color-paper-border)]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-[var(--color-ink)] text-sm sm:text-base">
            {item.alias}
          </span>
          <span className="text-[var(--color-paper-border)]">&bull;</span>
          <span className="text-[11px] sm:text-xs text-[var(--color-accent)] font-medium">
            {item.category}
          </span>
          {item.createdAt && (
            <>
              <span className="text-[var(--color-paper-border)]">&bull;</span>
              <span className="text-[10px] sm:text-[11px] text-[var(--color-ink-muted)] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[var(--color-ink-muted)]" />
                {formatDate(item.createdAt)}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs self-start sm:self-auto shrink-0">
          {item.isAnswered ? (
            <Badge variant="accent" size="xs" dot>Dijawab</Badge>
          ) : (
            <Badge variant="warning" size="xs" dot>Menunggu</Badge>
          )}

          {/* Landing Page Toggle Button with Star icon */}
          <button
            onClick={onToggleLanding}
            disabled={isTogglingLanding}
            type="button"
            title={item.showOnLandingPage ? 'Hapus curhat ini dari halaman beranda (landing page)' : 'Tampilkan curhat ini di halaman beranda (landing page)'}
            className={`btn-interactive inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer whitespace-nowrap disabled:opacity-60 transition-colors ${
              item.showOnLandingPage
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                : 'bg-[var(--color-paper-muted)] text-[var(--color-ink-muted)] border-[var(--color-paper-border)] hover:bg-[var(--color-paper-border)] hover:text-[var(--color-ink)]'
            }`}
          >
            {isTogglingLanding ? (
              <Spinner size="xs" variant="muted" label="Menyimpan status beranda..." />
            ) : (
              <Star className={`w-3.5 h-3.5 ${item.showOnLandingPage ? 'fill-amber-500 text-amber-600' : 'text-[var(--color-ink-soft)]'}`} />
            )}
            <span>{isTogglingLanding ? 'Menyimpan...' : item.showOnLandingPage ? '★ Di Beranda' : '+ Beranda'}</span>
          </button>

          {/* Privacy Toggle Button with clear badge */}
          <button
            onClick={onTogglePrivacy}
            disabled={isToggling}
            type="button"
            title={`Klik untuk ubah visibilitas ke ${item.isPublic ? 'Privat' : 'Publik'}`}
            className={`btn-interactive inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer whitespace-nowrap disabled:opacity-60 ${
              item.isPublic
                ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-[var(--color-accent-border)] hover:bg-[var(--color-accent-border)]/50'
                : 'bg-[var(--color-paper-muted)] text-[var(--color-ink-muted)] border-[var(--color-paper-border)] hover:bg-[var(--color-paper-border)]'
            }`}
          >
            {isToggling ? (
              <Spinner size="xs" variant="muted" label="Menyimpan visibilitas..." />
            ) : item.isPublic ? (
              <Eye className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-[var(--color-ink-soft)]" />
            )}
            <span>{isToggling ? 'Menyimpan...' : item.isPublic ? 'Publik' : 'Privat'}</span>
          </button>

          {/* Delete Button */}
          <Tooltip content="Hapus pesan curhat" position="top">
            <button
              onClick={onDelete}
              type="button"
              className="btn-interactive p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-soft)] transition-colors cursor-pointer shrink-0"
              aria-label="Hapus pesan curhat ini"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Message */}
      <blockquote className="text-xs sm:text-sm text-[var(--color-ink)] leading-relaxed italic bg-[var(--color-paper)] p-3 sm:p-4 rounded-xl border border-[var(--color-paper-border)]">
        &ldquo;{item.message}&rdquo;
      </blockquote>

      {/* Existing Answer */}
      {item.answer && (
        <div className="p-3 sm:p-4 rounded-xl bg-[var(--color-accent-soft)]/50 border border-[var(--color-accent-border)] space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wider">
              <HeartHandshake className="w-3.5 h-3.5 shrink-0" />
              <span>Tanggapan Penguatan Amel:</span>
            </div>
            {item.answeredAt && (
              <span className="text-[10px] text-[var(--color-ink-muted)]">
                {formatDate(item.answeredAt)}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-ink)] leading-relaxed whitespace-pre-wrap">
            {item.answer}
          </p>
        </div>
      )}

      {/* Reply Box or Trigger Button */}
      {isReplying ? (
        <div className="tab-content-enter">
          <CounselingReplyBox
            initialText={item.answer || ''}
            initialPublic={item.isPublic}
            initialLanding={item.showOnLandingPage ?? false}
            itemId={item.id}
            itemAlias={item.alias}
            onCancel={onCancelReply}
            onSave={onSaveReply}
          />
        </div>
      ) : (
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={onStartReply}
            type="button"
            className="btn-interactive px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] text-[var(--color-ink)] hover:text-[var(--color-accent)] cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3 h-3 text-[var(--color-accent)]" />
            <span>{item.answer ? 'Ubah Tanggapan' : 'Beri Tanggapan'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
