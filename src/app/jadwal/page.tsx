import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingSection from '@/components/BookingSection';

export const metadata: Metadata = {
  title: 'Janji Temu Konseling — Amelia BKI',
  description:
    'Jadwalkan sesi bimbingan konseling privat 60 menit bersama Amelia. Pilih format sesi daring (Google Meet/Chat) atau tatap muka di Cirebon.',
};

export default function JadwalPage() {
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
              Jadwalkan Sesi Konseling
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-ink-muted)] leading-relaxed">
              Tentukan waktu dan format sesi yang paling tenang untuk Anda. Seluruh informasi yang Anda sampaikan terjaga kerahasiaannya.
            </p>
          </div>

          <div className="pt-4">
            <BookingSection />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
