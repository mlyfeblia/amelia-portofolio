'use client';

import React from 'react';
import { BookOpen, Plus, SearchX, RotateCcw } from 'lucide-react';
import { Article } from '@/types';
import { ArticleCard } from './ArticleCard';
import { SkeletonArticleCard } from '@/components/ui/Skeleton';
import { PaginationBar } from '@/components/ui/PaginationBar';

interface ArticleListProps {
  articles: Article[];
  loading: boolean;
  togglingId?: string | null;
  togglingLandingId?: string | null;
  search?: string;
  statusFilter?: string;
  selectedCategory?: string;
  landingFilter?: string;
  dateFilter?: string;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  onEdit: (art: Article) => void;
  onDelete: (art: Article) => void;
  onTogglePublish?: (art: Article) => void;
  onToggleLanding?: (art: Article) => void;
  onCreateNew: () => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export function ArticleList({
  articles,
  loading,
  togglingId,
  togglingLandingId,
  search,
  statusFilter = 'semua',
  selectedCategory = 'Semua',
  landingFilter = 'semua',
  dateFilter,
  hasActiveFilters,
  onResetFilters,
  onEdit,
  onDelete,
  onTogglePublish,
  onToggleLanding,
  onCreateNew,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
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
      <div className="p-8 sm:p-12 text-center bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl text-xs text-[var(--color-ink-muted)] space-y-3 tab-content-enter">
        {hasActiveFilters ? (
          <>
            <div className="w-12 h-12 rounded-full bg-[var(--color-paper-muted)] text-[var(--color-ink-muted)] mx-auto flex items-center justify-center">
              <SearchX className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-sm text-[var(--color-ink)]">
                Tidak ada artikel yang cocok
              </p>
              <p className="max-w-md mx-auto leading-relaxed">
                {search ? (
                  <>
                    Tidak ditemukan artikel untuk kata kunci <span className="font-semibold text-[var(--color-ink)]">&ldquo;{search}&rdquo;</span>.
                  </>
                ) : (
                  'Tidak ada artikel yang memenuhi filter yang sedang aktif.'
                )}
                {statusFilter !== 'semua' && (
                  <span className="block mt-0.5 text-[11px] text-[var(--color-ink-soft)]">
                    Filter status: &ldquo;{statusFilter === 'published' ? 'Publik' : 'Draf'}&rdquo;
                  </span>
                )}
                {selectedCategory !== 'Semua' && (
                  <span className="block mt-0.5 text-[11px] text-[var(--color-ink-soft)]">
                    Filter kategori: &ldquo;{selectedCategory}&rdquo;
                  </span>
                )}
                {landingFilter === 'landing' && (
                  <span className="block mt-0.5 text-[11px] text-[var(--color-ink-soft)]">
                    Filter: Hanya di Beranda
                  </span>
                )}
                {dateFilter && (
                  <span className="block mt-0.5 text-[11px] text-[var(--color-ink-soft)]">
                    Filter tanggal rilis: &ldquo;{dateFilter}&rdquo;
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {onResetFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="btn-secondary btn-interactive inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Semua Filter &amp; Pencarian</span>
                </button>
              )}
              <button
                onClick={onCreateNew}
                type="button"
                className="btn-primary btn-interactive inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tulis Artikel Baru</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <BookOpen className="w-8 h-8 text-[var(--color-ink-muted)]/50 mx-auto mb-1" />
            <p className="font-semibold text-sm text-[var(--color-ink)]">Belum ada artikel yang diterbitkan</p>
            <p>Mulai bagikan tulisan dan wawasan konseling pertamamu.</p>
            <div className="pt-2">
              <button
                onClick={onCreateNew}
                type="button"
                className="btn-primary btn-interactive inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tulis Artikel Sekarang</span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div key={currentPage} className="grid grid-cols-1 gap-3.5 sm:gap-4 pagination-slide-enter">
        {articles.map((art) => (
          <ArticleCard
            key={art.id}
            article={art}
            isToggling={togglingId === art.id}
            isTogglingLanding={togglingLandingId === art.id}
            onEdit={onEdit}
            onDelete={onDelete}
            onTogglePublish={onTogglePublish}
            onToggleLanding={onToggleLanding}
          />
        ))}
      </div>

      {totalPages && totalPages > 1 && onPageChange && (
        <PaginationBar
          currentPage={currentPage || 1}
          totalPages={totalPages}
          totalItems={totalItems || articles.length}
          itemsPerPage={itemsPerPage || 6}
          itemLabel="artikel"
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
