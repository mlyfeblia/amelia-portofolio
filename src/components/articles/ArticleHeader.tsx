import React from 'react';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { Article } from '@/types';
import { getIsoDateString, formatIndonesianDate } from '@/lib/utils';
import { ArticleViewTracker } from './ArticleViewTracker';

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
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[var(--color-accent-border)] bg-[var(--color-surface)] shrink-0 shadow-2xs">
            <Image
              src="/amelia.webp"
              alt="Amelia"
              fill
              className="object-cover object-top"
              sizes="40px"
              priority
              unoptimized
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

        {/* Article Metadata Pills Container */}
        <div className="flex flex-wrap items-center gap-1.5 min-[340px]:gap-2 text-xs">
          {article.publishedAt && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-[var(--color-ink-muted)] shadow-2xs shrink-0">
              <time dateTime={getIsoDateString(article.publishedAt)}>{formatIndonesianDate(article.publishedAt) || article.publishedAt}</time>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-[var(--color-ink-soft)] shadow-2xs shrink-0">
            <Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" aria-hidden="true" />
            <span>{article.readTime}</span>
          </span>
          <ArticleViewTracker slug={article.slug} initialViews={article.views ?? 0} />
        </div>
      </div>

      {/* 3. Lead In / Excerpt Paragraph */}
      {article.excerpt && (
        <div className="pt-2">
          <p className="article-excerpt text-base sm:text-lg text-[var(--color-ink)]/90 leading-relaxed font-normal bg-[var(--color-paper-muted)]/50 p-4 sm:p-5 rounded-xl border-l-4 border-[var(--color-accent)] hover:bg-[var(--color-paper-muted)]/80 hover:shadow-xs hover:border-[var(--color-accent-hover)] transition-[background-color,border-color,box-shadow] duration-300 ease-out">
            {article.excerpt}
          </p>
        </div>
      )}
    </header>
  );
}
