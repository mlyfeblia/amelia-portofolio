import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CurhatSection from '@/components/CurhatSection';

export const metadata: Metadata = {
  title: 'Ruang Curhat Anonim — Amelia BKI',
  description:
    'Sampaikan keluh kesah, kegelisahan akademik, dan pertanyaan hati secara anonim tanpa identitas. Amel membaca dan menanggapi dengan pendekatan bimbingan konseling Islam.',
};

export default function CurhatPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-6 space-y-8">
          <div className="max-w-3xl">
            <h1
              className="text-3xl sm:text-4xl font-medium text-[var(--color-ink)] mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Ruang Curhat Anonim
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-ink-muted)] leading-relaxed">
              Keluarkan segala hal yang mengganjal di hatimu tanpa rasa takut dinilai atau dihakimi. Identitasmu sepenuhnya terlindungi.
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
