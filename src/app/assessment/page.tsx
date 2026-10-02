import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AssessmentSection from '@/components/AssessmentSection';

export const metadata: Metadata = {
  title: 'Asesmen',
  description:
    'Lakukan refleksi mandiri 2 menit untuk mengenali kondisi beban pikiran, resiliensi emosi, dan kedamaian batin Anda bersama Amelia.',
};

export default function AssessmentPage() {
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
              Asesmen Kesejahteraan Jiwa
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-ink-muted)] leading-relaxed">
              Luangkan waktu 2 menit untuk mengecek kondisi hatimu hari ini. Instrumen refleksi sederhana ini membantumu mengenali ritme pikiran, kestabilan emosi, dan ketenteraman batin secara mandiri.
            </p>
          </div>

          <div className="pt-4">
            <AssessmentSection />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
