import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingSection from '@/components/BookingSection';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import { safeJsonLd } from '@/lib/utils';
import type { CounselingMode } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mlyfeblia.vercel.app';

export const metadata: Metadata = {
  title: 'Jadwalkan Sesi Konseling Privat',
  description:
    'Jadwalkan sesi bimbingan konseling privat 60 menit bersama Amelia. Pilih format sesi daring (Google Meet/Chat) atau tatap muka di Cirebon.',
  alternates: {
    canonical: `${BASE_URL}/schedule`,
  },
  openGraph: {
    title: 'Jadwalkan Sesi Konseling | Amelia',
    description:
      'Jadwalkan sesi bimbingan konseling privat 60 menit bersama Amelia. Pilih format sesi daring (Google Meet/Chat) atau tatap muka di Cirebon.',
    url: `${BASE_URL}/schedule`,
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/amelia.webp`,
        width: 1200,
        height: 1500,
        alt: 'Jadwalkan Sesi Konseling Amelia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jadwalkan Sesi Konseling | Amelia',
    description:
      'Jadwalkan sesi bimbingan konseling privat 60 menit bersama Amelia secara mudah dan rahasia.',
    images: [`${BASE_URL}/amelia.webp`],
  },
};

const scheduleServiceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Reservasi Sesi Konseling Privat Amelia',
  serviceType: 'Bimbingan Konseling Privat',
  url: `${BASE_URL}/schedule`,
  provider: {
    '@type': 'Person',
    name: 'Amelia',
    url: BASE_URL,
  },
  potentialAction: {
    '@type': 'ReserveAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/schedule`,
      actionPlatform: [
        'http://schema.org/DesktopWebPlatform',
        'http://schema.org/MobileWebPlatform',
      ],
    },
    result: {
      '@type': 'Reservation',
      name: 'Janji Temu Konseling',
    },
  },
};

interface SchedulePageProps {
  searchParams?: Promise<{
    tab?: string;
    code?: string;
    format?: string;
    mode?: string;
  }>;
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const params = await searchParams;
  const initialTab = params?.tab === 'tracker' ? 'tracker' : params?.tab === 'new' ? 'new' : undefined;
  const initialCode = typeof params?.code === 'string' ? params.code : undefined;
  const rawMode = params?.format || params?.mode;
  const initialMode: CounselingMode | undefined =
    rawMode && ['online_meet', 'online_chat', 'tatap_muka_cirebon'].includes(rawMode)
      ? (rawMode as CounselingMode)
      : undefined;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', url: BASE_URL },
          { name: 'Jadwal Konseling', url: `${BASE_URL}/schedule` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(scheduleServiceJsonLd) }}
      />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 pt-6 sm:pt-10 md:pt-12 pb-12 sm:pb-16 page-enter">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 space-y-6 sm:space-y-8">
            <div className="max-w-3xl space-y-2">
              <h1
                className="text-2xl sm:text-4xl lg:text-[2.65rem] font-medium text-[var(--color-ink)] leading-tight tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Jadwalkan Sesi Konseling
              </h1>
              <p className="text-sm sm:text-lg text-[var(--color-ink-muted)] leading-relaxed">
                Tentukan waktu dan format sesi yang paling tenang buatmu. Seluruh informasi yang kamu sampaikan terjamin kerahasiaannya.
              </p>
            </div>

            <div className="pt-1 sm:pt-4">
              <BookingSection initialTab={initialTab} initialCode={initialCode} initialMode={initialMode} />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
