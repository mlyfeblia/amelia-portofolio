import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, GraduationCap, Phone, Mail, MessageCircle } from 'lucide-react';
import { getGeneralWhatsAppUrl } from '@/lib/whatsapp';

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function AboutHero() {
  return (
    <section className="bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xs">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Photo Column */}
        <div className="md:col-span-4 flex justify-center">
          <div className="relative w-48 sm:w-56 md:w-full max-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden shadow-md border-2 border-[var(--color-paper-border)] bg-[#1E2E25] group">
            <Image
              src="/amelia.webp"
              alt="Foto Profil Amelia, Mahasiswi Bimbingan Konseling UIN Siber Syekh Nurjati Cirebon"
              fill
              priority
              unoptimized
              decoding="sync"
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAAAwBACdASoQABQAPzmGuVOvKSWisAgB4CcJZwDImCLY9Ls72ZrEJEF4/ewA/owBQOkyjLLc5jRc6xVnRV8Ih0nQBejrOHiefbZyHM/aYbkUsYDKEbJfV2RdDH7EoOfAAAA="
              sizes="(max-width: 768px) 240px, 320px"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)]/70 via-transparent to-transparent opacity-80 pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none select-none">
              <p className="font-semibold text-white text-sm">Amelia</p>
              <p className="font-medium text-white/80 text-xs">UIN Siber Cirebon</p>
            </div>
          </div>
        </div>

        {/* Information Column */}
        <div className="md:col-span-8 space-y-5 lg:space-y-6">
          <div className="space-y-3">
            <h1
              className="text-3xl sm:text-4xl lg:text-[2.65rem] font-medium text-[var(--color-ink)] leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Mengenal Sosok Amel
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-ink-muted)] leading-relaxed">
              Halo, kamu bisa panggil aku <strong className="text-[var(--color-ink)]">Amel</strong>. Senang bisa menyapamu di ruang aman ini, tempat di mana kamu boleh meluapkan keluh kesah tanpa takut dinilai atau dihakimi.
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 text-sm text-[var(--color-ink-muted)]">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
              <span>Cirebon, Jawa Barat, Indonesia</span>
            </div>
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
              <span>Semester 3 · UIN Siber Syekh Nurjati</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
              <a
                href={getGeneralWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-accent)] hover:underline font-medium"
              >
                +62 822-1044-5785
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
              <a
                href="mailto:mlyfeblia150207@gmail.com"
                className="hover:text-[var(--color-accent)] hover:underline truncate font-medium"
              >
                mlyfeblia150207@gmail.com
              </a>
            </div>
          </div>

          {/* Social & Contact Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[var(--color-paper-border)]">
            <a
              href={getGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary btn-interactive text-sm min-h-[42px] px-5 inline-flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hubungi WhatsApp</span>
            </a>
            <a
              href="https://www.instagram.com/mlyfeb.lia"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary btn-interactive text-sm min-h-[42px] px-4.5 inline-flex items-center gap-2"
            >
              <InstagramIcon className="w-4 h-4 text-[var(--color-ink-soft)]" />
              <span>Profil Instagram</span>
            </a>
            <Link
              href="/schedule"
              className="text-sm font-semibold text-[var(--color-accent)] hover:underline ml-1 py-2"
            >
              Jadwalkan Konsultasi &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
