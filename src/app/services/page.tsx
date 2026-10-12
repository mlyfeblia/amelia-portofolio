import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { safeJsonLd } from '@/lib/utils';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import { ServicesHero } from '@/components/services/ServicesHero';
import { ServicesPillars } from '@/components/services/ServicesPillars';
import { ServicesFormats } from '@/components/services/ServicesFormats';
import { ServicesWorkflow } from '@/components/services/ServicesWorkflow';
import { ServicesCta } from '@/components/services/ServicesCta';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mlyfeblia.vercel.app';

export const metadata: Metadata = {
  title: 'Layanan Konseling Sebaya & Bimbingan',
  description:
    'Layanan bimbingan konseling sebaya bersama Amelia. Pilihan sesi fleksibel via Google Meet, Chat terjadwal, dan tatap muka di Cirebon yang hangat dan rahasia.',
  alternates: {
    canonical: `${BASE_URL}/services`,
  },
  openGraph: {
    title: 'Layanan Konseling Sebaya | Amelia',
    description:
      'Layanan bimbingan konseling sebaya bersama Amelia. Pilihan sesi fleksibel via Google Meet, Chat terjadwal, dan tatap muka di Cirebon yang hangat dan rahasia.',
    url: `${BASE_URL}/services`,
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/amelia.webp`,
        width: 1200,
        height: 1500,
        alt: 'Layanan Konseling Amelia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Layanan Konseling Sebaya | Amelia',
    description:
      'Pilihan sesi konseling fleksibel via Google Meet, Chat terjadwal, dan tatap muka di Cirebon yang hangat dan rahasia.',
    images: [`${BASE_URL}/amelia.webp`],
  },
};

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Layanan Bimbingan Konseling Sebaya Amelia',
  serviceType: 'Bimbingan Konseling Sebaya & Konseling Islam',
  description:
    'Layanan bimbingan konseling sebaya bersama Amelia. Pilihan sesi fleksibel via Google Meet, Chat terjadwal, dan tatap muka di Cirebon yang hangat dan rahasia.',
  provider: {
    '@type': 'Person',
    name: 'Amelia',
    url: BASE_URL,
    image: `${BASE_URL}/amelia.webp`,
  },
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Indonesia',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Format Sesi Konseling',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Sesi Online Google Meet (60 Menit)',
          description: 'Konseling tatap maya privat dengan suasana hangat dan reflektif.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Sesi Online Chat Terjadwal (60 Menit)',
          description: 'Diskusi berbasis teks intensif dan terarah bagi yang lebih nyaman menulis.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Sesi Tatap Muka Langsung di Cirebon (60 Menit)',
          description: 'Pertemuan langsung di lingkungan yang tenang dan kondusif di wilayah Cirebon.',
        },
      },
    ],
  },
};

export default function ServicesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', url: BASE_URL },
          { name: 'Layanan', url: `${BASE_URL}/services` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(serviceJsonLd) }}
      />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 pt-8 sm:pt-10 md:pt-12 pb-12 sm:pb-16 page-enter">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-16 lg:space-y-20">
            <ServicesHero />
            <ServicesPillars />
            <ServicesFormats />
            <ServicesWorkflow />
            <ServicesCta />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
