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
        className="btn-primary btn-interactive text-sm min-h-[44px] px-5 inline-flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-4 h-4" aria-hidden="true" />
        <span>Muat Ulang Halaman</span>
      </button>

      <Link
        href="/"
        className="btn-secondary btn-interactive text-sm min-h-[44px] px-5 inline-flex items-center justify-center gap-2"
      >
        <Home className="w-4 h-4 text-[var(--color-ink-soft)]" aria-hidden="true" />
        <span>Kembali ke Beranda</span>
      </Link>

      <Link
        href="/articles"
        className="btn-secondary btn-interactive text-sm min-h-[44px] px-5 inline-flex items-center justify-center gap-2"
      >
        <BookOpen className="w-4 h-4 text-[var(--color-ink-soft)]" aria-hidden="true" />
        <span>Artikel Tersimpan</span>
      </Link>
    </div>
  );
}
