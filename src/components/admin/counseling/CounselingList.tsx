'use client';

import React from 'react';
import { MessageSquareText, SearchX, RotateCcw } from 'lucide-react';
import { AnonymousMessage } from '@/types';
import { CounselingCard } from './CounselingCard';
import { SkeletonCurhatCard } from '@/components/ui/Skeleton';
import { PaginationBar } from '@/components/ui/PaginationBar';

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
    return (
      <div className="p-8 sm:p-12 text-center bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl text-xs text-[var(--color-ink-muted)] space-y-3 tab-content-enter">
        {hasActiveFilters ? (
          <>
            <div className="w-12 h-12 rounded-full bg-[var(--color-paper-muted)] text-[var(--color-ink-muted)] mx-auto flex items-center justify-center">
              <SearchX className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-sm text-[var(--color-ink)]">
                Tidak ada pesan curhat yang cocok
              </p>
              <p className="max-w-md mx-auto leading-relaxed">
                {search ? (
                  <>
                    Tidak ditemukan hasil untuk kata kunci <span className="font-semibold text-[var(--color-ink)]">&ldquo;{search}&rdquo;</span>.
                  </>
                ) : (
                  'Tidak ada pesan curhat yang sesuai dengan kombinasi filter saat ini.'
                )}
                {statusFilter !== 'semua' && (
                  <span className="block mt-0.5 text-[11px] text-[var(--color-ink-soft)]">
                    Filter status: &ldquo;{statusFilter === 'unanswered' ? 'Belum Dibalas' : 'Sudah Dibalas'}&rdquo;
                  </span>
                )}
                {categoryFilter !== 'Semua' && (
                  <span className="block mt-0.5 text-[11px] text-[var(--color-ink-soft)]">
                    Filter kategori: &ldquo;{categoryFilter}&rdquo;
                  </span>
                )}
                {visibilityFilter !== 'semua' && (
                  <span className="block mt-0.5 text-[11px] text-[var(--color-ink-soft)]">
                    Filter visibilitas: &ldquo;{visibilityFilter}&rdquo;
                  </span>
                )}
                {landingFilter === 'landing' && (
                  <span className="block mt-0.5 text-[11px] text-[var(--color-ink-soft)]">
                    Filter: Hanya di Beranda
                  </span>
                )}
                {dateFilter && (
                  <span className="block mt-0.5 text-[11px] text-[var(--color-ink-soft)]">
                    Filter tanggal: &ldquo;{dateFilter}&rdquo;
                  </span>
                )}
              </p>
            </div>
            {onResetFilters && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="btn-secondary btn-interactive inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Semua Filter &amp; Pencarian</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <MessageSquareText className="w-8 h-8 text-[var(--color-ink-muted)]/50 mx-auto mb-1" />
            <p className="font-semibold text-sm text-[var(--color-ink)]">Belum ada pesan curhat masuk</p>
            <p>Pesan anonim dari konseli atau pengunjung akan muncul di sini.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
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

      {totalPages && totalPages > 1 && onPageChange && (
        <PaginationBar
          currentPage={currentPage || 1}
          totalPages={totalPages}
          totalItems={totalItems || curhatList.length}
          itemsPerPage={itemsPerPage || 6}
          itemLabel="curhatan"
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
