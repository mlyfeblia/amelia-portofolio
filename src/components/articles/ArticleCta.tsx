import React from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

export function ArticleCta() {
  return (
    <div
      className="mt-12 p-8 sm:p-10 border border-[var(--color-accent-border)] rounded-2xl bg-[var(--color-accent-soft)]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 card-interactive"
      role="complementary"
      aria-label="Ajakan untuk sesi konseling"
    >
      <div className="space-y-1.5 max-w-lg">
        <h2
          className="text-2xl font-medium text-[var(--color-ink)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Merasakan hal serupa dan butuh teman diskusi?
        </h2>
        <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
          Amel siap mendengarkan cerita dan kegelisahanmu tanpa penghakiman melalui sesi bimbingan privat yang terjaga amanahnya.
        </p>
      </div>
      <Link
        href="/schedule"
        className="btn-primary btn-interactive min-h-[46px] px-6 text-sm shrink-0 inline-flex items-center gap-2"
      >
        <Calendar className="w-4 h-4" aria-hidden="true" />
        <span>Jadwalkan Konsultasi</span>
      </Link>
    </div>
  );
}
