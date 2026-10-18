'use client';

import React, { useRef } from 'react';
import { BookOpen, Plus, SearchX, RotateCcw } from 'lucide-react';
import { Article } from '@/types';
import { ArticleCard } from './ArticleCard';
import { SkeletonArticleCard } from '@/components/ui/Skeleton';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { scrollContainerIntoViewIfAbove } from '@/lib/dom-utils';

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
    if (hasActiveFilters) {
      const activeFiltersList: { label: string; value: string }[] = [];
      if (search) activeFiltersList.push({ label: 'Kata Kunci', value: search });
      if (statusFilter !== 'semua') activeFiltersList.push({ label: 'Status', value: statusFilter === 'published' ? 'Publik' : 'Draf' });
      if (selectedCategory !== 'Semua') activeFiltersList.push({ label: 'Kategori', value: selectedCategory });
      if (landingFilter === 'landing') activeFiltersList.push({ label: 'Tampilan', value: 'Hanya di Beranda' });
      if (dateFilter) activeFiltersList.push({ label: 'Tanggal', value: dateFilter });

      return (
        <EmptyState
          icon={<SearchX className="w-6 h-6 stroke-[1.75]" />}
          title="Tidak Ada Artikel yang Cocok"
          description="Tidak ditemukan artikel atau draf publikasi yang memenuhi kata kunci dan kriteria filter saat ini."
          activeFilters={activeFiltersList}
          action={
            <button
              onClick={onCreateNew}
              type="button"
              className="btn-primary btn-interactive inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tulis Artikel Baru</span>
            </button>
          }
          secondaryAction={
            onResetFilters ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onResetFilters();
                }}
                className="btn-secondary btn-interactive inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Semua Filter &amp; Pencarian</span>
              </button>
            ) : undefined
          }
        />
      );
    }

    return (
      <EmptyState
        icon={<BookOpen className="w-6 h-6 stroke-[1.75]" />}
        title="Belum Ada Artikel yang Diterbitkan"
        description="Mulai bagikan tulisan reflektif, edukasi bimbingan konseling Islam, atau artikel kesehatan mental pertamamu kepada para konseli dan pembaca umum."
        action={
          <button
            onClick={onCreateNew}
            type="button"
            className="btn-primary btn-interactive inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tulis Artikel Sekarang</span>
          </button>
        }
      />
    );
  }

  const listTopRef = useRef<HTMLDivElement>(null);

  const handlePageChange = (newPage: number) => {
    onPageChange?.(newPage);
    scrollContainerIntoViewIfAbove('admin-articles-list-container', 90);
  };

  return (
    <div ref={listTopRef} id="admin-articles-list-container" className="space-y-4 scroll-mt-24">
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

      {totalPages && totalPages >= 1 && onPageChange && (
        <PaginationBar
          currentPage={currentPage || 1}
          totalPages={totalPages}
          totalItems={totalItems || articles.length}
          itemsPerPage={itemsPerPage || 6}
          itemLabel="artikel"
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
