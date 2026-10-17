import React from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

interface ArticleCtaProps {
  category?: string;
}

export function ArticleCta({ category }: ArticleCtaProps) {
  const scheduleHref = category
    ? `/schedule?kategori=${encodeURIComponent(category)}`
    : '/schedule';

  return (
    <div
      className="p-7 sm:p-10 lg:p-12 border border-[var(--color-accent-border)] rounded-2xl sm:rounded-3xl bg-[var(--color-accent-soft)]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-10 shadow-2xs"
      role="complementary"
      aria-label="Ajakan untuk sesi konseling"
    >
      <div className="space-y-2 max-w-2xl">
        <h2
          className="text-xl sm:text-2xl lg:text-[1.75rem] font-medium text-[var(--color-ink)] leading-snug"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {category
            ? `Merasakan hal serupa seputar ${category.toLowerCase()} dan butuh teman diskusi?`
            : 'Merasakan hal serupa dan butuh teman diskusi?'}
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-[var(--color-ink-muted)] leading-relaxed">
          {category
            ? `Diskusikan tantangan seputar ${category.toLowerCase()} bersama Amel secara privat, hangat, dan tanpa penghakiman melalui sesi bimbingan konseling islami.`
            : 'Amel siap mendengarkan cerita dan kegelisahanmu tanpa penghakiman melalui sesi bimbingan privat yang terjaga amanahnya.'}
        </p>
      </div>
      <Link
        href={scheduleHref}
        className="btn-primary btn-interactive min-h-[46px] px-6 sm:px-8 text-sm font-semibold shrink-0 inline-flex items-center gap-2 rounded-xl shadow-xs"
      >
        <Calendar className="w-4 h-4" aria-hidden="true" />
        <span>Jadwalkan Konsultasi</span>
      </Link>
    </div>
  );
}
