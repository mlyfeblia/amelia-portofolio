import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Article } from '@/types';
import { getIsoDateString } from '@/lib/utils';

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
          {article.publishedAt ? `${article.publishedAt} — ` : ''}{article.excerpt}
        </p>

        <div className="pt-1 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-ink-soft)]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--color-accent)]">
              {article.category}
            </span>
            <span className="text-[var(--color-paper-border)]" aria-hidden="true">&bull;</span>
            <span>{article.readTime}</span>
          </div>

          <Link
            href={`/articles/${article.slug}`}
            className="btn-secondary btn-interactive text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-[var(--color-ink-soft)]" />
            <span>Baca Tulisan</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
