import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AssessmentSection from '@/components/AssessmentSection';

export const metadata: Metadata = {
  title: 'Asesmen Kesejahteraan Jiwa — Amelia BKI',
  description:
    'Lakukan refleksi mandiri 2 menit untuk mengenali kondisi beban pikiran, resiliensi emosi, dan kedamaian spiritual Anda bersama konselor sebaya Amelia.',
};

export default function AsesmenPage() {
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
              Asesmen Kesejahteraan Jiwa
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-ink-muted)] leading-relaxed">
              Sebuah instrumen refleksi mandiri sederhana untuk membantu Anda mengenali ritme pikiran, kestabilan emosi, dan ketenteraman batin saat ini.
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
