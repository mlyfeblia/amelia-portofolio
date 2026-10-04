'use client';

import React from 'react';
import { MessageSquareText } from 'lucide-react';
import { AnonymousMessage } from '@/types';
import { CounselingCard } from './CounselingCard';
import { SkeletonCurhatCard } from '@/components/ui/Skeleton';

interface CounselingListProps {
  curhatList: AnonymousMessage[];
  loading: boolean;
  replyingId: string | null;
  togglingId: string | null;
  onStartReply: (item: AnonymousMessage) => void;
  onCancelReply: () => void;
  onSaveReply: (id: string, text: string, isPublic: boolean) => Promise<void>;
  onTogglePrivacy: (item: AnonymousMessage) => void;
  onDelete: (item: AnonymousMessage) => void;
}

export function CounselingList({
  curhatList,
  loading,
  replyingId,
  togglingId,
  onStartReply,
  onCancelReply,
  onSaveReply,
  onTogglePrivacy,
  onDelete,
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
      <div className="p-8 sm:p-12 text-center bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl text-xs text-[var(--color-ink-muted)] space-y-2">
        <MessageSquareText className="w-8 h-8 text-[var(--color-ink-muted)]/50 mx-auto mb-1" />
        <p className="font-semibold text-sm text-[var(--color-ink)]">Tidak ada pesan curhat ditemukan</p>
        <p>Coba sesuaikan filter status atau kata kunci pencarian.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {curhatList.map((item) => (
        <CounselingCard
          key={item.id}
          item={item}
          isReplying={replyingId === item.id}
          isToggling={togglingId === item.id}
          onStartReply={() => onStartReply(item)}
          onCancelReply={onCancelReply}
          onSaveReply={(text, isPublic) => onSaveReply(item.id, text, isPublic)}
          onTogglePrivacy={() => onTogglePrivacy(item)}
          onDelete={() => onDelete(item)}
        />
      ))}
    </div>
  );
}
