import React from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

export function ServicesCta() {
  return (
    <section
      className="p-8 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      data-reveal
    >
      <div className="space-y-1">
        <h2
          className="text-xl font-medium text-[var(--color-ink)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Jaminan Kerahasiaan Terjaga Penuh
        </h2>
        <p className="text-sm text-[var(--color-ink-muted)] max-w-xl">
          Seluruh percakapan, data pribadi, dan topik konseling dilindungi sepenuhnya sesuai kode etik Bimbingan Konseling.
        </p>
      </div>
      <Link href="/schedule" className="btn-primary btn-interactive text-sm shrink-0 inline-flex items-center justify-center gap-2 w-full md:w-auto whitespace-nowrap">
        <Calendar className="w-4 h-4" />
        <span>
          <span className="sm:hidden">Jadwalkan Sesi</span>
          <span className="hidden sm:inline">Jadwalkan Sesi Sekarang</span>
        </span>
      </Link>
    </section>
  );
}
