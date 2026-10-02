import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Layanan & Pendekatan Konseling — Amelia BKI',
  description:
    'Layanan bimbingan konseling Islam bersama Amelia: format sesi daring Google Meet, chat intensif, tatap muka di Cirebon, serta integrasi CBT dan Tazkiyatun Nafs.',
};

const pillars = [
  {
    num: '01',
    title: 'Tazkiyatun Nafs (Penyucian Kalbu)',
    desc: 'Membimbing konseli mengenali akar kegelisahan batin, keputusasaan, atau rasa bersalah yang berkepanjangan, lalu mengarahkannya menuju ketenteraman jiwa (thuma\'ninah) melalui tafakkur dan muhasabah yang terarah.',
  },
  {
    num: '02',
    title: 'Active Empathetic Listening',
    desc: 'Ruang aman di mana konseli bebas menumpahkan segala keluh kesah, keraguan diri, dan kelelahan mental tanpa rasa takut dihakimi, dicap buruk, atau digurui.',
  },
  {
    num: '03',
    title: 'Restrukturisasi Kognitif Islami',
    desc: 'Memadukan teknik Cognitive Behavioral Therapy (CBT) dengan prinsip husnudzon (berprasangka baik kepada Allah dan kehidupan), mengurai pola pikir otomatis yang melumpuhkan menjadi sudut pandang yang realistis dan menenangkan.',
  },
  {
    num: '04',
    title: 'Cyber Counseling Beretika',
    desc: 'Memanfaatkan keunggulan teknologi digital agar konseling dapat diakses secara fleksibel dari mana saja, dengan tetap mematuhi protokol kerahasiaan data pribadi konseli secara ketat.',
  },
];

const formats = [
  {
    title: 'Tatap Muka Virtual (Google Meet)',
    dur: '60 Menit per sesi',
    desc: 'Percakapan video interaktif dua arah. Cocok untuk Anda yang ingin berdiskusi tatap muka dari kenyamanan ruang pribadi Anda.',
  },
  {
    title: 'Konseling Teks Terjadwal',
    dur: '60 Menit per sesi',
    desc: 'Sesi bimbingan intensif melalui aplikasi perpesanan secara real-time. Cocok bagi Anda yang lebih leluasa mengekspresikan perasaan lewat tulisan.',
  },
  {
    title: 'Tatap Muka Langsung (Cirebon)',
    dur: '60 Menit per sesi',
    desc: 'Bertemu langsung di area kampus UIN Siber Syekh Nurjati Cirebon pada jadwal yang disepakati bersama.',
  },
];

const steps = [
  { step: '1', title: 'Pilih Jadwal & Format', desc: 'Isi formulir reservasi dengan memilih waktu yang paling tenang bagi Anda.' },
  { step: '2', title: 'Konfirmasi WhatsApp', desc: 'Amel akan menghubungi Anda dalam 1x24 jam untuk verifikasi jadwal dan mengirim tautan sesi.' },
  { step: '3', title: 'Sesi Konseling 60 Menit', desc: 'Sesi privat yang difokuskan untuk mendengarkan, membedah masalah, dan merumuskan langkah penanganan.' },
  { step: '4', title: 'Rangkuman & Refleksi', desc: 'Konseli memperoleh ringkasan poin muhasabah serta tindak lanjut praktis untuk dipraktikkan.' },
];

export default function LayananPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-6 space-y-16">

          {/* Intro */}
          <section className="space-y-4 max-w-3xl">
            <h1
              className="text-3xl sm:text-4xl font-medium text-[var(--color-ink)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Layanan &amp; Pendekatan Konseling
            </h1>
            <p className="text-lg text-[var(--color-ink-muted)] leading-relaxed">
              Memadukan standar keilmuan bimbingan konseling modern dengan kearifan nilai spiritual Islam, dirancang untuk mendampingi Anda melintasi masa-masa sulit dengan tenang.
            </p>
          </section>

          {/* 4 Pillars */}
          <section className="space-y-8 pt-8 border-t border-[var(--color-paper-border)]">
            <div className="max-w-2xl">
              <h2
                className="text-2xl font-medium text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Empat Pilar Pendekatan
              </h2>
              <p className="text-sm text-[var(--color-ink-muted)] mt-1">
                Landasan metodologi yang digunakan dalam setiap sesi bimbingan bersama Amel.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pillars.map((p) => (
                <div
                  key={p.num}
                  className="p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-lg space-y-2"
                >
                  <span
                    className="text-sm font-semibold text-[var(--color-accent)] block"
                  >
                    Pilar {p.num}
                  </span>
                  <h3 className="text-lg font-semibold text-[var(--color-ink)]">
                    {p.title}
                  </h3>
                  <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Formats */}
          <section className="space-y-8 pt-12 border-t border-[var(--color-paper-border)]">
            <div className="max-w-2xl">
              <h2
                className="text-2xl font-medium text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Format Konsultasi yang Tersedia
              </h2>
              <p className="text-sm text-[var(--color-ink-muted)] mt-1">
                Tersedia pilihan sesi yang fleksibel sesuai kenyamanan dan kebutuhan Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {formats.map((f, i) => (
                <div
                  key={i}
                  className="p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-lg space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-base font-semibold text-[var(--color-ink)]">
                      {f.title}
                    </h3>
                    <p className="text-xs font-semibold text-[var(--color-accent)] mt-1">
                      {f.dur}
                    </p>
                    <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mt-2">
                      {f.desc}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[var(--color-paper-border)]">
                    <Link href="/jadwal" className="text-xs font-semibold text-[var(--color-accent)] hover:underline">
                      Pilih format ini &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Flow of Counseling */}
          <section className="space-y-8 pt-12 border-t border-[var(--color-paper-border)]">
            <div className="max-w-2xl">
              <h2
                className="text-2xl font-medium text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Alur Sesi Bimbingan
              </h2>
              <p className="text-sm text-[var(--color-ink-muted)] mt-1">
                Proses sederhana dan transparan sejak pendaftaran hingga sesi selesai.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {steps.map((s) => (
                <div key={s.step} className="p-5 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-lg space-y-2">
                  <span
                    className="w-7 h-7 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-semibold text-xs flex items-center justify-center"
                    aria-hidden="true"
                  >
                    {s.step}
                  </span>
                  <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                    {s.title}
                  </h3>
                  <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Ethical Commitment & CTA */}
          <section className="p-8 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2
                className="text-xl font-medium text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Jaminan Kerahasiaan Terjaga Penuh
              </h2>
              <p className="text-sm text-[var(--color-ink-muted)] max-w-xl">
                Seluruh percakapan, data pribadi, dan topik konseling dilindungi sesuai kode etik Bimbingan Konseling Islam.
              </p>
            </div>
            <Link href="/jadwal" className="btn-primary text-sm shrink-0">
              Jadwalkan Sesi Sekarang
            </Link>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
