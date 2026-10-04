import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, GraduationCap, Phone, Mail, ExternalLink } from 'lucide-react';
import { getGeneralWhatsAppUrl } from '@/lib/whatsapp';

export function AboutHero() {
  return (
    <section className="bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xs animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Photo Column */}
        <div className="md:col-span-4 flex justify-center">
          <div className="relative w-48 sm:w-56 md:w-full max-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden shadow-md border-2 border-[var(--color-paper-border)] bg-[var(--color-paper-muted)] group">
            <Image
              src="/amelia.webp"
              alt="Foto Profil Amelia, Mahasiswi Bimbingan Konseling UIN Siber Syekh Nurjati Cirebon"
              fill
              sizes="(max-width: 768px) 240px, 320px"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)]/70 via-transparent to-transparent opacity-80 pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 text-white text-xs pointer-events-none select-none">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[var(--color-accent)] font-semibold text-[11px] mb-1 shadow-xs">
                Mahasiswi Aktif
              </span>
              <p className="font-medium text-white/90">UIN Siber Cirebon</p>
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
              className="btn-primary text-sm min-h-[42px] px-5"
            >
              Hubungi WhatsApp
            </a>
            <a
              href="https://linkedin.com/in/amelia"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm min-h-[42px] px-4.5 inline-flex items-center gap-2"
            >
              Profil LinkedIn
              <ExternalLink className="w-3.5 h-3.5" />
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
