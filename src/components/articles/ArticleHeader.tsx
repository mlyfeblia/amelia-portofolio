import React from 'react';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { Article } from '@/types';
import { getIsoDateString } from '@/lib/utils';

export function ArticleHeader({ article }: { article: Article }) {
  return (
    <header className="mb-10 pb-8 border-b border-[var(--color-paper-border)] space-y-5">
      {/* 1. Main Article Title (H1) */}
      <h1
        id="article-title"
        className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] font-medium text-[var(--color-ink)] leading-[1.22] tracking-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {article.title}
      </h1>

      {/* 2. Unified Author & Meta Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[var(--color-accent-border)] bg-[var(--color-accent-soft)] shrink-0 shadow-2xs">
            <Image
              src="/amelia.webp"
              alt="Amelia"
              fill
              className="object-cover object-top"
              sizes="40px"
              priority
            />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-[var(--color-ink)]">
              Amelia (Amel)
            </div>
            <div className="text-xs text-[var(--color-ink-soft)]">
              Konselor Sebaya · Mahasiswi BKI
            </div>
          </div>
        </div>

        {/* Date, Category, and Read Time */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--color-ink-muted)]">
          {article.publishedAt && (
            <>
              <time dateTime={getIsoDateString(article.publishedAt)}>
                {article.publishedAt}
              </time>
              <span className="text-[var(--color-paper-border)]" aria-hidden="true">•</span>
            </>
          )}
          <span className="font-semibold text-[var(--color-accent)]">
            {article.category}
          </span>
          <span className="text-[var(--color-paper-border)]" aria-hidden="true">•</span>
          <span className="inline-flex items-center gap-1 text-[var(--color-ink-soft)]">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{article.readTime}</span>
          </span>
        </div>
      </div>

      {/* 3. Lead In / Excerpt Paragraph */}
      {article.excerpt && (
        <div className="pt-2">
          <p className="text-base sm:text-lg text-[var(--color-ink)]/90 leading-relaxed font-normal bg-[var(--color-paper-muted)]/50 p-4 sm:p-5 rounded-xl border-l-3 border-[var(--color-accent)]">
            {article.excerpt}
          </p>
        </div>
      )}
    </header>
  );
}
