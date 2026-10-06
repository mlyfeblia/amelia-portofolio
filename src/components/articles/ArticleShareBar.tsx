'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface ArticleShareBarProps {
  title: string;
  url: string;
}

export function ArticleShareBar({ title, url }: ArticleShareBarProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Tautan artikel berhasil disalin ke clipboard!');
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      toast.error('Gagal menyalin tautan');
    }
  };

  const handleShareWa = () => {
    const text = encodeURIComponent(`*${title}*\n\nBaca artikel reflektif ini karya Amelia:\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-2xs">
      <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[var(--color-ink-muted)]">
        <Share2 className="w-4 h-4 text-[var(--color-accent)]" />
        <span>Bermanfaat? Bagikan tulisan ini:</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleShareWa}
          className="btn-interactive inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 border border-[#25D366]/30 cursor-pointer transition-colors"
          title="Bagikan ke WhatsApp"
        >
          <span>WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="btn-interactive inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-paper)] text-[var(--color-ink)] hover:border-[var(--color-accent)] border border-[var(--color-paper-border)] cursor-pointer transition-all"
          title="Salin tautan artikel"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span className="text-[var(--color-accent)] font-semibold">Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[var(--color-ink-muted)]" />
              <span>Salin Tautan</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
