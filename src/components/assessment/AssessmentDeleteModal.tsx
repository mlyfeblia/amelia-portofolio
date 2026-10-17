'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { DeviceAssessmentRecord } from '@/lib/assessment-storage';
import { useMounted } from '@/lib/use-mounted';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { cn } from '@/lib/utils';

interface AssessmentDeleteModalProps {
  isOpen: boolean;
  record: DeviceAssessmentRecord | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export function AssessmentDeleteModal({
  isOpen,
  record,
  onClose,
  onConfirm,
}: AssessmentDeleteModalProps) {
  const mounted = useMounted();
  const { isRendered, isExiting, backdropClass, windowClass } = useModalAnimation({
    isOpen,
    onClose,
    closeOnEscape: true,
    lockScroll: true,
  });

  // Retain active record during exit transition without flickering
  const [cachedRecord, setCachedRecord] = React.useState<DeviceAssessmentRecord | null>(record);
  if (record && record !== cachedRecord) {
    setCachedRecord(record);
  }
  const activeRecord = record ?? cachedRecord;

  if (!mounted || !isRendered || !activeRecord) return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden select-none',
        isExiting && 'pointer-events-none'
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="device-delete-assessment-title"
    >
      {/* Dedicated Full-Screen Backdrop Layer */}
      <div
        className={cn(backdropClass)}
        aria-hidden="true"
        onClick={onClose}
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
      />

      <div
        className={cn(
          'relative z-10 w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-4 min-[340px]:p-5 sm:p-6 shadow-2xl border border-[var(--color-paper-border)] flex flex-col gap-4 sm:gap-5 my-auto select-text',
          windowClass
        )}
      >
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-3 sm:gap-3.5 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 shadow-xs mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 
                id="device-delete-assessment-title" 
                className="font-display font-semibold text-base sm:text-lg text-[var(--color-ink)] leading-snug break-words"
              >
                Hapus Rekaman Asesmen?
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5 break-words">
                Rekaman hasil asesmen mandiri di perambanmu.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 -mr-1"
            aria-label="Tutup dialog verifikasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-[var(--color-paper)] p-3.5 sm:p-4 rounded-2xl border border-[var(--color-paper-border)] space-y-2 text-xs text-[var(--color-ink-muted)]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[var(--color-ink-soft)] shrink-0">Tanggal:</span>
            <span className="font-medium text-[var(--color-ink)]">{activeRecord.dateFormatted}</span>
          </div>
          <div className="flex flex-col min-[340px]:flex-row min-[340px]:items-center justify-between gap-1 min-[340px]:gap-2">
            <span className="text-[var(--color-ink-soft)] shrink-0">Hasil:</span>
            <span className="font-semibold text-[var(--color-accent)] min-[340px]:text-right leading-snug break-words">
              {activeRecord.level}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[var(--color-ink-soft)] shrink-0">Skor:</span>
            <span className="font-mono font-medium text-[var(--color-ink)]">
              {activeRecord.totalScore}/{activeRecord.maxScore} ({activeRecord.percentage}%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
          <button
            onClick={onClose}
            type="button"
            className="w-full py-2.5 sm:py-3 rounded-xl btn-secondary min-w-0 px-2 sm:px-4 text-[11px] sm:text-xs font-medium cursor-pointer text-center active:scale-98 shadow-2xs inline-flex items-center justify-center whitespace-nowrap"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onConfirm(activeRecord.id);
              onClose();
            }}
            type="button"
            className="w-full py-2.5 sm:py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white min-w-0 px-2 sm:px-4 text-[11px] sm:text-xs font-medium transition-colors cursor-pointer text-center active:scale-98 shadow-xs inline-flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Hapus Rekaman</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
