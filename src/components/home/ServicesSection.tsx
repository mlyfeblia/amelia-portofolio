import React from 'react';
import Link from 'next/link';

export function ServicesSection() {
  return (
    <section className="py-16 sm:py-24 border-b border-[var(--color-paper-border)] bg-[var(--color-surface)]" data-reveal>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-8 lg:space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2
              className="text-2xl sm:text-3xl lg:text-[2.25rem] font-medium text-[var(--color-ink)] leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Layanan &amp; Format Bimbingan
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-ink-muted)] mt-1.5">
              Pilihan format sesi yang fleksibel dan disesuaikan dengan kenyamanan hatimu.
            </p>
          </div>
          <Link
            href="/services"
            className="text-sm font-semibold text-[var(--color-accent)] hover:underline shrink-0 inline-flex items-center gap-1"
          >
            Lihat rincian layanan lengkap &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
          <div className="p-6 lg:p-7 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-xl space-y-3 card-interactive">
            <h3 className="text-base font-semibold text-[var(--color-ink)]">
              Google Meet Virtual
            </h3>
            <p className="text-xs font-semibold text-[var(--color-accent)]">
              60 Menit · Tatap Muka Daring
            </p>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
              Diskusi interaktif langsung via video conference privat dari ruang nyaman Anda.
            </p>
          </div>

          <div className="p-6 lg:p-7 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-xl space-y-3 card-interactive">
            <h3 className="text-base font-semibold text-[var(--color-ink)]">
              Chat Terjadwal
            </h3>
            <p className="text-xs font-semibold text-[var(--color-accent)]">
              60 Menit · Komunikasi Teks
            </p>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
              Percakapan mendalam via perpesanan langsung bagi yang lebih nyaman menuliskan isi hati.
            </p>
          </div>

          <div className="p-6 lg:p-7 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-xl space-y-3 card-interactive">
            <h3 className="text-base font-semibold text-[var(--color-ink)]">
              Tatap Muka Cirebon
            </h3>
            <p className="text-xs font-semibold text-[var(--color-accent)]">
              60 Menit · Langsung di Kampus
            </p>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
              Pertemuan luring di area kampus UIN Siber Syekh Nurjati Cirebon dengan kesepakatan waktu.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
