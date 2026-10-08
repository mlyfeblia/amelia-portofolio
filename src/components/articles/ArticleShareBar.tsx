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
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:shadow-xs transition-all duration-200 shadow-2xs group">
      <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)] transition-colors duration-200">
        <Share2 className="w-4 h-4 text-[var(--color-accent)] group-hover:scale-110 transition-transform duration-200" />
        <span>Bermanfaat? Bagikan tulisan ini:</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleShareWa}
          className="btn-interactive inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 border border-[#25D366]/30 cursor-pointer transition-colors"
          title="Bagikan ke WhatsApp"
        >
          <svg
            className="w-3.5 h-3.5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
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
