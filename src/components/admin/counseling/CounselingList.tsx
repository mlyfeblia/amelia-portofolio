'use client';

import React, { useRef } from 'react';
import { MessageSquareText, SearchX, RotateCcw, ExternalLink } from 'lucide-react';
import { AnonymousMessage } from '@/types';
import { CounselingCard } from './CounselingCard';
import { SkeletonCurhatCard } from '@/components/ui/Skeleton';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { scrollContainerIntoViewIfAbove } from '@/lib/dom-utils';

interface CounselingListProps {
  curhatList: AnonymousMessage[];
  loading: boolean;
  replyingId: string | null;
  togglingId: string | null;
  togglingLandingId?: string | null;
  search?: string;
  statusFilter?: string;
  categoryFilter?: string;
  visibilityFilter?: string;
  landingFilter?: string;
  dateFilter?: string;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  onStartReply: (item: AnonymousMessage) => void;
  onCancelReply: () => void;
  onSaveReply: (id: string, text: string, isPublic: boolean, showOnLandingPage: boolean) => Promise<void>;
  onTogglePrivacy: (item: AnonymousMessage) => void;
  onToggleLanding: (item: AnonymousMessage) => void;
  onDelete: (item: AnonymousMessage) => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export function CounselingList({
  curhatList,
  loading,
  replyingId,
  togglingId,
  togglingLandingId,
  search,
  statusFilter = 'semua',
  categoryFilter = 'Semua',
  visibilityFilter = 'semua',
  landingFilter = 'semua',
  dateFilter,
  hasActiveFilters,
  onResetFilters,
  onStartReply,
  onCancelReply,
  onSaveReply,
  onTogglePrivacy,
  onToggleLanding,
  onDelete,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: CounselingListProps) {
  const listTopRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return (
      <div className="space-y-3.5 sm:space-y-4">
        <SkeletonCurhatCard />
        <SkeletonCurhatCard />
        <SkeletonCurhatCard />
      </div>
    );
  }

  if (curhatList.length === 0) {
    if (hasActiveFilters) {
      const activeFiltersList: { label: string; value: string }[] = [];
      if (search) activeFiltersList.push({ label: 'Kata Kunci', value: search });
      if (statusFilter !== 'semua') activeFiltersList.push({ label: 'Status', value: statusFilter === 'unanswered' ? 'Belum Dibalas' : 'Sudah Dibalas' });
      if (categoryFilter !== 'Semua') activeFiltersList.push({ label: 'Kategori', value: categoryFilter });
      if (visibilityFilter !== 'semua') activeFiltersList.push({ label: 'Visibilitas', value: visibilityFilter });
      if (landingFilter === 'landing') activeFiltersList.push({ label: 'Tampilan', value: 'Hanya di Beranda' });
      if (dateFilter) activeFiltersList.push({ label: 'Tanggal', value: dateFilter });

      return (
        <EmptyState
          icon={<SearchX className="w-6 h-6 stroke-[1.75]" />}
          title="Tidak Ada Pesan Curhat yang Cocok"
          description="Tidak ditemukan rekaman curhat anonim yang sesuai dengan kombinasi filter dan kata kunci pencarian aktif saat ini."
          activeFilters={activeFiltersList}
          action={
            onResetFilters ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onResetFilters();
                }}
                className="btn-secondary btn-interactive inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold cursor-pointer shadow-xs whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span className="sm:hidden">Reset Filter</span>
                <span className="hidden sm:inline">Reset Semua Filter &amp; Pencarian</span>
              </button>
            ) : undefined
          }
        />
      );
    }

    return (
      <EmptyState
        icon={<MessageSquareText className="w-6 h-6 stroke-[1.75]" />}
        title="Belum Ada Pesan Curhat Masuk"
        description="Pesan anonim dan cerita batin dari pengunjung atau konseli akan otomatis masuk dan tersimpan privat di sini untuk ditanggapi."
        action={
          <a
            href="/counseling"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary btn-interactive inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold cursor-pointer shadow-xs whitespace-nowrap"
          >
            <span className="sm:hidden">Ruang Curhat</span>
            <span className="hidden sm:inline">Buka Ruang Curhat Publik</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        }
      />
    );
  }

  const handlePageChange = (newPage: number) => {
    onPageChange?.(newPage);
    scrollContainerIntoViewIfAbove('admin-counseling-list-container', 90);
  };

  return (
    <div ref={listTopRef} id="admin-counseling-list-container" className="space-y-4 scroll-mt-24">
      <div key={currentPage} className="space-y-3.5 sm:space-y-4 pagination-slide-enter">
        {curhatList.map((item) => (
          <CounselingCard
            key={item.id}
            item={item}
            isReplying={replyingId === item.id}
            isToggling={togglingId === item.id}
            isTogglingLanding={togglingLandingId === item.id}
            onStartReply={() => onStartReply(item)}
            onCancelReply={onCancelReply}
            onSaveReply={(text, isPublic, showOnLandingPage) => onSaveReply(item.id, text, isPublic, showOnLandingPage)}
            onTogglePrivacy={() => onTogglePrivacy(item)}
            onToggleLanding={() => onToggleLanding(item)}
            onDelete={() => onDelete(item)}
          />
        ))}
      </div>

      {totalPages && totalPages >= 1 && onPageChange && (
        <PaginationBar
          currentPage={currentPage || 1}
          totalPages={totalPages}
          totalItems={totalItems || curhatList.length}
          itemsPerPage={itemsPerPage || 6}
          itemLabel="curhatan"
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
