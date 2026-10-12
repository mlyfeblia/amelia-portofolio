'use client';

import React from 'react';
import { AnonymousMessage } from '@/types';
import { ConfirmDecisionModal } from '@/components/ui/ConfirmDecisionModal';

export interface CounselingDeleteModalProps {
  item: AnonymousMessage | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (item: AnonymousMessage) => Promise<void>;
}

export function CounselingDeleteModal({
  item,
  isOpen,
  onClose,
  onConfirm,
}: CounselingDeleteModalProps) {
  if (!item) return null;

  return (
    <ConfirmDecisionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => onConfirm(item)}
      variant="danger"
      title="Hapus Pesan Curhat?"
      description="Penghapusan pesan curhat anonim konseli."
      confirmLabel="Ya, Hapus"
      cancelLabel="Batal"
      itemDetail={
        <div className="space-y-2">
          <p className="leading-relaxed break-words">
            Pesan dari{' '}
            <strong className="text-[var(--color-ink)] font-semibold break-words">
              {item.alias || 'Teman Anonim'}
            </strong>{' '}
            ({item.category}) akan dihapus secara permanen.
          </p>
          <div className="pt-2 border-t border-[var(--color-paper-border)]/60 text-xs italic leading-relaxed max-h-24 overflow-y-auto break-words">
            &ldquo;{item.message}&rdquo;
          </div>
        </div>
      }
    />
  );
}
