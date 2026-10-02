import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function HeroSection() {
  return (
    <section
      className="pt-16 pb-20 md:pt-24 md:pb-28 border-b border-[var(--color-line)]"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column — Core Message */}
          <div className="lg:col-span-7 space-y-8">

            {/* Kicker badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-paper-2)] border border-[var(--color-line)]">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] shrink-0" aria-hidden="true" />
              <p
                className="text-xs sm:text-[13px] font-semibold text-[var(--color-ink-3)] tracking-wider uppercase"
                aria-label="Program studi dan institusi"
              >
                Bimbingan Konseling Islam · UIN Siber Cirebon
              </p>
            </div>

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
                Saya <strong className="text-[var(--color-ink)] font-semibold">Amelia (Amel)</strong> — konselor sebaya yang memadukan psikologi modern dengan kedalaman spiritual Islam (<em>Tazkiyatun Nafs</em>) di era digital.
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
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-4)]">
                    {item.label}
                  </p>
                  <p className="text-[15px] font-semibold text-[var(--color-ink)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column — Warm, Elegant Counselor Profile Card */}
          <div className="lg:col-span-5">
            <div
              className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl p-8 sm:p-10 card-hover-lift shadow-sm relative overflow-hidden"
              role="complementary"
              aria-label="Profil Amelia"
            >
              {/* Top Avatar badge */}
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[var(--color-accent-bg)] border-2 border-[var(--color-accent-line)] flex items-center justify-center mb-5 shadow-inner"
                  role="img"
                  aria-label="Foto inisial Amelia"
                >
                  <span
                    className="text-4xl sm:text-5xl font-medium text-[var(--color-accent)] select-none"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    A
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-accent-bg)] text-[var(--color-accent)] text-xs font-semibold mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Konselor Sebaya Aktif
                </div>

                <h2
                  className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)] mb-1.5"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Amelia
                </h2>
                <p className="text-base text-[var(--color-ink-3)] font-medium mb-2">
                  Akrab disapa <span className="text-[var(--color-accent)] font-semibold">Amel</span>
                </p>
                <p className="text-sm text-[var(--color-ink-4)] max-w-xs leading-relaxed">
                  Jurusan Bimbingan Konseling Islam (BKI)<br />
                  Universitas Islam Negeri Siber Syekh Nurjati Cirebon
                </p>
              </div>

              {/* Gentle separator */}
              <div className="my-6 border-t border-[var(--color-line)]" />

              {/* Quick info list */}
              <ul className="space-y-3 text-sm text-[var(--color-ink-2)]" role="list">
                <li className="flex items-center justify-between">
                  <span className="text-[var(--color-ink-4)]">Domisili Layanan</span>
                  <span className="font-semibold text-[var(--color-ink)]">Cirebon & Seluruh Indonesia (Online)</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-[var(--color-ink-4)]">Durasi Sesi</span>
                  <span className="font-semibold text-[var(--color-ink)]">60 Menit / Konsultasi</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-[var(--color-ink-4)]">Kode Etik</span>
                  <span className="font-semibold text-[var(--color-accent)]">100% Kerahasiaan Terjamin</span>
                </li>
              </ul>

              {/* Bottom welcoming note */}
              <div className="mt-6 pt-4 bg-[var(--color-paper-2)] -mx-8 sm:-mx-10 -mb-8 sm:-mb-10 px-8 sm:px-10 py-4 border-t border-[var(--color-line)] text-center">
                <p className="text-xs sm:text-[13px] text-[var(--color-ink-3)] leading-relaxed">
                  Terbuka untuk keluh kesah akademik, quarter-life crisis, kecemasan, dan pencarian jati diri.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
