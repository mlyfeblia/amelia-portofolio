import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Article } from '@/types';
import { getIsoDateString } from '@/lib/utils';

export function ArticleListItem({ article }: { article: Article }) {
  return (
    <article className="py-8 group">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-3 space-y-1">
          <span className="text-xs font-semibold text-[var(--color-accent)] px-2.5 py-0.5 rounded-full bg-[var(--color-accent-soft)]">
            {article.category}
          </span>
          <div className="text-xs text-[var(--color-ink-soft)] space-x-2 pt-2">
            <span>{article.readTime}</span>
            <span>&bull;</span>
            <time dateTime={getIsoDateString(article.publishedAt)}>{article.publishedAt}</time>
          </div>
        </div>

        <div className="md:col-span-7 space-y-2">
          <h2
            className="text-xl sm:text-2xl font-medium text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors leading-snug"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <Link href={`/articles/${article.slug}`}>
              {article.title}
            </Link>
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed line-clamp-2">
            {article.excerpt}
          </p>
        </div>

        <div className="md:col-span-2 flex md:justify-end">
          <Link
            href={`/articles/${article.slug}`}
            className="btn-secondary btn-interactive text-xs py-2 px-3.5 inline-flex items-center gap-1"
          >
            Baca Tulisan
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
