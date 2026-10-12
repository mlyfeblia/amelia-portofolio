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
          {article.publishedAt ? `${formatIndonesianDate(article.publishedAt) || article.publishedAt} — ` : ''}{article.excerpt}
        </p>

        <div className="pt-2 flex items-end justify-between gap-3 text-xs text-[var(--color-ink-soft)]">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-semibold text-[var(--color-accent)] truncate">
              {article.category}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[var(--color-ink-muted)]">
              <Clock className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
              <span>{article.readTime}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[var(--color-ink-muted)]">
              <Eye className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
              <span>{typeof article.views === 'number' ? article.views : 0} pembaca</span>
            </span>
          </div>

          <Link
            href={`/articles/${article.slug}`}
            className="btn-secondary btn-interactive inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/50 shadow-2xs shrink-0 self-end transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
            <span>Baca Tulisan</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
