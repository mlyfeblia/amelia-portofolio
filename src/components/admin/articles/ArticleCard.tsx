'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Calendar, Edit3, ExternalLink, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import { Article } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Tooltip } from '@/components/ui/Tooltip';

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

  return (
    <div className="card-interactive p-4 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-xs space-y-3.5">
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
            {article.publishedAt ? `${article.publishedAt} — ` : ''}{article.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {/* Status Badge */}
            {isPublic ? (
              <Badge variant="accent" size="xs" dot>Tayang</Badge>
            ) : (
              <Badge variant="neutral" size="xs">Draf</Badge>
            )}

            <span className="font-semibold text-[var(--color-accent)] text-xs">
              {article.category}
            </span>
            <span className="text-[var(--color-paper-border)]">&bull;</span>
            <span className="text-[var(--color-ink-muted)] text-[11px] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readTime}
            </span>
          </div>
        </div>

        {/* Action Buttons Column: 2 Rows */}
        <div className="flex flex-col gap-2 shrink-0 self-stretch sm:self-start sm:items-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--color-paper-border)]">
          {/* Row 1: + Beranda, Publik/Draf, Ubah */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Landing Page Showcase Toggle */}
            {onToggleLanding && (
              <button
                onClick={() => onToggleLanding(article)}
                disabled={isTogglingLanding}
                type="button"
                title={article.showOnLandingPage ? 'Hapus artikel ini dari halaman beranda (landing page)' : 'Tampilkan artikel ini di halaman beranda (landing page)'}
                className={`btn-interactive flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap disabled:opacity-60 transition-colors ${
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

            {/* 1-Click Visibility Toggle Button */}
            {onTogglePublish && (
              <button
                onClick={() => onTogglePublish(article)}
                disabled={isToggling}
                type="button"
                title={isPublic ? 'Sembunyikan dari publik (jadikan draf)' : 'Terbitkan ke website publik'}
                className={`btn-interactive flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap disabled:opacity-60 ${
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

            {/* Edit Button */}
            <button
              onClick={() => onEdit(article)}
              type="button"
              className="btn-interactive flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white text-xs font-semibold cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Ubah</span>
            </button>
          </div>

          {/* Row 2: ExternalLink & Hapus/Trash */}
          <div className="flex items-center gap-1.5 sm:gap-2 justify-end w-full">
            {/* Public Preview Link */}
            {isPublic && (
              <Tooltip content="Buka di web publik" position="top">
                <Link
                  href={`/articles/${article.slug}`}
                  target="_blank"
                  className="btn-interactive inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:bg-[var(--color-paper-muted)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] text-xs cursor-pointer"
                  aria-label="Buka tampilan web publik"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium sm:hidden">Lihat Web</span>
                </Link>
              </Tooltip>
            )}

            {/* Delete Button */}
            <Tooltip content="Hapus artikel" position="top">
              <button
                onClick={() => onDelete(article)}
                type="button"
                className="btn-interactive inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--color-paper-border)] hover:border-red-300 text-[var(--color-ink-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-soft)] text-xs transition-colors cursor-pointer"
                aria-label="Hapus artikel ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium sm:hidden">Hapus</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Slug & Tags Footer */}
      <div className="pt-2.5 border-t border-[var(--color-paper-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-[var(--color-ink-muted)] font-mono text-[11px] overflow-hidden text-ellipsis">
          <span className="shrink-0">URL:</span>
          <code className="px-1.5 py-0.5 rounded bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-accent)] truncate max-w-[260px] sm:max-w-none">
            /articles/{article.slug}
          </code>
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
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
      </div>
    </div>
  );
}
