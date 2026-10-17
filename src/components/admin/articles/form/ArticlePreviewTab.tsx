'use client';

import React from 'react';
import Image from 'next/image';
import { Star, FileEdit } from 'lucide-react';
import { FormState } from './ArticleMetaFields';
import { ArticleMarkdownRenderer } from '@/components/articles/ArticleMarkdownRenderer';

export interface ArticlePreviewTabProps {
  formData: FormState;
  publishedAt?: string;
  onClose: () => void;
  onBackToEdit: () => void;
}

export function ArticlePreviewTab({
  formData,
  publishedAt,
  onClose,
  onBackToEdit,
}: ArticlePreviewTabProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden tab-content-enter">
      <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 flex-1 overscroll-contain scroll-isolated modal-scroll-body">
        {/* Cover Image in Preview */}
        {formData.coverImage && (
          <div className="relative aspect-video sm:aspect-21/9 w-full rounded-2xl overflow-hidden border border-[var(--color-paper-border)] shadow-xs bg-[var(--color-paper-muted)]/50">
            <Image
              src={formData.coverImage}
              alt={formData.title || 'Foto Sampul'}
              fill
              className="object-cover"
              unoptimized={formData.coverImage.startsWith('http')}
              sizes="(max-width: 768px) 100vw, 700px"
            />
          </div>
        )}

        <div className="space-y-2 pb-3 border-b border-[var(--color-paper-border)]">
          <h1
            className="text-lg sm:text-2xl font-medium text-[var(--color-ink)] leading-snug"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {formData.title || 'Judul Artikel'}
          </h1>
          {formData.excerpt && (
            <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
              {publishedAt || 'Hari ini'} - {formData.excerpt}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="font-semibold text-xs text-[var(--color-accent)]">
              {formData.category || 'Kategori'}
            </span>
            <span className="text-[var(--color-paper-border)]">&bull;</span>
            <span className="text-xs text-[var(--color-ink-muted)]">
              {formData.isPublished ? 'Publik' : 'Draf'}
            </span>
            {formData.showOnLandingPage && (
              <>
                <span className="text-[var(--color-paper-border)]">&bull;</span>
                <span className="text-xs text-amber-700 inline-flex items-center gap-1 font-medium">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                  <span>Beranda</span>
                </span>
              </>
            )}
            <span className="text-[var(--color-paper-border)]">&bull;</span>
            <span className="text-xs text-[var(--color-ink-muted)]">
              {formData.readTime || '5 menit baca'}
            </span>
            <span className="text-[var(--color-paper-border)]">&bull;</span>
            <span className="text-xs text-[var(--color-ink-muted)] font-mono">
              /articles/{formData.slug || 'url'}
            </span>
          </div>
        </div>

        {/* Canonical Article Markdown Preview */}
        <div className="pt-2 pb-6">
          {formData.content.trim() ? (
            <ArticleMarkdownRenderer content={formData.content} />
          ) : (
            <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] italic">
              Belum ada konten artikel untuk ditampilkan di pratinjau.
            </p>
          )}
        </div>
      </div>

      <div className="p-2.5 min-[340px]:p-3.5 sm:p-4 border-t border-[var(--color-paper-border)] flex flex-wrap items-center justify-end gap-2 sm:gap-3 bg-[var(--color-surface)] shrink-0 pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
        <button
          onClick={onClose}
          type="button"
          className="h-9 sm:h-9 px-4 rounded-xl text-xs font-semibold bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] transition-all cursor-pointer inline-flex items-center justify-center whitespace-nowrap flex-1 sm:flex-initial"
        >
          Tutup
        </button>
        <button
          type="button"
          onClick={onBackToEdit}
          className="h-9 sm:h-9 px-4 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
        >
          <FileEdit className="w-4 h-4 shrink-0" />
          <span>Kembali ke Formulir</span>
        </button>
      </div>
    </div>
  );
}
