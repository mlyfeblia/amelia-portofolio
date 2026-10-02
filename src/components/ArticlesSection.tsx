import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, Clock, Calendar } from 'lucide-react';
import { getArticles } from '@/lib/data-store';

export default async function ArticlesSection() {
  const articles = await getArticles();

  return (
    <section
      id="artikel"
      className="py-20 md:py-28 border-b border-[var(--color-line)]"
      aria-labelledby="articles-heading"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <h2
            id="articles-heading"
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-medium text-[var(--color-ink)] leading-tight mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Refleksi, artikel, dan kajian jiwa.
          </h2>
          <p className="text-lg sm:text-xl text-[var(--color-ink-2)] leading-relaxed">
            Kumpulan catatan seputar ketenangan spiritual, navigasi krisis kehidupan, dan etika konseling di era siber.
          </p>
        </div>

        {/* Articles List - Clean, spacious, with smooth micro-interactions */}
        {articles.length === 0 ? (
          <div className="p-12 text-center border border-[var(--color-line)] rounded-2xl bg-[var(--color-surface)]">
            <BookOpen className="w-10 h-10 text-[var(--color-ink-dim)] mx-auto mb-3" aria-hidden="true" />
            <p className="text-base text-[var(--color-ink-3)]">
              Belum ada artikel yang dipublikasikan saat ini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((art, idx) => (
              <article
                key={art.id}
                className="p-6 sm:p-8 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-2xl card-hover-lift transition-all duration-300 group"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                  {/* Number / Category */}
                  <div className="lg:col-span-3 space-y-2">
                    <span className="inline-block text-xs font-bold uppercase tracking-wider text-[var(--color-accent)] px-2.5 py-1 rounded-md bg-[var(--color-accent-bg)]">
                      {art.category}
                    </span>
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-[var(--color-ink-4)] pt-1">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        {art.readTime}
                      </span>
                      <span aria-hidden="true">&bull;</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                        <time dateTime={art.publishedAt}>{art.publishedAt}</time>
                      </span>
                    </div>
                  </div>

                  {/* Title & Excerpt */}
                  <div className="lg:col-span-7 space-y-2">
                    <h3
                      className="text-xl sm:text-2xl font-medium text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors duration-200 leading-snug"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      <Link href={`/articles/${art.slug}`} className="hover:underline">
                        {art.title}
                      </Link>
                    </h3>
                    <p className="text-base sm:text-lg text-[var(--color-ink-3)] leading-relaxed line-clamp-2">
                      {art.excerpt}
                    </p>
                  </div>

                  {/* Read Button */}
                  <div className="lg:col-span-2 flex lg:justify-end items-center pt-2 lg:pt-0">
                    <Link
                      href={`/articles/${art.slug}`}
                      className="btn-secondary text-sm py-2.5 px-4 min-h-[44px]"
                      aria-label={`Baca artikel: ${art.title}`}
                    >
                      <span>Baca Lengkap</span>
                      <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                    </Link>
                  </div>

                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
