import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { 
  Home, 
  HeartHandshake, 
  Calendar, 
  Compass, 
  BookOpen, 
  ClipboardCheck, 
  ArrowRight 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '404 - Halaman Tidak Ditemukan | Amelia',
  description: 'Halaman yang kamu cari tidak ditemukan atau telah berpindah. Kembali ke beranda ruang konseling Amelia.',
  robots: {
    index: false,
    follow: false,
  },
};

const suggestedLinks = [
  {
    title: 'Ruang Curhat Anonim',
    desc: 'Ceritakan kegelisahanmu tanpa nama, 100% rahasia.',
    href: '/counseling',
    icon: HeartHandshake,
  },
  {
    title: 'Asesmen Diri 2 Menit',
    desc: 'Skrining mandiri refleksi stres dan burnout terkini.',
    href: '/assessment',
    icon: ClipboardCheck,
  },
  {
    title: 'Jadwal & Layanan',
    desc: 'Pilihan format sesi konseling sebaya yang hangat.',
    href: '/services',
    icon: Compass,
  },
  {
    title: 'Artikel & Refleksi',
    desc: 'Wawasan mindfulness dan kesehatan mental harian.',
    href: '/articles',
    icon: BookOpen,
  },
];

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main
        id="main-content"
        className="min-h-[calc(100vh-4rem)] bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col justify-center py-12 sm:py-16 md:py-20 page-enter"
        tabIndex={-1}
      >
        <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10 w-full">
          {/* Central Empathy Hero */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[var(--color-ink)] leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Ruang yang Kamu Tuju Belum Tersedia
            </h1>

            <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
              Mungkin alamat tautan telah berpindah, tautan sudah kedaluwarsa, atau ada kekeliruan saat mengetikkan URL. Jangan khawatir, kamu selalu bisa kembali ke tempat yang aman dan nyaman.
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <Link
                href="/"
                className="btn-primary btn-interactive min-h-[46px] px-6 text-sm inline-flex items-center gap-2 shadow-xs"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                <span>Kembali ke Beranda</span>
              </Link>
              <Link
                href="/schedule"
                className="btn-secondary btn-interactive min-h-[46px] px-6 text-sm inline-flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-[var(--color-ink-soft)]" aria-hidden="true" />
                <span>Jadwalkan Konseling</span>
              </Link>
            </div>
          </div>

          {/* Helpful Navigation Cards */}
          <div className="mt-14 sm:mt-16 pt-10 border-t border-[var(--color-paper-border)]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-soft)] text-center mb-6">
              Atau jelajahi ruang lain yang tersedia:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {suggestedLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] transition-all hover:-translate-y-0.5 group shadow-xs card-interactive flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center group-hover:bg-[var(--color-accent)] group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <h2 className="text-sm font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors">
                        {item.title}
                      </h2>
                      <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-3 mt-2 border-t border-[var(--color-paper-border)] flex items-center text-xs font-medium text-[var(--color-accent)]">
                      <span>Buka Halaman</span>
                      <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
