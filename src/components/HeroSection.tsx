import React from 'react';
import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { getGeneralWhatsAppUrl } from '@/lib/whatsapp';

export default function HeroSection() {
  return (
    <section
      className="pt-16 pb-20 md:pt-24 md:pb-28 border-b border-[var(--color-line)]"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column | Core Message */}
          <div className="lg:col-span-7 space-y-8">
            {/* Main Headline */}
            <div className="space-y-5">
              <h1
                id="hero-heading"
                className="text-4xl sm:text-5xl lg:text-[3.5rem] font-medium text-[var(--color-ink)] leading-[1.14] tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Ruang aman untuk
                <br />
                <span className="text-[var(--color-accent)]">cerita yang belum</span>
                <br />
                bisa diucapkan.
              </h1>
              <p className="text-lg sm:text-xl text-[var(--color-ink-2)] leading-relaxed max-w-xl">
                Saya <strong className="text-[var(--color-ink)] font-semibold">Amelia (Amel)</strong>, konselor sebaya yang memadukan psikologi modern dengan kedalaman spiritual Islam (<em>Tazkiyatun Nafs</em>) di era digital.
              </p>
            </div>

            {/* Action Buttons with high contrast and smooth hover animations */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#jadwal"
                className="btn-primary min-h-[48px]"
              >
                Jadwalkan Sesi Konseling
                <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </a>
              <a
                href="#skrining"
                className="btn-secondary min-h-[48px]"
              >
                Asesmen Jiwa Mandiri
              </a>
            </div>

            {/* Reassuring Key Features / Pillars */}
            <div className="pt-6 border-t border-[var(--color-line)] grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { label: 'Prinsip Utama', value: 'Empati & Amanah' },
                { label: 'Metode Pendekatan', value: 'CBT + Tazkiyah' },
                { label: 'Format Sesi', value: 'Online & Offline' },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <p className="text-xs font-semibold text-[var(--color-ink-4)]">
                    {item.label}
                  </p>
                  <p className="text-[15px] font-semibold text-[var(--color-ink)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column | Profile Card with Photo */}
          <div className="lg:col-span-5">
            <div
              className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-2xl p-6 sm:p-8 card-hover-lift shadow-sm relative overflow-hidden"
              role="complementary"
              aria-label="Profil Amelia"
            >
              {/* Photo & Identity */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-32 h-40 sm:w-36 sm:h-44 rounded-xl overflow-hidden shadow-md border-2 border-[var(--color-accent-border)] mb-4 bg-[var(--color-paper-2)]">
                  <Image
                    src="/amelia.webp"
                    alt="Foto Profil Amelia, Mahasiswi Bimbingan Konseling UIN Siber Syekh Nurjati Cirebon"
                    fill
                    sizes="180px"
                    className="object-cover object-top"
                    priority
                  />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-xs font-semibold mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Mahasiswi Bimbingan Konseling (Sm. 3)
                </div>

                <h2
                  className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)] mb-1"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Amelia (Amel)
                </h2>
                <p className="text-sm text-[var(--color-ink-3)] font-medium mb-1">
                  UIN Siber Syekh Nurjati Cirebon
                </p>
                <p className="text-xs text-[var(--color-ink-4)] max-w-xs leading-relaxed">
                  Praktisi Layanan Pelanggan &amp; Kasir sejak 2020 · Duta Inspirasi Indonesia Batch 19
                </p>
              </div>

              {/* Gentle separator */}
              <div className="my-5 border-t border-[var(--color-line)]" />

              {/* Quick info list */}
              <ul className="space-y-2.5 text-xs sm:text-sm text-[var(--color-ink-2)]" role="list">
                <li className="flex items-center justify-between">
                  <span className="text-[var(--color-ink-4)]">Domisili</span>
                  <span className="font-semibold text-[var(--color-ink)]">Cirebon &amp; Daring</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-[var(--color-ink-4)]">WhatsApp</span>
                  <a
                    href={getGeneralWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[var(--color-accent)] hover:underline"
                  >
                    +62 822-1044-5785
                  </a>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-[var(--color-ink-4)]">Kode Etik</span>
                  <span className="font-semibold text-[var(--color-accent)]">100% Kerahasiaan Terjamin</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
