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
  // Retain active item during exit transition without sudden unmount
  const [cachedItem, setCachedItem] = React.useState<AnonymousMessage | null>(item);
  if (item && item !== cachedItem) {
    setCachedItem(item);
  }
  const activeItem = item ?? cachedItem;

  if (!activeItem) return null;

  return (
    <ConfirmDecisionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => onConfirm(activeItem)}
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
              {activeItem.alias || 'Teman Anonim'}
            </strong>{' '}
            ({activeItem.category}) akan dihapus secara permanen.
          </p>
          <div className="pt-2 border-t border-[var(--color-paper-border)]/60 text-xs italic leading-relaxed max-h-24 overflow-y-auto break-words">
            &ldquo;{activeItem.message}&rdquo;
          </div>
        </div>
      }
    />
  );
}
