import React from 'react';
import { Briefcase, Users } from 'lucide-react';

const workExperiences = [
  {
    year: '2020 - Sekarang',
    role: 'Staf Operasional Multitask (Kasir, Pelayan, & Logistik)',
    org: 'Kedai SK Kupat Tahu',
    desc: 'Mengelola transaksi keuangan kedai dengan akurasi tinggi (tunai & non-tunai), menyusun laporan kas harian, melayani ratusan pelanggan harian secara ramah, dan mengantar kebutuhan operasional kedai.',
    type: 'Operasional & Kasir',
  },
  {
    year: '2023 - 2025',
    role: 'Pemilik & Pengelola Operasional',
    org: 'Usaha Kuliner Mandiri (Cireng Kuah Amelia)',
    desc: 'Merencanakan produksi mandiri, kontrol mutu bahan baku dan higienitas, pemasaran konsisten puluhan pelanggan aktif, serta distribusi pengiriman tepat waktu.',
    type: 'Wirausaha Mandiri',
  },
  {
    year: '2 Bulan',
    role: 'Kasir & Layanan Pelanggan',
    org: 'PT Sinar Kreasi Jaya (SKY Games Ciledug)',
    desc: 'Mengelola transaksi keuangan harian secara presisi, menyusun laporan operasional berkala, mengoptimalkan Microsoft Excel untuk pembukuan kasir, dan memberikan layanan prima.',
    type: 'Retail & Hiburan',
  },
];

const orgExperiences = [
  {
    year: '2025 - 2026',
    role: 'Media & Content Creator',
    org: 'Duta Inspirasi Indonesia (Batch 19)',
    desc: 'Merancang dan menyunting konten edukasi digital seputar pengembangan diri remaja serta meningkatkan interaksi audiens media sosial secara inklusif.',
  },
  {
    year: '2026',
    role: 'Fasilitator Diskusi',
    org: 'Youth Parliamentary Cirebon',
    desc: 'Memandu jalannya diskusi simulasi parlemen bagi generasi muda, menjaga dinamika kelompok tetap terstruktur dan kondusif.',
  },
  {
    year: '2025 - 2026',
    role: 'Duta Inisiatif & Fasilitator',
    org: 'Duta Inisiatif Jawa Barat (Batch 12 & 13)',
    desc: 'Menginisiasi program kerja edukasi sosial lingkungan serta memfasilitasi pelatihan bagi anggota baru di tingkat regional.',
  },
  {
    year: '2023 - Sekarang',
    role: 'Wakil Ketua Iremas & Rohis',
    org: 'Iremas Jami Al-Falah & Rohis MAN 4',
    desc: 'Memimpin koordinasi internal organisasi, merancang agenda sosial dan keagamaan, serta mengawasi kinerja divisi.',
  },
];

export default function ExperienceSection() {
  return (
    <section
      id="pengalaman"
      className="py-20 md:py-28 bg-[var(--color-surface)] border-b border-[var(--color-line)]"
      aria-labelledby="experience-heading"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <h2
            id="experience-heading"
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-medium text-[var(--color-ink)] leading-tight mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Pengalaman kerja operasional dan kepemimpinan.
          </h2>
          <p className="text-lg sm:text-xl text-[var(--color-ink-2)] leading-relaxed">
            Membangun etos kerja keras, ketelitian pelaporan keuangan, dan kecakapan interpersonal sejak 2020 melalui peran profesional dan organisasi pemuda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left Column: Pengalaman Kerja */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--color-line)]">
              <Briefcase className="w-5 h-5 text-[var(--color-accent)]" aria-hidden="true" />
              <h3 className="text-lg font-bold text-[var(--color-ink)]">
                Pengalaman Kerja &amp; Operasional
              </h3>
            </div>

            <ol className="space-y-6" aria-label="Riwayat pengalaman kerja Amelia">
              {workExperiences.map((exp, i) => (
                <li
                  key={i}
                  className="p-6 bg-[var(--color-paper)] border border-[var(--color-line)] rounded-xl card-hover-lift space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
                      {exp.type}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-[var(--color-ink-4)]">
                      {exp.year}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-[var(--color-ink)]">
                      {exp.role}
                    </h4>
                    <p className="text-sm font-semibold text-[var(--color-accent)] mt-0.5">
                      {exp.org}
                    </p>
                  </div>

                  <p className="text-sm sm:text-base text-[var(--color-ink-2)] leading-relaxed">
                    {exp.desc}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {/* Right Column: Pengalaman Organisasi & Volunteer */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--color-line)]">
              <Users className="w-5 h-5 text-[var(--color-accent)]" aria-hidden="true" />
              <h3 className="text-lg font-bold text-[var(--color-ink)]">
                Organisasi &amp; Volunteer
              </h3>
            </div>

            <ul className="space-y-4" role="list">
              {orgExperiences.map((org, i) => (
                <li
                  key={i}
                  className="p-5 bg-[var(--color-paper)] border border-[var(--color-line)] rounded-xl card-hover-lift space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-base font-semibold text-[var(--color-ink)] leading-snug">
                      {org.role}
                    </h4>
                    <span className="text-xs font-bold text-[var(--color-accent)] shrink-0 px-2 py-0.5 rounded bg-[var(--color-accent-bg)]">
                      {org.year}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[var(--color-accent)]">
                    {org.org}
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--color-ink-3)] leading-relaxed">
                    {org.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
}
