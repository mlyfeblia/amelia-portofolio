'use client';

import React from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { Article } from '@/types';
import { ArticleCard } from './ArticleCard';
import { SkeletonArticleCard } from '@/components/ui/Skeleton';

interface ArticleListProps {
  articles: Article[];
  loading: boolean;
  togglingId?: string | null;
  onEdit: (art: Article) => void;
  onDelete: (art: Article) => void;
  onTogglePublish?: (art: Article) => void;
  onCreateNew: () => void;
}

export function ArticleList({
  articles,
  loading,
  togglingId,
  onEdit,
  onDelete,
  onTogglePublish,
  onCreateNew,
}: ArticleListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3.5 sm:gap-4">
        <SkeletonArticleCard />
        <SkeletonArticleCard />
        <SkeletonArticleCard />
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl text-xs text-[var(--color-ink-muted)] space-y-3">
        <BookOpen className="w-8 h-8 text-[var(--color-ink-muted)]/50 mx-auto mb-1" />
        <p className="font-semibold text-sm text-[var(--color-ink)]">Tidak ada artikel yang sesuai</p>
        <p>Coba sesuaikan kata kunci pencarian atau kategori yang dipilih.</p>
        <button
          onClick={onCreateNew}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tulis Artikel Sekarang</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:gap-4">
      {articles.map((art) => (
        <ArticleCard
          key={art.id}
          article={art}
          isToggling={togglingId === art.id}
          onEdit={onEdit}
          onDelete={onDelete}
          onTogglePublish={onTogglePublish}
        />
      ))}
    </div>
  );
}
