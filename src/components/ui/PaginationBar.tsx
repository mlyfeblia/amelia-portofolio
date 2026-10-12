'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  itemLabel?: string; // e.g. "janji temu", "curhatan", "artikel", "data"
  onPageChange: (page: number) => void;
  className?: string;
}

export function getVisiblePages(currentPage: number, totalPages: number): (number | null)[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // When totalPages > 5
  if (currentPage <= 3) {
    return [1, 2, 3, 4, null, totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, null, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, null, currentPage - 1, currentPage, currentPage + 1, null, totalPages];
}

export function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  itemLabel = 'data',
  onPageChange,
  className = '',
}: PaginationBarProps) {
  if (totalPages <= 0) {
    return null;
  }

  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(safeCurrentPage * itemsPerPage, totalItems);
  const visiblePages = getVisiblePages(safeCurrentPage, totalPages);

  return (
    <nav
      className={`pt-4 border-t border-[var(--color-paper-border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${className}`.trim()}
      aria-label={`Navigasi halaman ${itemLabel}`}
    >
      <div className="text-[var(--color-ink-muted)] text-center sm:text-left">
        Menampilkan <strong className="font-semibold text-[var(--color-ink)]">{startItem}</strong> &ndash;{' '}
        <strong className="font-semibold text-[var(--color-ink)]">{endItem}</strong> dari{' '}
        <strong className="font-semibold text-[var(--color-ink)]">{totalItems}</strong> {itemLabel}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          className="btn-interactive inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-lg border border-[var(--color-paper-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--color-accent-border)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]/40 cursor-pointer transition-colors shadow-2xs"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
          <span>Sebelumnya</span>
        </button>

        {/* Mobile compact indicator (< 380px) */}
        <span className="inline-flex min-[380px]:hidden px-2.5 py-1 text-xs font-semibold rounded-lg bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-[var(--color-ink)] select-none">
          {safeCurrentPage} / {totalPages}
        </span>

        {/* Desktop & wider mobile numbered buttons (>= 380px) */}
        <div className="hidden min-[380px]:flex items-center gap-1">
          {visiblePages.map((pageNum, index) => {
            if (pageNum === null) {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="text-[var(--color-ink-soft)] px-1 select-none"
                  aria-hidden="true"
                >
                  &hellip;
                </span>
              );
            }

            const isActive = pageNum === safeCurrentPage;
            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => onPageChange(pageNum)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Halaman ${pageNum}`}
                className={`btn-interactive min-w-[32px] h-8 px-2 text-xs font-semibold rounded-lg border cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-xs'
                    : 'bg-[var(--color-surface)] border-[var(--color-paper-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-accent-border)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]/40'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages}
          className="btn-interactive inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-lg border border-[var(--color-paper-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--color-accent-border)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]/40 cursor-pointer transition-colors shadow-2xs"
          aria-label="Halaman selanjutnya"
        >
          <span>Selanjutnya</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        </button>
      </div>
    </nav>
  );
}

export default PaginationBar;
