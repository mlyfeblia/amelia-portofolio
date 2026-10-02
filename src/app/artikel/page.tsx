import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Clock, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getArticles } from '@/lib/data-store';

export const metadata: Metadata = {
  title: 'Artikel & Refleksi Konseling Islam — Amelia BKI',
  description:
    'Kumpulan tulisan, kajian, dan catatan reflektif seputar kesehatan jiwa, resiliensi spiritual, dan bimbingan konseling Islam di era siber oleh Amelia.',
};

export default async function ArtikelIndexPage() {
  const articles = await getArticles();

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-6 space-y-12">

          <div className="max-w-3xl space-y-3">
            <h1
              className="text-3xl sm:text-4xl font-medium text-[var(--color-ink)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Artikel &amp; Refleksi
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-ink-muted)] leading-relaxed">
              Catatan pemikiran seputar kesehatan jiwa, navigasi krisis kehidupan, dan etika konseling generasi digital berlandaskan kearifan Islam.
            </p>
          </div>

          <div className="divide-y divide-[var(--color-paper-border)] border-y border-[var(--color-paper-border)]">
            {articles.map((art) => (
              <article key={art.id} className="py-8 group">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-3 space-y-1">
                    <span className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wider">
                      {art.category}
                    </span>
                    <div className="text-xs text-[var(--color-ink-soft)] space-x-2 pt-1">
                      <span>{art.readTime}</span>
                      <span>&bull;</span>
                      <time dateTime={art.publishedAt}>{art.publishedAt}</time>
                    </div>
                  </div>

                  <div className="md:col-span-7 space-y-2">
                    <h2
                      className="text-xl sm:text-2xl font-medium text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      <Link href={`/artikel/${art.slug}`}>
                        {art.title}
                      </Link>
                    </h2>
                    <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed line-clamp-2">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="md:col-span-2 flex md:justify-end">
                    <Link
                      href={`/artikel/${art.slug}`}
                      className="btn-secondary text-xs py-2 px-3 inline-flex items-center gap-1"
                    >
                      Baca Artikel
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
