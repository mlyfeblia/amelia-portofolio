import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import { safeJsonLd } from '@/lib/utils';
import { ArticlesDirectory } from '@/components/articles/ArticlesDirectory';
import { getArticles } from '@/lib/data-store';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mlyfeblia.vercel.app';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Artikel & Catatan Refleksi - Bimbingan Konseling Islam',
  description:
    'Kumpulan tulisan ilmiah populer, panduan kesehatan mental islami, tips mengatasi burnout, overthinking, quarter-life crisis, dan etika konseling oleh Amelia.',
  keywords: [
    'artikel kesehatan mental',
    'bimbingan konseling islam',
    'thuma\'ninah',
    'tazkiyatun nafs',
    'overthinking',
    'burnout mahasiswa',
    'quarter life crisis',
    'konselor sebaya cirebon',
    'uin siber cirebon',
    'amelia bki',
  ],
  authors: [{ name: 'Amelia', url: `${BASE_URL}/about` }],
  creator: 'Amelia',
  publisher: 'Amelia Portofolio & Konseling',
  alternates: {
    canonical: `${BASE_URL}/articles`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Artikel & Catatan Refleksi | Amelia - Bimbingan Konseling Islam',
    description:
      'Kumpulan tulisan santai dan reflektif seputar kesehatan mental, mengatasi cemas, dan menjaga ketenangan batin oleh Amelia.',
    url: `${BASE_URL}/articles`,
    siteName: 'Amelia Portofolio & Konseling',
    locale: 'id_ID',
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
      'Kumpulan tulisan santai seputar kesehatan mental, navigasi krisis usia muda, dan tips batin meneduhkan.',
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
        description: art.excerpt,
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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 pt-8 sm:pt-10 md:pt-12 pb-12 sm:pb-16 page-enter outline-none"
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-10 sm:space-y-12">
            <div className="max-w-3xl space-y-3">
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

            <ArticlesDirectory initialArticles={articles} />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
