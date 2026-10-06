import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Article } from '@/types';

interface ArticlesPreviewSectionProps {
  articles: Article[];
}

export function ArticlesPreviewSection({ articles }: ArticlesPreviewSectionProps) {
  if (articles.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 border-b border-[var(--color-paper-border)]" data-reveal>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-8 lg:space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2
              className="text-2xl sm:text-3xl lg:text-[2.25rem] font-medium text-[var(--color-ink)] leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Tulisan &amp; Refleksi Terkini
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-ink-muted)] mt-1.5">
              Kumpulan tulisan praktis seputar kesehatan mental, tips menghadapi burnout, dan mindful living.
            </p>
          </div>
          <Link
            href="/articles"
            className="text-sm font-semibold text-[var(--color-accent)] hover:underline shrink-0 inline-flex items-center gap-1"
          >
            Kunjungi direktori artikel &rarr;
          </Link>
        </div>

        <div
          className={`grid grid-cols-1 ${
            articles.length === 3
              ? 'md:grid-cols-3'
              : articles.length >= 4
              ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'md:grid-cols-2'
          } gap-6 lg:gap-8`}
        >
          {articles.map((art) => (
            <article
              key={art.id}
              className="p-6 lg:p-7 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-3.5 flex flex-col justify-between hover:border-[var(--color-accent-border)] transition-colors shadow-xs card-interactive"
            >
              <div className="space-y-2.5">
                <h3
                  className="text-lg sm:text-xl font-medium text-[var(--color-ink)] leading-snug"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <Link href={`/articles/${art.slug}`} className="hover:underline">
                    {art.title}
                  </Link>
                </h3>
                <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed line-clamp-2">
                  {art.publishedAt ? `${art.publishedAt} — ` : ''}{art.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--color-paper-border)] flex items-center justify-between text-xs sm:text-sm text-[var(--color-ink-soft)]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="font-medium text-[var(--color-accent)]">{art.category}</span>
                  <span>•</span>
                  <span>{art.readTime}</span>
                </span>
                <Link
                  href={`/articles/${art.slug}`}
                  className="font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
                >
                  Baca tulisan
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
