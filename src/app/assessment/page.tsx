import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AssessmentSection from '@/components/AssessmentSection';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import { safeJsonLd } from '@/lib/utils';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mlyfeblia.vercel.app';

export const metadata: Metadata = {
  title: 'Asesmen Kesejahteraan Jiwa',
  description:
    'Lakukan refleksi mandiri 2 menit untuk mengenali kondisi beban pikiran, resiliensi emosi, dan kedamaian batinmu bersama Amel.',
  alternates: {
    canonical: `${BASE_URL}/assessment`,
  },
  openGraph: {
    title: 'Asesmen Kesejahteraan Jiwa | Amelia',
    description:
      'Lakukan refleksi mandiri 2 menit untuk mengenali kondisi beban pikiran, resiliensi emosi, dan kedamaian batinmu bersama Amel.',
    url: `${BASE_URL}/assessment`,
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/amelia.webp`,
        width: 1200,
        height: 1500,
        alt: 'Asesmen Kesejahteraan Jiwa Amelia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Asesmen Kesejahteraan Jiwa | Amelia',
    description:
      'Refleksi mandiri 2 menit untuk mengenali ritme pikiran, kestabilan emosi, dan ketenteraman batin.',
    images: [`${BASE_URL}/amelia.webp`],
  },
};

const assessmentAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Asesmen Kesejahteraan Jiwa Amelia',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'All',
  url: `${BASE_URL}/assessment`,
  description:
    'Alat refleksi dan asesmen mandiri 2 menit untuk mengenali ritme pikiran, kestabilan emosi, dan ketenteraman batin.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'IDR',
  },
  author: {
    '@type': 'Person',
    name: 'Amelia',
    url: BASE_URL,
  },
};

interface AssessmentPageProps {
  searchParams?: Promise<{
    tab?: string;
  }>;
}

export default async function AssessmentPage({ searchParams }: AssessmentPageProps) {
  const params = await searchParams;
  const initialTab = params?.tab === 'history' ? 'history' : params?.tab === 'quiz' ? 'quiz' : undefined;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', url: BASE_URL },
          { name: 'Asesmen', url: `${BASE_URL}/assessment` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(assessmentAppJsonLd) }}
      />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 pt-6 sm:pt-10 md:pt-12 pb-12 sm:pb-16 page-enter outline-none"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 space-y-6 sm:space-y-8">
            <div className="max-w-3xl space-y-2">
              <h1
                className="text-2xl sm:text-4xl lg:text-[2.65rem] font-medium text-[var(--color-ink)] leading-tight tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Asesmen Kesejahteraan Jiwa
              </h1>
              <p className="text-sm sm:text-lg text-[var(--color-ink-muted)] leading-relaxed">
                Luangkan waktu 2 menit untuk mengecek kondisi hatimu hari ini. Instrumen refleksi sederhana ini membantumu mengenali ritme pikiran, kestabilan emosi, dan ketenteraman batin secara mandiri.
              </p>
            </div>

            <div className="pt-1 sm:pt-4">
              <AssessmentSection initialTab={initialTab} />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
