import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CurhatSection from '@/components/CurhatSection';

export const metadata: Metadata = {
  title: 'Curhat',
  description:
    'Sampaikan keluh kesah, kegelisahan akademik, dan unek-unek hatimu secara anonim tanpa identitas. Amel membaca dan menanggapi dengan pendekatan bimbingan yang hangat.',
};

export default function CounselingPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen pt-8 sm:pt-10 md:pt-12 pb-16 sm:pb-20 md:pb-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-8 animate-fade-in-up">
          <div className="max-w-3xl space-y-2">
            <h1
              className="text-3xl sm:text-4xl lg:text-[2.65rem] font-medium text-[var(--color-ink)] leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Ruang Curhat Anonim
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-ink-muted)] leading-relaxed">
              Tumpahkan apa pun yang membuat dadamu terasa sesak tanpa takut dinilai atau dihakimi. Identitasmu 100% anonim dan terlindungi.
            </p>
          </div>

          <div className="pt-4">
            <CurhatSection />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
