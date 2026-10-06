import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { Article } from '@/types';
import { getIsoDateString } from '@/lib/utils';

export function ArticleHeader({ article }: { article: Article }) {
  return (
    <>
      {/* Back link */}
      <Link
        href="/articles"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] mb-8 transition-colors duration-150 min-h-[44px] group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
        Kembali ke Semua Artikel
      </Link>

      <header className="mb-10 pb-8 border-b border-[var(--color-paper-border)] space-y-4">
        {/* Single H1 per page */}
        <h1
          id="article-title"
          className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[var(--color-ink)] leading-[1.2]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {article.title}
        </h1>

        <p className="text-lg sm:text-xl text-[var(--color-ink-muted)] leading-relaxed italic pt-1">
          {article.publishedAt ? (
            <time dateTime={getIsoDateString(article.publishedAt)} className="font-medium not-italic">
              {article.publishedAt} —{' '}
            </time>
          ) : null}
          {article.excerpt}
        </p>

        {/* Metadata bar below title and excerpt */}
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm pt-2">
          <span className="font-semibold text-[var(--color-accent)] tracking-wide">
            {article.category}
          </span>
          <span className="text-[var(--color-paper-border)]" aria-hidden="true">&bull;</span>
          <span className="inline-flex items-center gap-1.5 text-[var(--color-ink-soft)]">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            {article.readTime}
          </span>
        </div>

        {/* Byline */}
        <div
          className="flex items-center gap-3.5 pt-6 border-t border-[var(--color-paper-border)]"
          aria-label="Penulis artikel"
        >
          <div
            className="w-11 h-11 rounded-full bg-[var(--color-accent-soft)] border border-[var(--color-accent-border)] text-[var(--color-accent)] flex items-center justify-center text-base font-bold shrink-0"
            aria-hidden="true"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            A
          </div>
          <div>
            <div className="text-base font-semibold text-[var(--color-ink)]">
              Amelia (Amel)
            </div>
            <div className="text-xs sm:text-sm text-[var(--color-ink-soft)]">
              Konselor Sebaya · Mahasiswi Bimbingan Konseling UIN Siber Cirebon
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
