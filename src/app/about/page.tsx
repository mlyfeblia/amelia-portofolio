import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Users,
  CheckCircle2,
  ExternalLink,
  Target,
  HeartHandshake,
  FileSpreadsheet,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getGeneralWhatsAppUrl } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Tentang',
  description:
    'Profil lengkap Amelia (Amel), mahasiswi Bimbingan Konseling UIN Siber Syekh Nurjati Cirebon. Riwayat profesional pelayanan pelanggan, manajemen kasir & logistik sejak 2020, kepemimpinan organisasi pemuda, dan keahlian.',
};

const workExperiences = [
  {
    company: 'PT Sinar Kreasi Jaya (SKY Games Ciledug)',
    role: 'Kasir & Layanan Pelanggan',
    period: '2 Bulan',
    badge: 'Retail & Recreation',
    highlights: [
      'Mengelola dan menghitung transaksi keuangan harian secara presisi serta memastikan saldo kas akurat setiap tutup operasional.',
      'Menyusun laporan kas harian secara teratur dan rapi untuk manajemen toko.',
      'Mengoperasikan Microsoft Excel untuk pencatatan transaksi kasir dan pengelolaan data keuangan.',
      'Menerapkan komunikasi yang ramah dan solutif dalam menangani interaksi dengan ratusan pelanggan setiap hari.',
    ],
  },
  {
    company: 'Kedai SK Kupat Tahu',
    role: 'Staf Operasional Multitask (Kasir, Pelayan, & Logistik)',
    period: '2020 - Sekarang',
    badge: 'Operasional & Pelayanan',
    highlights: [
      'Menangani transaksi tunai dan non-tunai harian dengan tingkat akurasi tinggi dan penuh tanggung jawab.',
      'Melayani puluhan hingga ratusan pelanggan setiap hari dengan sikap sigap, sopan, dan hangat.',
      'Mengatur logistik pasokan bahan baku secara berkala demi kelancaran operasional kedai.',
      'Menyelesaikan keluhan pelanggan di lapangan dengan pendekatan yang tenang dan mencari solusi terbaik.',
    ],
  },
  {
    company: 'Usaha Kuliner Mandiri (Cireng Kuah Amelia)',
    role: 'Pemilik & Pengelola Operasional',
    period: '2023 - 2025',
    badge: 'Kewirausahaan Mandiri',
    highlights: [
      'Mengembangkan resep dan memproduksi kuliner secara higienis hingga berhasil menjangkau puluhan pelanggan setia.',
      'Menjaga standar kualitas bahan baku dan kebersihan pengemasan produk.',
      'Mengatur pengiriman pesanan langsung ke tangan konsumen tepat waktu.',
    ],
  },
];

const orgExperiences = [
  {
    org: 'Duta Inspirasi Indonesia (Batch 19)',
    role: 'Anggota Bidang Media & Content Creator',
    period: 'Desember 2025 - Februari 2026',
    highlights: [
      'Merancang dan memproduksi konten edukasi digital seputar motivasi dan kesehatan mental remaja.',
      'Membangun komunikasi publik yang interaktif dan ramah di media sosial.',
    ],
  },
  {
    org: 'Youth Parliamentary Cirebon',
    role: 'Fasilitator',
    period: 'Januari 2026',
    highlights: [
      'Memandu sesi diskusi kelompok generasi muda agar berjalan tertib, terbuka, dan menghasilkan gagasan solutif.',
    ],
  },
  {
    org: 'Duta Inisiatif Jawa Barat (Batch 12 & 13)',
    role: 'Duta Inisiatif (Batch 12) & Fasilitator (Batch 13)',
    period: 'Agustus 2025 - Januari 2026',
    highlights: [
      'Menginisiasi kegiatan edukasi sosial dan mendampingi pelatihan anggota baru tingkat regional Jawa Barat.',
    ],
  },
  {
    org: 'Ikatan Remaja Masjid (Iremas) Jami Al-Falah & Rohis',
    role: 'Wakil Ketua Iremas (2025 - Sekarang) & Wakil Ketua Rohis (2023 - 2024)',
    period: 'Januari 2023 - Sekarang',
    highlights: [
      'Memimpin koordinasi kepengurusan dan merancang agenda kebersamaan pemuda yang sarat nilai spiritual.',
    ],
  },
];

