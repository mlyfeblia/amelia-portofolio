import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, Clock, Calendar, ArrowRight } from 'lucide-react';
import { getArticleBySlug } from '@/lib/data-store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mlyfeblia.vercel.app';

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Artikel Tidak Ditemukan',
      description: 'Artikel yang Anda cari tidak tersedia.',
      robots: { index: false },
    };
  }

  const url = `${BASE_URL}/artikel/${slug}`;

  return {
    title: article.title,
    description: article.excerpt,
    keywords: [...(article.tags ?? []), 'BKI', 'Bimbingan Konseling Islam', 'Amelia', 'UIN Siber Cirebon'],
    authors: [{ name: 'Amelia', url: BASE_URL }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'article',
      locale: 'id_ID',
      url,
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt,
      authors: ['Amelia'],
      tags: article.tags,
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${article.title} | Amelia BKI`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [`${BASE_URL}/og-image.png`],
    },
  };
}

function ArticleJsonLd({
  title,
  excerpt,
  slug,
  publishedAt,
  tags,
}: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  tags: string[];
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt,
    url: `${BASE_URL}/artikel/${slug}`,
    datePublished: publishedAt,
    author: {
      '@type': 'Person',
      name: 'Amelia',
      url: BASE_URL,
      affiliation: {
        '@type': 'EducationalOrganization',
        name: 'UIN Siber Syekh Nurjati Cirebon',
      },
    },
    publisher: {
      '@type': 'Person',
      name: 'Amelia',
      url: BASE_URL,
    },
    keywords: tags.join(', '),
    inLanguage: 'id-ID',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function ArticleDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      <ArticleJsonLd
        title={article.title}
        excerpt={article.excerpt}
        slug={slug}
        publishedAt={article.publishedAt}
        tags={article.tags}
      />
      <Navbar />
      <main
        id="main-content"
        className="min-h-screen"
        tabIndex={-1}
        style={{ backgroundColor: 'var(--color-paper)' }}
      >
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14 md:py-24">

          {/* Back link */}
          <Link
            href="/#artikel"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ink-3)] hover:text-[var(--color-accent)] mb-10 transition-colors duration-150 min-h-[44px] group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            Kembali ke Daftar Tulisan
          </Link>

          <article aria-labelledby="article-title">
            {/* Article Header */}
            <header className="mb-12 pb-8 border-b border-[var(--color-line)] space-y-5">
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                <span className="font-bold text-[var(--color-accent)] uppercase tracking-wider px-2.5 py-1 rounded bg-[var(--color-accent-bg)]">
                  {article.category}
                </span>
                <span className="text-[var(--color-ink-dim)]" aria-hidden="true">&bull;</span>
                <span className="inline-flex items-center gap-1 text-[var(--color-ink-4)]">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  {article.readTime}
                </span>
                <span className="text-[var(--color-ink-dim)]" aria-hidden="true">&bull;</span>
                <time
                  dateTime={article.publishedAt}
                  className="inline-flex items-center gap-1 text-[var(--color-ink-4)]"
                >
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  {article.publishedAt}
                </time>
              </div>

              <h1
                id="article-title"
                className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[var(--color-ink)] leading-[1.18]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {article.title}
              </h1>

              <p className="text-lg sm:text-xl text-[var(--color-ink-2)] leading-relaxed italic">
                {article.excerpt}
              </p>

              {/* Byline */}
              <div
                className="flex items-center gap-3.5 pt-6 border-t border-[var(--color-line)]"
                aria-label="Penulis artikel"
              >
                <div
                  className="w-12 h-12 rounded-full bg-[var(--color-accent-bg)] border border-[var(--color-accent-line)] text-[var(--color-accent)] flex items-center justify-center text-lg font-bold shrink-0"
                  aria-hidden="true"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  A
                </div>
                <div>
                  <div className="text-base font-bold text-[var(--color-ink)]">
                    Amelia (Amel)
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--color-ink-3)]">
                    Konselor Sebaya · Mahasiswi Bimbingan Konseling Islam UIN Siber Cirebon
                  </div>
                </div>
              </div>
            </header>

            {/* Body Content */}
            <div
              className="prose-body text-base sm:text-lg text-[var(--color-ink-2)] leading-relaxed space-y-6 mb-12"
              aria-label="Isi artikel"
            >
              {article.content}
            </div>

            {/* Tags */}
            {article.tags.length > 0 && (
              <div
                className="flex flex-wrap gap-2 pt-8 border-t border-[var(--color-line)]"
                role="list"
                aria-label="Tag artikel"
              >
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    role="listitem"
                    className="text-xs font-semibold px-3 py-1.5 border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-3)] rounded-lg"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Counselor CTA Card */}
            <div
              className="mt-14 p-8 sm:p-10 border border-[var(--color-accent-line)] rounded-2xl bg-[var(--color-accent-bg)]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 card-hover-lift"
              role="complementary"
              aria-label="Ajakan untuk sesi konseling"
            >
              <div className="space-y-2">
                <h2
                  className="text-2xl font-medium text-[var(--color-ink)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Merasakan hal serupa dan butuh teman diskusi?
                </h2>
                <p className="text-base text-[var(--color-ink-2)] max-w-lg leading-relaxed">
                  Amel siap mendengarkan cerita dan kegelisahanmu tanpa penghakiman melalui sesi bimbingan privat yang terjaga amanahnya.
                </p>
              </div>
              <Link
                href="/#jadwal"
                className="btn-primary min-h-[48px] shrink-0"
              >
                Jadwalkan Konsultasi
                <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </Link>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
