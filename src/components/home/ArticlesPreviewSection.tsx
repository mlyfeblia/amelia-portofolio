import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Eye, Clock } from 'lucide-react';
import { Article } from '@/types';
import { formatIndonesianDate } from '@/lib/utils';

interface ArticlesPreviewSectionProps {
  articles: Article[];
}

export function ArticlesPreviewSection({ articles }: ArticlesPreviewSectionProps) {
  if (articles.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 border-b border-[var(--color-paper-border)]" data-reveal>
      <div className="max-w-7xl mx-auto px-3.5 min-[340px]:px-5 sm:px-8 lg:px-10 space-y-8 lg:space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="min-w-0">
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
            className="btn-secondary btn-interactive inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/50 shadow-2xs shrink-0 self-start sm:self-auto transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
            <span>Kunjungi Direktori Artikel</span>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--color-ink-muted)] shrink-0" aria-hidden="true" />
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
              className="p-4 min-[340px]:p-5 sm:p-6 lg:p-7 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-3.5 flex flex-col justify-between hover:border-[var(--color-accent-border)] transition-colors shadow-xs card-interactive"
            >
              <div className="space-y-2.5 min-w-0">
                <h3
                  className="text-lg sm:text-xl font-medium text-[var(--color-ink)] leading-snug"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <Link href={`/articles/${art.slug}`} className="hover:underline">
                    {art.title}
                  </Link>
                </h3>
                <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed line-clamp-2 break-words">
                  {art.publishedAt ? `${formatIndonesianDate(art.publishedAt) || art.publishedAt} - ` : ''}{art.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--color-paper-border)] flex items-end justify-between gap-3 text-xs text-[var(--color-ink-soft)]">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-semibold text-[var(--color-accent)] truncate">{art.category}</span>
                  <span className="inline-flex items-center gap-1.5 text-[var(--color-ink-muted)]">
                    <Clock className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
                    <span>{art.readTime}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[var(--color-ink-muted)]">
                    <Eye className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
                    <span>{typeof art.views === 'number' ? art.views : 0} pembaca</span>
                  </span>
                </div>
                <Link
                  href={`/articles/${art.slug}`}
                  className="btn-secondary btn-interactive inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/50 shadow-2xs shrink-0 self-end transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
                  <span>Baca Tulisan</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
