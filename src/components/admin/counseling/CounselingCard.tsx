'use client';

import React, { useState } from 'react';
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
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDecisionModal } from '@/components/ui/ConfirmDecisionModal';

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
  const [showPrivacyConfirm, setShowPrivacyConfirm] = useState(false);
  const [showLandingConfirm, setShowLandingConfirm] = useState(false);

  return (
    <div className="p-3.5 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-xs space-y-3.5 transition-colors duration-200 hover:border-[var(--color-accent)]/30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 pb-3 border-b border-[var(--color-paper-border)]">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
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

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs self-start sm:self-auto shrink-0 w-full sm:w-auto">
          {/* Landing Page Showcase Toggle Button */}
          <button
            onClick={() => setShowLandingConfirm(true)}
            disabled={isTogglingLanding}
            type="button"
            title={item.showOnLandingPage ? 'Hapus curhat ini dari halaman beranda (landing page)' : 'Tampilkan curhat ini di halaman beranda (landing page)'}
            className={`btn-interactive inline-flex items-center justify-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold border cursor-pointer whitespace-nowrap disabled:opacity-60 transition-colors flex-1 sm:flex-initial shrink-0 ${
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

          {/* 1-Click Visibility Toggle Button (Publik / Draf) */}
          <button
            onClick={() => setShowPrivacyConfirm(true)}
            disabled={isToggling}
            type="button"
            title={item.isPublic ? 'Sembunyikan dari publik (jadikan draf)' : 'Terbitkan ke website publik'}
            className={`btn-interactive inline-flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold border cursor-pointer whitespace-nowrap disabled:opacity-60 flex-1 sm:flex-initial shrink-0 ${
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
            <span>{isToggling ? 'Menyimpan...' : item.isPublic ? 'Publik' : 'Draf'}</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={onDelete}
            type="button"
            className="btn-interactive inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[var(--color-paper-border)] hover:border-red-300 text-[var(--color-ink-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-soft)] text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex-1 sm:flex-initial shrink-0"
            aria-label="Hapus pesan curhat ini"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        </div>
      </div>

      {/* Message */}
      <blockquote className="text-xs sm:text-sm text-[var(--color-ink)] leading-relaxed italic bg-[var(--color-paper)] p-2.5 sm:p-4 rounded-xl border border-[var(--color-paper-border)]">
        &ldquo;{item.message}&rdquo;
      </blockquote>

      {/* Existing Answer */}
      {item.answer && (
        <div className="p-2.5 sm:p-4 rounded-xl bg-[var(--color-accent-soft)]/50 border border-[var(--color-accent-border)] space-y-1.5">
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

      {/* Reply Trigger Button */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={onStartReply}
          type="button"
          className="btn-interactive inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white border border-[var(--color-accent-border)] text-[11px] sm:text-xs font-semibold cursor-pointer whitespace-nowrap shadow-2xs transition-all"
        >
          <Send className="w-3.5 h-3.5 shrink-0" />
          <span>{item.answer ? 'Ubah Tanggapan' : 'Beri Tanggapan'}</span>
        </button>
      </div>

      {/* Reply Modal Dialog with Standardized Enter/Exit Transitions */}
      <CounselingReplyBox
        isOpen={isReplying}
        initialText={item.answer || ''}
        initialPublic={item.isPublic}
        initialLanding={item.showOnLandingPage ?? false}
        itemId={item.id}
        itemAlias={item.alias}
        originalMessage={item.message}
        onCancel={onCancelReply}
        onSave={onSaveReply}
      />

      {/* Decision Modal for Privacy Toggle */}
      <ConfirmDecisionModal
        isOpen={showPrivacyConfirm}
        onClose={() => setShowPrivacyConfirm(false)}
        onConfirm={() => {
          onTogglePrivacy();
          setShowPrivacyConfirm(false);
        }}
        title={item.isPublic ? 'Sembunyikan Cerita dari Publik?' : 'Publikasikan Cerita ke Dinding Curhat?'}
        description={
          item.isPublic
            ? 'Pesan curhat ini akan dialihkan ke mode privat dan tidak akan ditampilkan pada Dinding Curhat publik.'
            : 'Pesan curhat dan tanggapan konselor akan ditampilkan di Dinding Curhat (nama samaran tetap terlindungi aman).'
        }
        variant={item.isPublic ? 'warning' : 'primary'}
        confirmLabel={item.isPublic ? 'Jadikan Privat' : 'Publikasikan'}
        icon={item.isPublic ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        loading={isToggling}
        itemDetail={
          <div className="space-y-1">
            <div>
              <span className="font-semibold text-[var(--color-ink)]">Konseli Samaran:</span> {item.alias}
            </div>
            <div>
              <span className="font-semibold text-[var(--color-ink)]">Topik:</span> {item.category}
            </div>
            <div className="line-clamp-2 italic text-[11px] pt-0.5">
              &ldquo;{item.message}&rdquo;
            </div>
          </div>
        }
      />

      {/* Decision Modal for Landing Page Spotlight Toggle */}
      <ConfirmDecisionModal
        isOpen={showLandingConfirm}
        onClose={() => setShowLandingConfirm(false)}
        onConfirm={() => {
          onToggleLanding();
          setShowLandingConfirm(false);
        }}
        title={item.showOnLandingPage ? 'Hapus Curhat dari Beranda Utama?' : 'Tampilkan Curhat di Beranda Utama?'}
        description={
          item.showOnLandingPage
            ? 'Pesan curhat ini tidak akan lagi ditampilkan di etalase sorotan cerita beranda utama.'
            : 'Pesan curhat dan tanggapan konselor akan ditampilkan sebagai sorotan pilihan di etalase beranda utama (nama samaran tetap terlindungi aman).'
        }
        variant={item.showOnLandingPage ? 'warning' : 'primary'}
        confirmLabel={item.showOnLandingPage ? 'Hapus dari Beranda' : 'Tampilkan di Beranda'}
        icon={<Star className="w-5 h-5" />}
        loading={isTogglingLanding}
        itemDetail={
          <div className="space-y-1">
            <div>
              <span className="font-semibold text-[var(--color-ink)]">Konseli Samaran:</span> {item.alias}
            </div>
            <div>
              <span className="font-semibold text-[var(--color-ink)]">Topik:</span> {item.category}
            </div>
            <div className="line-clamp-2 italic text-[11px] pt-0.5">
              &ldquo;{item.message}&rdquo;
            </div>
          </div>
        }
      />
    </div>
  );
}
