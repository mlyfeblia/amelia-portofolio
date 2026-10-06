import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="pt-8 sm:pt-10 md:pt-12 pb-16 sm:pb-20 md:pb-24 border-b border-[var(--color-paper-border)]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 lg:gap-16 items-center">
          {/* Left Column: Heading & Value Proposition */}
          <div className="md:col-span-7 space-y-6 lg:space-y-8">
            <div className="space-y-4">
              <h1
                className="text-3xl sm:text-4xl lg:text-[2.85rem] font-medium text-[var(--color-ink)] leading-[1.2] tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Ruang Aman untuk Mendengar, Bercerita, dan Bertumbuh.
              </h1>

              <p className="text-base sm:text-lg lg:text-[1.125rem] text-[var(--color-ink-muted)] leading-relaxed max-w-2xl">
                Hai, kenalkan aku <strong className="text-[var(--color-ink)] font-semibold">Amelia (Amel)</strong>, teman sebaya untuk mendengar cerita dan keluh kesahmu. Di sini kamu bisa bebas melepaskan overthinking atau curhat tanpa rasa takut dihakimi.
              </p>
            </div>

            {/* Primary Actions */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                href="/schedule"
                className="btn-primary btn-interactive min-h-[46px] px-6 text-[15px] inline-flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Jadwalkan Konsultasi</span>
              </Link>
              <Link
                href="/about"
                className="btn-secondary btn-interactive min-h-[46px] px-6 text-[15px] inline-flex items-center gap-2"
              >
                <User className="w-4 h-4 text-[var(--color-ink-soft)]" />
                <span>Kenali Profil Amel</span>
              </Link>
            </div>

            {/* Commitments Summary */}
            <div className="pt-8 border-t border-[var(--color-paper-border)] grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-xs sm:text-sm text-[var(--color-ink-muted)]">
              <div className="p-3 sm:p-0 rounded-lg sm:rounded-none bg-[var(--color-surface)] sm:bg-transparent border sm:border-0 border-[var(--color-paper-border)]">
                <span className="block font-semibold text-[var(--color-ink)] text-sm sm:text-base">Pengalaman 2020+</span>
                <span>Operasional &amp; Kasir</span>
              </div>
              <div className="p-3 sm:p-0 rounded-lg sm:rounded-none bg-[var(--color-surface)] sm:bg-transparent border sm:border-0 border-[var(--color-paper-border)]">
                <span className="block font-semibold text-[var(--color-ink)] text-sm sm:text-base">Kepemimpinan</span>
                <span>Duta &amp; Fasilitator</span>
              </div>
              <div className="p-3 sm:p-0 rounded-lg sm:rounded-none bg-[var(--color-surface)] sm:bg-transparent border sm:border-0 border-[var(--color-paper-border)]">
                <span className="block font-semibold text-[var(--color-ink)] text-sm sm:text-base">Konseling Sebaya</span>
                <span>100% Rahasia &amp; Hangat</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Portrait Photo */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <div className="relative w-full max-w-[340px] aspect-[4/5] rounded-2xl overflow-hidden bg-[#1E2E25] border border-[var(--color-paper-border)] shadow-sm group card-interactive">
              <Image
                src="/amelia.webp"
                alt="Foto Profil Amelia, Mahasiswi Bimbingan Konseling UIN Siber Syekh Nurjati Cirebon"
                fill
                priority
                unoptimized
                decoding="sync"
                placeholder="blur"
                blurDataURL="data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAAAwBACdASoQABQAPzmGuVOvKSWisAgB4CcJZwDImCLY9Ls72ZrEJEF4/ewA/owBQOkyjLLc5jRc6xVnRV8Ih0nQBejrOHiefbZyHM/aYbkUsYDKEbJfV2RdDH7EoOfAAAA="
                sizes="(max-width: 768px) 100vw, 340px"
                className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)]/70 via-transparent to-transparent opacity-80 pointer-events-none" />
              
              <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none select-none">
                <p
                  className="text-lg font-medium leading-snug"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Amelia
                </p>
                <p className="text-xs text-white/80">
                  Bimbingan Konseling · UIN Siber Cirebon
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
