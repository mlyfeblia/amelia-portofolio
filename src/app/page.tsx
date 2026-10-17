import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getArticles, getCurhatList } from '@/lib/data-store';
import { HeroSection } from '@/components/home/HeroSection';
import { TrackRecordSection } from '@/components/home/TrackRecordSection';
import { ApproachSection } from '@/components/home/ApproachSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { AssessmentCallout } from '@/components/home/AssessmentCallout';
import { CurhatPreviewSection } from '@/components/home/CurhatPreviewSection';
import { ArticlesPreviewSection } from '@/components/home/ArticlesPreviewSection';
import { AppShowcaseSection } from '@/components/home/AppShowcaseSection';
import { seededShuffle } from '@/lib/prng';

import type { Metadata } from 'next';

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mlyfeblia.vercel.app';
const PAGE_TITLE = 'Amelia | Portofolio & Bimbingan Konseling';
const PAGE_DESC =
  'Portofolio resmi Amelia (Amel), mahasiswi Bimbingan Konseling Islam UIN Siber Syekh Nurjati Cirebon. Layanan konseling sebaya, ruang curhat anonim, dan artikel refleksi.';

export const metadata: Metadata = {
  title: {
    absolute: PAGE_TITLE,
  },
  description: PAGE_DESC,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE_URL,
    siteName: PAGE_TITLE,
    title: PAGE_TITLE,
    description: PAGE_DESC,
    images: [
      {
        url: `${SITE_URL}/amelia.webp`,
        width: 1200,
        height: 1500,
        alt: 'Amelia | Portofolio & Bimbingan Konseling UIN Siber Syekh Nurjati Cirebon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESC,
    images: [`${SITE_URL}/amelia.webp`],
  },
};

export default async function Home() {
  const [articles, curhatMessages] = await Promise.all([
    getArticles(true),
    getCurhatList(true),
  ]);

  // Calendar day key for automatic daily fallback showcase rotation (Asia/Jakarta timezone)
  const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());

  // Landing page curhat: prioritaskan kurasi admin (showOnLandingPage), fallback rotasi harian otomatis
  const publicAnswered = curhatMessages.filter((c) => c.isPublic && c.isAnswered);
  const landingCurhatPinned = publicAnswered.filter((c) => c.showOnLandingPage);
  const remainingCurhat = publicAnswered.filter((c) => !c.showOnLandingPage);
  const answeredCurhat = landingCurhatPinned.length > 0
    ? landingCurhatPinned
    : seededShuffle(remainingCurhat, `homepage_curhat_${dayKey}`).slice(0, 2);

  // Landing page articles: prioritaskan kurasi admin (showOnLandingPage), fallback rotasi harian otomatis
  const publishedArticles = articles.filter((a) => a.isPublished !== false);
  const landingArticlesPinned = publishedArticles.filter((a) => a.showOnLandingPage);
  const remainingArticles = publishedArticles.filter((a) => !a.showOnLandingPage);
  const featuredArticles = landingArticlesPinned.length > 0
    ? landingArticlesPinned
    : seededShuffle(remainingArticles, `homepage_articles_${dayKey}`).slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)]">
      <Navbar />

      <main
        id="main-content"
        className="flex-1 page-enter"
        aria-label="Beranda Portofolio Amelia"
        tabIndex={-1}
      >
        <HeroSection />
        <TrackRecordSection />
        <ApproachSection />
        <ServicesSection />
        <AssessmentCallout />
        <CurhatPreviewSection messages={answeredCurhat} />
        <ArticlesPreviewSection articles={featuredArticles} />
        <AppShowcaseSection />
      </main>

      <Footer />
    </div>
  );
}
