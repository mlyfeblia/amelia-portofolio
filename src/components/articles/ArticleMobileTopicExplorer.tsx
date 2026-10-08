import React from 'react';
import Link from 'next/link';
import { Compass, ArrowRight } from 'lucide-react';
import { ARTICLE_CATEGORIES } from '@/types';

interface ArticleMobileTopicExplorerProps {
  currentCategory: string;
}

export function ArticleMobileTopicExplorer({ currentCategory }: ArticleMobileTopicExplorerProps) {
  return (
    <section
      aria-label="Eksplorasi Topik & Kategori Artikel"
      className="bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl p-4.5 sm:p-5 shadow-xs space-y-3.5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
        <Compass className="w-4 h-4 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
        <span>Fokus Topik &amp; Jelajahi Kategori</span>
      </div>

      {/* Description */}
      <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
        Kamu baru saja membaca ulasan di bawah kategori{' '}
        <strong className="text-[var(--color-ink)] font-semibold">{currentCategory}</strong>. Lanjutkan membaca dan jelajahi sudut pandang topik lainnya di bawah ini:
      </p>

      {/* Interactive Category Pills */}
      <div className="flex flex-wrap gap-2 pt-1" role="navigation" aria-label="Pilihan kategori artikel">
        {ARTICLE_CATEGORIES.map((category) => {
          const isActive = category.trim().toLowerCase() === currentCategory.trim().toLowerCase();

          if (isActive) {
            return (
              <span
                key={category}
                aria-current="true"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/30 text-[var(--color-accent)] shadow-2xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" aria-hidden="true" />
                <span>{category}</span>
              </span>
            );
          }

          return (
            <Link
              key={category}
              href={`/articles?kategori=${encodeURIComponent(category)}`}
              className="chip-interactive inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] hover:bg-[var(--color-paper-muted)]/50 transition-all duration-200"
            >
              <span>{category}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom CTA to Full Directory */}
      <div className="pt-1.5">
        <Link
          href="/articles"
          className="btn-secondary btn-interactive w-full py-2.5 px-3 text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-1.5 shadow-2xs text-[var(--color-ink)] hover:text-[var(--color-accent)] text-center transition-colors"
        >
          <span className="truncate">Jelajahi Direktori Artikel</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export default ArticleMobileTopicExplorer;
