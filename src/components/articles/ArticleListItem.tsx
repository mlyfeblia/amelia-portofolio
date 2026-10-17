import React from 'react';
import Link from 'next/link';
import { BookOpen, Eye, Clock } from 'lucide-react';
import { Article } from '@/types';
import { formatIndonesianDate } from '@/lib/utils';

export function ArticleListItem({ article }: { article: Article }) {
  return (
    <article className="py-7 group border-b border-[var(--color-paper-border)]/60 last:border-b-0">
      <div className="space-y-3">
        <h2
          className="text-xl sm:text-2xl font-medium text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors leading-snug"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <Link
            href={`/articles/${article.slug}`}
            className="hover:underline underline-offset-4 decoration-[var(--color-accent)]/60"
          >
            {article.title}
          </Link>
        </h2>

        <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed line-clamp-2">
          {article.publishedAt ? `${formatIndonesianDate(article.publishedAt) || article.publishedAt} - ` : ''}{article.excerpt}
        </p>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[var(--color-ink-soft)]">
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 text-xs text-[var(--color-ink-soft)]">
            <span className="font-semibold text-[var(--color-accent)] truncate min-w-0 shrink" title={article.category}>
              {article.category}
            </span>
            <span className="text-[var(--color-paper-border)] shrink-0 select-none" aria-hidden="true">&bull;</span>
            <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[var(--color-ink-muted)] shrink-0 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
              <span>
                {article.readTime.replace(' baca', '')}
                <span className="hidden min-[400px]:inline"> baca</span>
              </span>
            </span>
            <span className="text-[var(--color-paper-border)] shrink-0 select-none" aria-hidden="true">&bull;</span>
            <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[var(--color-ink-muted)] shrink-0 whitespace-nowrap">
              <Eye className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
              <span>{typeof article.views === 'number' ? article.views : 0} pembaca</span>
            </span>
          </div>

          <Link
            href={`/articles/${article.slug}`}
            className="btn-secondary btn-interactive inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/50 shadow-2xs shrink-0 self-start sm:self-auto transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
            <span>Baca Tulisan</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
