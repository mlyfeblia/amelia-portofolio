import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import { AboutHero } from '@/components/about/AboutHero';
import { AboutStory } from '@/components/about/AboutStory';
import { AboutWorkExperience } from '@/components/about/AboutWorkExperience';
import { AboutOrgExperience } from '@/components/about/AboutOrgExperience';
import { AboutEducation } from '@/components/about/AboutEducation';
import { AboutSkills } from '@/components/about/AboutSkills';
import { AboutCta } from '@/components/about/AboutCta';

import { safeJsonLd } from '@/lib/utils';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mlyfeblia.vercel.app';

export const metadata: Metadata = {
  title: 'Tentang Amelia - Profil & Pengalaman',
  description:
    'Profil lengkap Amelia (Amel), mahasiswi Bimbingan Konseling UIN Siber Syekh Nurjati Cirebon. Riwayat profesional pelayanan pelanggan, manajemen kasir & logistik sejak 2020, kepemimpinan organisasi pemuda, dan keahlian.',
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
  openGraph: {
    title: 'Tentang Amelia | Mahasiswi Bimbingan Konseling UIN Siber Cirebon',
    description:
      'Profil lengkap Amelia (Amel), rekam jejak profesional pelayanan pelanggan, kepemimpinan organisasi pemuda, dan konseling sebaya sejak 2020.',
    url: `${BASE_URL}/about`,
    type: 'profile',
    images: [
      {
        url: `${BASE_URL}/amelia.webp`,
        width: 1200,
        height: 1500,
        alt: 'Foto Profil Amelia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tentang Amelia | Mahasiswi Bimbingan Konseling',
    description:
      'Profil lengkap Amelia (Amel), rekam jejak profesional pelayanan pelanggan dan konseling sebaya.',
    images: [`${BASE_URL}/amelia.webp`],
  },
};

const profilePageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  mainEntity: {
    '@type': 'Person',
    name: 'Amelia',
    alternateName: 'Amel',
    description:
      'Mahasiswi Bimbingan Konseling Islam UIN Siber Syekh Nurjati Cirebon, berpengalaman dalam pelayanan pelanggan, operasional kasir, kepemimpinan organisasi pemuda, serta pendampingan konseling sebaya.',
    image: `${BASE_URL}/amelia.webp`,
    url: `${BASE_URL}/about`,
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'MAN 4 Cirebon',
    },
    affiliation: {
      '@type': 'EducationalOrganization',
      name: 'UIN Siber Syekh Nurjati Cirebon',
    },
  },
};

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', url: BASE_URL },
          { name: 'Tentang', url: `${BASE_URL}/about` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(profilePageJsonLd) }}
      />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 pt-8 sm:pt-10 md:pt-12 pb-12 sm:pb-16 page-enter">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-16 lg:space-y-20">
            <AboutHero />
            <AboutStory />
            <AboutWorkExperience />
            <AboutOrgExperience />
            <AboutEducation />
            <AboutSkills />
            <AboutCta />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
