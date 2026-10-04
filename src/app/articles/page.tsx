import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import { safeJsonLd } from '@/lib/utils';
import { ArticleListItem } from '@/components/articles/ArticleListItem';
import { getArticles } from '@/lib/data-store';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mlyfeblia.vercel.app';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Artikel & Catatan Refleksi',
  description:
    'Kumpulan tulisan, kajian, dan catatan reflektif seputar kesehatan jiwa, navigasi krisis mahasiswa, dan etika konseling oleh Amelia.',
  alternates: {
    canonical: `${BASE_URL}/articles`,
  },
  openGraph: {
    title: 'Artikel & Catatan Refleksi | Amelia',
    description:
      'Kumpulan tulisan santai seputar kesehatan mental, cara mengatasi overthinking, dan tips menjaga ketenangan batin oleh Amelia.',
    url: `${BASE_URL}/articles`,
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/amelia.webp`,
        width: 1200,
        height: 1500,
        alt: 'Artikel & Catatan Refleksi Amelia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artikel & Catatan Refleksi | Amelia',
    description:
      'Kumpulan tulisan santai seputar kesehatan mental, navigasi krisis, dan tips batin meneduhkan.',
    images: [`${BASE_URL}/amelia.webp`],
  },
};

export default async function ArticlesIndexPage() {
  const articles = await getArticles(true);

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Koleksi Artikel & Catatan Refleksi Amelia',
    description:
      'Kumpulan tulisan, kajian bimbingan konseling Islam, dan catatan reflektif seputar kesehatan jiwa oleh Amelia.',
    url: `${BASE_URL}/articles`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: articles.map((art, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${BASE_URL}/articles/${art.slug}`,
        name: art.title,
      })),
    },
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', url: BASE_URL },
          { name: 'Artikel', url: `${BASE_URL}/articles` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionJsonLd) }}
      />
      <Navbar />
      <main id="main-content" className="min-h-screen pt-8 sm:pt-10 md:pt-12 pb-16 sm:pb-20 md:pb-24 page-enter">
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
              <ArticleListItem key={art.id} article={art} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
