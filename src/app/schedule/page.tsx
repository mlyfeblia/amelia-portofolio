import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingSection from '@/components/BookingSection';

export const metadata: Metadata = {
  title: 'Jadwal',
  description:
    'Jadwalkan sesi bimbingan konseling privat 60 menit bersama Amelia. Pilih format sesi daring (Google Meet/Chat) atau tatap muka di Cirebon.',
};

export default function SchedulePage() {
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
              Jadwalkan Sesi Konseling
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-ink-muted)] leading-relaxed">
              Tentukan waktu dan format sesi yang paling tenang buatmu. Seluruh informasi yang kamu sampaikan terjamin kerahasiaannya.
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
