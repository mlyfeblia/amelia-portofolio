'use client';

import Link from 'next/link';
import { RefreshCw, Home, BookOpen } from 'lucide-react';

export default function OfflineActions() {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
      <button
        type="button"
        onClick={handleReload}
        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] cursor-pointer shadow-xs active:scale-[0.99]"
      >
        <RefreshCw className="w-4 h-4" aria-hidden="true" />
        <span>Muat Ulang Halaman</span>
      </button>

      <Link
        href="/"
        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-[var(--color-paper-border)] text-[var(--color-ink)] text-sm font-medium hover:bg-[var(--color-paper-muted)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
      >
        <Home className="w-4 h-4 text-[var(--color-ink-soft)]" aria-hidden="true" />
        <span>Kembali ke Beranda</span>
      </Link>

      <Link
        href="/articles"
        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-[var(--color-paper-border)] text-[var(--color-ink)] text-sm font-medium hover:bg-[var(--color-paper-muted)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
      >
        <BookOpen className="w-4 h-4 text-[var(--color-ink-soft)]" aria-hidden="true" />
        <span>Artikel Tersimpan</span>
      </Link>
    </div>
  );
}
