import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getArticles } from '@/lib/data-store';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Artikel',
  description:
    'Kumpulan tulisan, kajian, dan catatan reflektif seputar kesehatan jiwa, navigasi krisis mahasiswa, dan etika konseling oleh Amelia.',
};

export default async function ArticlesIndexPage() {
  const articles = await getArticles();

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen pt-8 sm:pt-10 md:pt-12 pb-16 sm:pb-20 md:pb-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-12">

          <div className="max-w-3xl space-y-3 animate-fade-in-up">
            <h1
              className="text-3xl sm:text-4xl lg:text-[2.65rem] font-medium text-[var(--color-ink)] leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Artikel &amp; Catatan Refleksi
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-ink-muted)] leading-relaxed">
              Kumpulan tulisan santai seputar kesehatan mental, cara mengatasi overthinking, dan tips menjaga ketenangan batin berlandaskan nilai-nilai yang meneduhkan.
            </p>
          </div>

          <div className="divide-y divide-[var(--color-paper-border)] border-y border-[var(--color-paper-border)]" data-reveal>
            {articles.map((art) => (
              <article key={art.id} className="py-8 group">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-3 space-y-1">
                    <span className="text-xs font-semibold text-[var(--color-accent)] px-2.5 py-0.5 rounded-full bg-[var(--color-accent-soft)]">
                      {art.category}
                    </span>
                    <div className="text-xs text-[var(--color-ink-soft)] space-x-2 pt-2">
                      <span>{art.readTime}</span>
                      <span>&bull;</span>
                      <time dateTime={art.publishedAt}>{art.publishedAt}</time>
                    </div>
                  </div>

                  <div className="md:col-span-7 space-y-2">
                    <h2
                      className="text-xl sm:text-2xl font-medium text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors leading-snug"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      <Link href={`/articles/${art.slug}`}>
                        {art.title}
                      </Link>
                    </h2>
                    <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed line-clamp-2">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="md:col-span-2 flex md:justify-end">
                    <Link
                      href={`/articles/${art.slug}`}
                      className="btn-secondary text-xs py-2 px-3.5 inline-flex items-center gap-1"
                    >
                      Baca Tulisan
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
