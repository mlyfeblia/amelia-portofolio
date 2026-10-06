import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { safeJsonLd } from '@/lib/utils';
import CurhatSection from '@/components/CurhatSection';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import { CurhatHeader } from '@/components/counseling/CurhatHeader';
import { getCurhatList } from '@/lib/data-store';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mlyfeblia.vercel.app';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Ruang Curhat Anonim & Tanya Jawab',
  description:
    'Sampaikan keluh kesah, kegelisahan akademik, dan unek-unek hatimu secara anonim tanpa identitas. Amel membaca dan menanggapi dengan pendekatan bimbingan yang hangat.',
  alternates: {
    canonical: `${BASE_URL}/counseling`,
  },
  openGraph: {
    title: 'Ruang Curhat Anonim | Amelia',
    description:
      'Sampaikan keluh kesah, kegelisahan akademik, dan unek-unek hatimu secara anonim tanpa identitas. Amel membaca dan menanggapi dengan pendekatan bimbingan yang hangat.',
    url: `${BASE_URL}/counseling`,
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/amelia.webp`,
        width: 1200,
        height: 1500,
        alt: 'Ruang Curhat Anonim Amelia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ruang Curhat Anonim | Amelia',
    description:
      'Tumpahkan unek-unek hatimu secara anonim tanpa identitas. 100% aman dan rahasia bersama Amel.',
    images: [`${BASE_URL}/amelia.webp`],
  },
};

export default async function CounselingPage() {
  const initialCurhat = await getCurhatList(true);

  const answeredPublicCurhat = initialCurhat
    .filter((c) => c.isPublic && c.isAnswered && c.answer)
    .slice(0, 10);

  const faqJsonLd = answeredPublicCurhat.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: answeredPublicCurhat.map((c) => ({
      '@type': 'Question',
      name: c.category ? `[${c.category}] Curhat Anonim` : 'Curhat & Konsultasi Konseling Sebaya',
      text: c.message,
      acceptedAnswer: {
        '@type': 'Answer',
        text: c.answer,
        author: {
          '@type': 'Person',
          name: 'Amelia',
          url: BASE_URL,
        },
      },
    })),
  } : null;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', url: BASE_URL },
          { name: 'Curhat', url: `${BASE_URL}/counseling` },
        ]}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
        />
      )}
      <Navbar />
      <main id="main-content" className="min-h-screen pt-8 sm:pt-10 md:pt-12 pb-16 sm:pb-20 md:pb-24 page-enter">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-8">
          <CurhatHeader />
          <div className="pt-4">
            <CurhatSection initialMessages={initialCurhat} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
