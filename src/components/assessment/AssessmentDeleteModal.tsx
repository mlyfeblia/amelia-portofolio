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
  const { isRendered, isExiting, backdropClass, windowClass } = useModalAnimation({ isOpen });

  // Retain active record during exit transition without flickering
  const [cachedRecord, setCachedRecord] = React.useState<DeviceAssessmentRecord | null>(record);
  if (record && record !== cachedRecord) {
    setCachedRecord(record);
  }
  const activeRecord = record ?? cachedRecord;

  // Lock body & document scroll while modal is active and handle Escape
  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isRendered || !activeRecord) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="device-delete-assessment-title"
    >
      {/* Dedicated Full-Screen Backdrop Layer - Pure Transparent Blur (Identik Navbar, Tanpa Warna Gelap, Touch & Scroll Blocked) */}
      <div
        className={cn(
          'fixed inset-0 bg-transparent backdrop-blur-md touch-none select-none pointer-events-auto',
          backdropClass
        )}
        aria-hidden="true"
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
      />

      <div
        className={cn(
          'relative z-10 w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[var(--color-paper-border)] flex flex-col gap-5 my-auto select-text',
          windowClass
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 
                id="device-delete-assessment-title" 
                className="font-display font-semibold text-base sm:text-lg text-[var(--color-ink)] leading-snug"
              >
                Hapus Rekaman Asesmen?
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                Rekaman hasil asesmen mandiri di perambanmu.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Tutup dialog verifikasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-[var(--color-paper)] p-4 rounded-2xl border border-[var(--color-paper-border)] space-y-2 text-xs text-[var(--color-ink-muted)]">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-ink-soft)]">Tanggal:</span>
            <span className="font-medium text-[var(--color-ink)]">{activeRecord.dateFormatted}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-ink-soft)]">Hasil:</span>
            <span className="font-semibold text-[var(--color-accent)]">{activeRecord.level}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-ink-soft)]">Skor:</span>
            <span className="font-mono font-medium text-[var(--color-ink)]">
              {activeRecord.totalScore}/{activeRecord.maxScore} ({activeRecord.percentage}%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={onClose}
            type="button"
            className="w-full py-3 rounded-xl btn-secondary text-xs sm:text-sm font-medium cursor-pointer text-center active:scale-98 shadow-2xs inline-flex items-center justify-center whitespace-nowrap"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onConfirm(activeRecord.id);
              onClose();
            }}
            type="button"
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer text-center active:scale-98 shadow-xs inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>Hapus Rekaman</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
