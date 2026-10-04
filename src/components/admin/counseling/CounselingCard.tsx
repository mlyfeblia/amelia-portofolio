'use client';

import React from 'react';
import { 
  Calendar, 
  Eye, 
  EyeOff, 
  Trash2, 
  HeartHandshake, 
  Send 
} from 'lucide-react';
import { AnonymousMessage } from '@/types';
import { CounselingReplyBox } from './CounselingReplyBox';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

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
  onStartReply: () => void;
  onCancelReply: () => void;
  onSaveReply: (text: string, isPublic: boolean) => Promise<void>;
  onTogglePrivacy: () => void;
  onDelete: () => void;
}

export function CounselingCard({
  item,
  isReplying,
  isToggling,
  onStartReply,
  onCancelReply,
  onSaveReply,
  onTogglePrivacy,
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
          <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-medium">
            {item.category}
          </span>
          {item.createdAt && (
            <span className="text-[10px] sm:text-[11px] text-[var(--color-ink-muted)] flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[var(--color-ink-muted)]" />
              {formatDate(item.createdAt)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs self-start sm:self-auto shrink-0">
          {item.isAnswered ? (
            <Badge variant="accent" size="xs" dot>Dijawab</Badge>
          ) : (
            <Badge variant="warning" size="xs" dot>Menanti Respon</Badge>
          )}

          {/* Privacy Toggle Button with clear badge */}
          <button
            onClick={onTogglePrivacy}
            disabled={isToggling}
            type="button"
            title={`Klik untuk ubah visibilitas ke ${item.isPublic ? 'Privat' : 'Publik'}`}
            className={`btn-interactive inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer whitespace-nowrap disabled:opacity-60 ${
              item.isPublic
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
            }`}
          >
            {isToggling ? (
              <Spinner size="xs" variant="muted" label="Menyimpan visibilitas..." />
            ) : item.isPublic ? (
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
            )}
            <span>{isToggling ? 'Menyimpan...' : item.isPublic ? 'Publik' : 'Privat'}</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={onDelete}
            type="button"
            title="Hapus pesan curhat ini"
            className="btn-interactive p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
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
        <CounselingReplyBox
          initialText={item.answer || ''}
          initialPublic={item.isPublic}
          onCancel={onCancelReply}
          onSave={onSaveReply}
        />
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
