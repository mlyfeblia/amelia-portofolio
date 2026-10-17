'use client';

import React, { useState } from 'react';
import { Clock, Edit3, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import { Article } from '@/types';
import { formatIndonesianDate } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDecisionModal } from '@/components/ui/ConfirmDecisionModal';

interface ArticleCardProps {
  article: Article;
  isToggling?: boolean;
  isTogglingLanding?: boolean;
  onEdit: (art: Article) => void;
  onDelete: (art: Article) => void;
  onTogglePublish?: (art: Article) => void;
  onToggleLanding?: (art: Article) => void;
}

export function ArticleCard({
  article,
  isToggling = false,
  isTogglingLanding = false,
  onEdit,
  onDelete,
  onTogglePublish,
  onToggleLanding,
}: ArticleCardProps) {
  const isPublic = article.isPublished !== false;
  const [confirmAction, setConfirmAction] = useState<'publish' | 'landing' | null>(null);
  const [cachedAction, setCachedAction] = useState<'publish' | 'landing' | null>(null);

  if (confirmAction && confirmAction !== cachedAction) {
    setCachedAction(confirmAction);
  }

  const activeAction = confirmAction ?? cachedAction;

  const getModalProps = () => {
    if (activeAction === 'publish') {
      return {
        title: isPublic ? 'Ubah Artikel Menjadi Draf?' : 'Terbitkan Artikel ke Publik?',
        description: isPublic
          ? 'Artikel ini tidak akan lagi terlihat oleh publik di halaman direktori artikel.'
          : 'Artikel ini akan langsung tampil di direktori artikel dan dapat diakses pembaca.',
        variant: isPublic ? ('warning' as const) : ('primary' as const),
        confirmLabel: isPublic ? 'Ya, Jadikan Draf' : 'Ya, Terbitkan',
        icon: isPublic ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />,
        loading: isToggling,
        onConfirm: () => {
          if (onTogglePublish) {
            onTogglePublish(article);
          }
          setConfirmAction(null);
        },
      };
    }

    if (activeAction === 'landing') {
      return {
        title: article.showOnLandingPage ? 'Hapus dari Beranda Utama?' : 'Tampilkan di Beranda Utama?',
        description: article.showOnLandingPage
          ? 'Artikel ini tidak akan lagi ditampilkan di etalase sorotan halaman depan.'
          : 'Artikel ini akan ditampilkan sebagai sorotan utama di bagian artikel pilihan halaman depan.',
        variant: article.showOnLandingPage ? ('warning' as const) : ('primary' as const),
        confirmLabel: article.showOnLandingPage ? 'Hapus dari Beranda' : 'Tampilkan di Beranda',
        icon: <Star className="w-5 h-5" />,
        loading: isTogglingLanding,
        onConfirm: () => {
          if (onToggleLanding) {
            onToggleLanding(article);
          }
          setConfirmAction(null);
        },
      };
    }

    return null;
  };

  const modalProps = getModalProps();

  return (
    <div className="p-3.5 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-xs space-y-3.5 transition-colors duration-200 hover:border-[var(--color-accent)]/30">
      {/* Header Info & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <h2
            className="text-base sm:text-lg font-medium text-[var(--color-ink)] leading-snug line-clamp-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {article.title}
          </h2>

          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed line-clamp-2">
            {article.publishedAt ? `${formatIndonesianDate(article.publishedAt) || article.publishedAt} - ` : ''}{article.excerpt}
          </p>

          <div className="flex items-center gap-2 pt-1 text-xs text-[var(--color-ink-muted)] flex-nowrap overflow-hidden">
            <span className="font-semibold text-[var(--color-accent)] text-xs truncate shrink-0 max-w-[140px] sm:max-w-none">
              {article.category}
            </span>
            <span className="text-[var(--color-paper-border)] shrink-0" aria-hidden="true">&bull;</span>
            <span className="text-[11px] flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3 text-[var(--color-ink-soft)]" />
              <span>{article.readTime ? article.readTime.replace(/\s*baca\s*/i, '').trim() : ''}</span>
            </span>
            <span className="text-[var(--color-paper-border)] shrink-0" aria-hidden="true">&bull;</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--color-ink-soft)] bg-[var(--color-surface)] border border-[var(--color-paper-border)] px-2 py-0.5 rounded-lg shrink-0">
              <Eye className="w-3 h-3" />
              <span>{article.views || 0}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Toolbar: Single Row on Both Mobile & Desktop */}
      <div className="pt-2.5 sm:pt-3 border-t border-[var(--color-paper-border)]">
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {/* 1. Landing Page Showcase Toggle */}
          {onToggleLanding && (
            <button
              onClick={() => setConfirmAction('landing')}
              disabled={isTogglingLanding}
              type="button"
              title={article.showOnLandingPage ? 'Hapus artikel ini dari halaman beranda (landing page)' : 'Tampilkan artikel ini di halaman beranda (landing page)'}
              className={`btn-interactive inline-flex items-center justify-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold border cursor-pointer whitespace-nowrap disabled:opacity-60 transition-colors flex-1 sm:flex-initial shrink-0 ${
                article.showOnLandingPage
                  ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                  : 'bg-[var(--color-paper-muted)] text-[var(--color-ink-muted)] border-[var(--color-paper-border)] hover:bg-[var(--color-paper-border)] hover:text-[var(--color-ink)]'
              }`}
            >
              {isTogglingLanding ? (
                <Spinner size="xs" variant="muted" label="Menyimpan status beranda..." />
              ) : (
                <Star className={`w-3.5 h-3.5 ${article.showOnLandingPage ? 'fill-amber-500 text-amber-600' : 'text-[var(--color-ink-soft)]'}`} />
              )}
              <span>{isTogglingLanding ? 'Menyimpan...' : article.showOnLandingPage ? '★ Di Beranda' : '+ Beranda'}</span>
            </button>
          )}

          {/* 2. 1-Click Visibility Toggle Button */}
          {onTogglePublish && (
            <button
              onClick={() => setConfirmAction('publish')}
              disabled={isToggling}
              type="button"
              title={isPublic ? 'Sembunyikan dari publik (jadikan draf)' : 'Terbitkan ke website publik'}
              className={`btn-interactive inline-flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold border cursor-pointer whitespace-nowrap disabled:opacity-60 flex-1 sm:flex-initial shrink-0 ${
                isPublic
                  ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-[var(--color-accent-border)] hover:bg-[var(--color-accent-border)]/50'
                  : 'bg-[var(--color-paper-muted)] text-[var(--color-ink-muted)] border-[var(--color-paper-border)] hover:bg-[var(--color-paper-border)]'
              }`}
            >
              {isToggling ? (
                <Spinner size="xs" variant="muted" label="Menyimpan status publikasi..." />
              ) : isPublic ? (
                <Eye className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-[var(--color-ink-soft)]" />
              )}
              <span>{isToggling ? 'Menyimpan...' : isPublic ? 'Publik' : 'Draf'}</span>
            </button>
          )}

          {/* 3. Edit Button */}
          <button
            onClick={() => onEdit(article)}
            type="button"
            className="btn-interactive inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white text-[11px] sm:text-xs font-semibold cursor-pointer whitespace-nowrap flex-1 sm:flex-initial shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Ubah</span>
          </button>

          {/* 4. Delete Button */}
          <button
            onClick={() => onDelete(article)}
            type="button"
            className="btn-interactive inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[var(--color-paper-border)] hover:border-red-300 text-[var(--color-ink-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-soft)] text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex-1 sm:flex-initial shrink-0"
            aria-label="Hapus artikel ini"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        </div>
      </div>

      {/* Tags Footer */}
      {article.tags && article.tags.length > 0 && (
        <div className="pt-2.5 border-t border-[var(--color-paper-border)] flex flex-wrap gap-1 text-xs">
          {article.tags.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[10px] text-[var(--color-ink-muted)]"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Decision Modal for Article Visibility & Landing */}
      {modalProps && (
        <ConfirmDecisionModal
          isOpen={confirmAction !== null}
          onClose={() => setConfirmAction(null)}
          onConfirm={modalProps.onConfirm}
          title={modalProps.title}
          description={modalProps.description}
          confirmLabel={modalProps.confirmLabel}
          variant={modalProps.variant}
          icon={modalProps.icon}
          loading={modalProps.loading}
          itemDetail={
            <div className="space-y-1">
              <div className="font-semibold text-[var(--color-ink)] line-clamp-1">{article.title}</div>
              <div className="text-[11px] text-[var(--color-ink-muted)]">
                Kategori: {article.category} &bull; {article.readTime}
              </div>
            </div>
          }
        />
      )}
    </div>
  );
}