const educations = [
  {
    institution: 'UIN Siber Syekh Nurjati Cirebon',
    degree: 'S1 Bimbingan Konseling (Mahasiswi Aktif · Semester 3)',
    period: '2025 - Sekarang',
    desc: 'Mendalami konseling sebaya, psikologi perkembangan, cyber counseling, serta integrasi nilai empati Islami dalam pendampingan batin.',
  },
  {
    institution: 'MAN 4 Cirebon',
    degree: 'Jurusan Keagamaan',
    period: '2022 - 2025',
    desc: 'Memperkuat fondasi adab, nilai-nilai spiritualitas, serta kedisiplinan organisasi melalui amanah sebagai Wakil Ketua Rohis.',
  },
];

const hardSkills = [
  'Microsoft Office (Word, Excel, PowerPoint)',
  'Operasional Kasir & POS System Retail',
  'Penyusunan Rekapitulasi Kas & Keuangan',
  'Pembuatan Konten Edukasi Digital',
  'Pengelolaan Logistik & Rantai Pasok',
];

const softSkills = [
  'Komunikasi Interpersonal & Public Speaking',
  'Pelayanan Pelanggan (Customer Service) Ramah',
  'Empati Aktif & Pendengar yang Amanah',
  'Regulasi Emosi & Manajemen Tekanan',
  'Kerja Keras, Tepat Waktu, & Tanggung Jawab',
  'Kerja Sama Tim & Fasilitasi Kelompok',
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen pt-8 sm:pt-10 md:pt-12 pb-16 sm:pb-20 md:pb-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-16 lg:space-y-20">

          {/* ── 1. Hero Profile Header with WebP Photo ──────────── */}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)]/70 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 right-3 text-white text-xs">
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

          {/* ── 2. Ringkasan Cerita & Nilai ──────────────────────── */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start pt-6 border-t border-[var(--color-paper-border)]" data-reveal>
            <div className="md:col-span-4">
              <h2
                className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Cerita &amp; Prinsip Hidup
              </h2>
              <p className="text-sm text-[var(--color-ink-soft)] mt-2 leading-relaxed">
                Memadukan kerja keras di lapangan dengan kehangatan mendengar.
              </p>
            </div>
            <div className="md:col-span-8 space-y-4 text-[var(--color-ink-muted)] leading-relaxed">
              <p className="text-base sm:text-lg text-[var(--color-ink)] font-normal leading-relaxed">
                Sejak tahun 2020, aku terbiasa berinteraksi langsung dengan banyak orang melalui pekerjaan pelayanan pelanggan, kasir, dan kewirausahaan. Rutinitas ini mengajarkanku cara mendengarkan secara jeli, teliti mengelola tanggung jawab, dan tetap ramah dalam situasi yang padat.
              </p>
              <p className="text-sm sm:text-base">
                Bekal pendidikan keagamaan di MAN 4 Cirebon serta keaktifan di organisasi pemuda makin memperkuat niatku untuk berkarier di ranah bimbingan konseling. Bagiku, mendengarkan seseorang yang sedang terluka butuh kesabaran penuh dan hati yang bersih dari prasangka.
              </p>

              <blockquote className="my-5 pl-5 border-l-2 border-[var(--color-accent)] italic text-[var(--color-ink)] bg-[var(--color-paper-muted)]/50 py-3.5 px-4 rounded-r-xl">
                &ldquo;Setiap orang punya perjuangannya masing-masing. Tugasku bukan menghakimi pilihanmu, melainkan menemanimu menemukan kembali arah dan ketenangan di dalam dada.&rdquo;
              </blockquote>
            </div>
          </section>

          {/* ── 3. Pengalaman Kerja Profesional ──────────────────── */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start pt-10 border-t border-[var(--color-paper-border)]" data-reveal>
            <div className="md:col-span-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-[var(--color-accent)]" />
                <h2
                  className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Pengalaman Kerja
                </h2>
              </div>
              <p className="text-sm text-[var(--color-ink-soft)] leading-relaxed">
                Rekam jejak operasional, manajemen kasir, dan layanan pelanggan sejak 2020.
              </p>
            </div>

            <div className="md:col-span-8 space-y-6">
              {workExperiences.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-6 sm:p-7 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-3.5 shadow-xs hover:border-[var(--color-accent-border)] transition-colors card-interactive"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-[var(--color-ink)]">
                        {exp.company}
                      </h3>
                      <p className="text-sm font-medium text-[var(--color-accent)]">
                        {exp.role}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-medium">
                        {exp.badge}
                      </span>
                      <span className="text-xs text-[var(--color-ink-soft)] font-medium">
                        {exp.period}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-2 pt-2 border-t border-[var(--color-paper-border)] text-sm text-[var(--color-ink-muted)]">
                    {exp.highlights.map((item, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* ── 4. Pengalaman Organisasi & Volunteer ─────────────── */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start pt-10 border-t border-[var(--color-paper-border)]" data-reveal>
            <div className="md:col-span-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-[var(--color-accent)]" />
                <h2
                  className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Organisasi &amp; Volunteer
                </h2>
              </div>
              <p className="text-sm text-[var(--color-ink-soft)] leading-relaxed">
                Aktivitas kepemimpinan pemuda, pembuatan konten edukasi, dan fasilitator.
              </p>
            </div>

            <div className="md:col-span-8 space-y-6">
              {orgExperiences.map((org, idx) => (
                <div
                  key={idx}
                  className="p-6 sm:p-7 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-3.5 shadow-xs hover:border-[var(--color-accent-border)] transition-colors card-interactive"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-[var(--color-ink)]">
                        {org.org}
                      </h3>
                      <p className="text-sm font-medium text-[var(--color-accent)]">
                        {org.role}
                      </p>
                    </div>
                    <span className="text-xs text-[var(--color-ink-soft)] font-medium">
                      {org.period}
                    </span>
                  </div>

                  <ul className="space-y-2 pt-2 border-t border-[var(--color-paper-border)] text-sm text-[var(--color-ink-muted)]">
                    {org.highlights.map((item, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* ── 5. Riwayat Pendidikan ─────────────────────────────── */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start pt-10 border-t border-[var(--color-paper-border)]" data-reveal>
            <div className="md:col-span-4">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-5 h-5 text-[var(--color-accent)]" />
                <h2
                  className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Pendidikan
                </h2>
              </div>
              <p className="text-sm text-[var(--color-ink-soft)] leading-relaxed">
                Fondasi pendidikan keagamaan kuat dan ilmu bimbingan konseling.
              </p>
            </div>

            <div className="md:col-span-8 space-y-4">
              {educations.map((edu, idx) => (
                <div
                  key={idx}
                  className="p-6 sm:p-7 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-2.5 card-interactive"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-[var(--color-ink)]">
                      {edu.institution}
                    </h3>
                    <span className="text-xs text-[var(--color-ink-soft)] font-medium">
                      {edu.period}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[var(--color-accent)]">
                    {edu.degree}
                  </p>
                  <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    {edu.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── 6. Keahlian & Kompetensi ──────────────────────────── */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start pt-10 border-t border-[var(--color-paper-border)]" data-reveal>
            <div className="md:col-span-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-[var(--color-accent)]" />
                <h2
                  className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Keahlian &amp; Kompetensi
                </h2>
              </div>
              <p className="text-sm text-[var(--color-ink-soft)] leading-relaxed">
                Paduan keterampilan teknis operasional dan kecakapan interpersonal.
              </p>
            </div>

            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
              {/* Hard Skills */}
              <div className="p-6 sm:p-7 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-4 card-interactive">
                <div className="flex items-center gap-2 pb-2.5 border-b border-[var(--color-paper-border)]">
                  <FileSpreadsheet className="w-4 h-4 text-[var(--color-accent)]" />
                  <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider">
                    Keahlian Teknis (Hard Skills)
                  </h3>
                </div>
                <ul className="space-y-2.5 text-sm text-[var(--color-ink-muted)]">
                  {hardSkills.map((skill, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] mt-0.5 shrink-0" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Soft Skills */}
              <div className="p-6 sm:p-7 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-4 card-interactive">
                <div className="flex items-center gap-2 pb-2.5 border-b border-[var(--color-paper-border)]">
                  <HeartHandshake className="w-4 h-4 text-[var(--color-accent)]" />
                  <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider">
                    Keahlian Interpersonal (Soft Skills)
                  </h3>
                </div>
                <ul className="space-y-2.5 text-sm text-[var(--color-ink-muted)]">
                  {softSkills.map((skill, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] mt-0.5 shrink-0" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ── 7. Call to Action ─────────────────────────────────── */}
          <section className="p-8 sm:p-10 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs card-interactive" data-reveal>
            <div className="space-y-1.5 max-w-xl">
              <h2
                className="text-xl sm:text-2xl font-medium text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Ingin ngobrol atau berdiskusi dengan Amel?
              </h2>
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                Pintu selalu terbuka untuk sesi konseling sebaya, kolaborasi kegiatan kepemudaan, maupun komunikasi profesional.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <a
                href={getGeneralWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm min-h-[42px] px-5"
              >
                WhatsApp Langsung
              </a>
              <Link href="/schedule" className="btn-secondary text-sm min-h-[42px] px-5">
                Janji Temu Konseling
              </Link>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
