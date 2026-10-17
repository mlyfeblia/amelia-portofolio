'use client';

import React from 'react';
import { Article } from '@/types';
import { ConfirmDecisionModal } from '@/components/ui/ConfirmDecisionModal';

export interface ArticleDeleteModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (article: Article) => Promise<void>;
}

export function ArticleDeleteModal({
  article,
  isOpen,
  onClose,
  onConfirm,
}: ArticleDeleteModalProps) {
  // Retain active article during exit transition without sudden unmount
  const [cachedArticle, setCachedArticle] = React.useState<Article | null>(article);
  if (article && article !== cachedArticle) {
    setCachedArticle(article);
  }
  const activeArticle = article ?? cachedArticle;

  if (!activeArticle) return null;

  return (
    <ConfirmDecisionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => onConfirm(activeArticle)}
      variant="danger"
      title="Hapus Artikel Publikasi?"
      description="Penghapusan artikel dan catatan refleksi konseling."
      confirmLabel="Ya, Hapus"
      cancelLabel="Batal"
      itemDetail={
        <div className="space-y-2">
          <p className="leading-relaxed break-words">
            Artikel{' '}
            <strong className="text-[var(--color-ink)] font-semibold break-words">
              &ldquo;{activeArticle.title}&rdquo;
            </strong>{' '}
            akan dihapus permanen dari basis data.
          </p>
          <div className="pt-1 border-t border-[var(--color-paper-border)]/60 text-[11px] font-mono break-all text-[var(--color-accent)]">
            /articles/{activeArticle.slug}
          </div>
        </div>
      }
    />
  );
}
