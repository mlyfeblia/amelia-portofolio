import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Tentang Amelia — Konselor Sebaya BKI UIN Siber Cirebon',
  description:
    'Profil lengkap Amelia (Amel), mahasiswi Bimbingan Konseling Islam di Universitas Islam Negeri Siber Syekh Nurjati Cirebon, riwayat pelatihan, dan nilai pendekatan konseling.',
};

const experiences = [
  {
    period: '2024 — Sekarang',
    role: 'Konselor Sebaya Aktif',
    org: 'UIN Siber Syekh Nurjati Cirebon',
    desc: 'Memberikan bimbingan terstruktur kepada mahasiswa dalam menghadapi transisi perkuliahan daring, tekanan tugas akhir, dan adaptasi kampus siber.',
  },
  {
    period: '2023 — 2024',
    role: 'Fasilitator Kelompok Dukungan Mental',
    org: 'Mahad Al-Jami\'ah UIN Siber Cirebon',
    desc: 'Memandu sesi diskusi kelompok seputar resiliensi spiritual, pencegahan kejenuhan akademik (burnout), dan manajemen waktu ibadah-belajar.',
  },
  {
    period: '2023',
    role: 'Riset Mandiri: Cyber Counseling',
    org: 'Jalur Studi BKI',
    desc: 'Mengkaji efektivitas konseling berbasis teks dan video dalam meningkatkan ketenangan batin generasi Z berlandaskan nilai Islam.',
  },
];

const certifications = [
  { title: 'Pelatihan Dasar Konselor Sebaya & Etika Konseling', issuer: 'Pusat Layanan Konseling UIN Siber Cirebon', year: '2023' },
  { title: 'Workshop Terapi Kognitif Islami (CBT-I)', issuer: 'Fakultas Dakwah & Komunikasi', year: '2024' },
  { title: 'Seminar Nasional Cyber Counseling Generasi Z', issuer: 'ABKIN Jawa Barat', year: '2024' },
  { title: 'Pelatihan Pertolongan Pertama Emosional (PFA)', issuer: 'Divisi BKI Mahad Al-Jami\'ah', year: '2023' },
];

export default function TentangPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-6 space-y-16">

          {/* Page Intro */}
          <section className="space-y-4 max-w-3xl">
            <h1
              className="text-3xl sm:text-4xl font-medium text-[var(--color-ink)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Tentang Amelia
            </h1>
            <p className="text-lg text-[var(--color-ink-muted)] leading-relaxed">
              Mahasiswi aktif Bimbingan Konseling Islam (BKI) di Universitas Islam Negeri Siber Syekh Nurjati Cirebon, mendedikasikan diri untuk menyediakan ruang dengar yang amanah, hangat, dan tanpa stigma.
            </p>
          </section>

          {/* Story & Philosophy */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start pt-6 border-t border-[var(--color-paper-border)]">
            <div className="md:col-span-4">
              <h2
                className="text-2xl font-medium text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Latar Belakang &amp; Nilai
              </h2>
            </div>
            <div className="md:col-span-8 space-y-5 text-[var(--color-ink-muted)] leading-relaxed">
              <p>
                Di era di mana interaksi sosial banyak berpindah ke ranah digital, tidak sedikit orang yang merasa terisolasi di tengah ramainya linimasa. Banyak yang memikul kecemasan, kebingungan arah hidup (<em>quarter-life crisis</em>), dan luka batin tanpa tahu ke mana harus bercerita dengan aman.
              </p>
              <p>
                Menempuh pendidikan di <strong className="text-[var(--color-ink)] font-semibold">UIN Siber Syekh Nurjati Cirebon</strong> memberikan saya perspektif berharga: bagaimana memanfaatkan media digital untuk menjangkau mereka yang membutuhkan pendampingan, tanpa mengurangi kedalaman rasa empati dan sentuhan manusiawi.
              </p>
              <p>
                Bagi saya, setiap konseli adalah pribadi yang utuh dan berharga. Praktik bimbingan saya berlandaskan pada penerimaan tanpa syarat (<em>unconditional positive regard</em>), memadukan ikhtiar rasional psikologi konseling dengan penyejuk kalbu melalui konsep <em>Tazkiyatun Nafs</em> (pembersihan jiwa).
              </p>

              <blockquote className="my-6 pl-5 border-l-2 border-[var(--color-accent)] italic text-[var(--color-ink)]">
                &ldquo;Tugas konselor bukanlah menghakimi masa lalu atau mendikte jalan keluar, melainkan menyalakan lentera harapan agar konseli dapat melangkah dengan tenang.&rdquo;
              </blockquote>
            </div>
          </section>

          {/* Experience Timeline */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start pt-12 border-t border-[var(--color-paper-border)]">
            <div className="md:col-span-4">
              <h2
                className="text-2xl font-medium text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Riwayat Pengalaman
              </h2>
              <p className="text-sm text-[var(--color-ink-soft)] mt-2">
                Praktik pendampingan konseling sebaya dan keterlibatan komunitas akademik.
              </p>
            </div>
            <div className="md:col-span-8">
              <div className="space-y-6">
                {experiences.map((exp, i) => (
                  <div key={i} className="p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-lg space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-[var(--color-ink)]">
                        {exp.role}
                      </h3>
                      <span className="text-xs text-[var(--color-ink-soft)] font-medium">
                        {exp.period}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[var(--color-accent)]">
                      {exp.org}
                    </p>
                    <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                      {exp.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Certifications */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start pt-12 border-t border-[var(--color-paper-border)]">
            <div className="md:col-span-4">
              <h2
                className="text-2xl font-medium text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Sertifikasi &amp; Pelatihan
              </h2>
            </div>
            <div className="md:col-span-8">
              <div className="divide-y divide-[var(--color-paper-border)] border-y border-[var(--color-paper-border)]">
                {certifications.map((cert, i) => (
                  <div key={i} className="py-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                        {cert.title}
                      </h3>
                      <p className="text-xs text-[var(--color-ink-soft)] mt-0.5">
                        {cert.issuer}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[var(--color-accent)] shrink-0">
                      {cert.year}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Action CTA */}
          <section className="p-8 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2
                className="text-xl font-medium text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Ingin berkonsultasi langsung bersama Amel?
              </h2>
              <p className="text-sm text-[var(--color-ink-muted)] mt-1">
                Pilih jadwal yang paling sesuai untuk sesi virtual maupun tatap muka.
              </p>
            </div>
            <Link href="/jadwal" className="btn-primary text-sm shrink-0">
              Jadwalkan Konsultasi
            </Link>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
