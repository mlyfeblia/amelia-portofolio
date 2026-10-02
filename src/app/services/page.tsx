import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Layanan',
  description:
    'Layanan bimbingan konseling sebaya bersama Amelia. Pilihan sesi fleksibel via Google Meet, Chat terjadwal, dan tatap muka di Cirebon yang hangat dan rahasia.',
};

const pillars = [
  {
    num: '01',
    title: 'Ruang Dengar Tanpa Penghakiman',
    desc: 'Kamu bebas menceritakan kerapuhanmu apa adanya. Aku hadir untuk mendengar dengan utuh tanpa memberikan stigma atau tatapan menghakimi.',
  },
  {
    num: '02',
    title: 'Kombinasi Logika CBT & Nilai Hati',
    desc: 'Membedah pikiran yang membuatmu cemas dengan metode ilmiah, sekaligus menyiram batin dengan kedamaian spiritual dan rasa syukur.',
  },
  {
    num: '03',
    title: 'Amanah Kerahasiaan 100%',
    desc: 'Ceritamu aman di sini. Semua identitas dan obrolan selama sesi dijaga ketat sesuai kode etik bimbingan konseling profesional.',
  },
  {
    num: '04',
    title: 'Solusi Bertahap yang Realistis',
    desc: 'Kita tidak mencari jalan pintas yang muluk-muluk. Bersama, kita susun langkah kecil yang ramah dan nyata untuk kamu jalani hari demi hari.',
  },
];

const formats = [
  {
    title: 'Google Meet Virtual',
    dur: '60 Menit · Tatap Muka Daring',
    desc: 'Cocok buat kamu yang nyaman berdiskusi lewat tatap muka langsung dari kamar atau sudut tenang rumahmu.',
  },
  {
    title: 'Chat Terjadwal',
    dur: '60 Menit · Komunikasi Teks',
    desc: 'Pilihan pas bagi kamu yang lebih leluasa dan tenang mengekspresikan isi hati lewat ketikan kata demi kata.',
  },
  {
    title: 'Tatap Muka di Kampus',
    dur: '60 Menit · Wilayah Cirebon',
    desc: 'Pertemuan langsung di area kampus UIN Siber Cirebon bagi sahabat yang berada di domisili sekitar.',
  },
];

const steps = [
  {
    step: '1',
    title: 'Pilih Jadwal Sesi',
    desc: 'Tentukan hari, jam, dan format obrolan yang paling nyaman buat rutinitasmu.',
  },
  {
    step: '2',
    title: 'Konfirmasi WhatsApp',
    desc: 'Amel akan menghubungimu secara privat untuk memastikan detail waktu sesi konseling.',
  },
  {
    step: '3',
    title: 'Sesi Curhat Bersama',
    desc: 'Obrolan santai 60 menit untuk menumpahkan beban pikiran dan memetakan jalan keluar.',
  },
  {
    step: '4',
    title: 'Rangkuman Refleksi',
    desc: 'Dapatkan catatan kecil penyemangat dan langkah praktis yang bisa kamu bawa pulang.',
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen pt-8 sm:pt-10 md:pt-12 pb-16 sm:pb-20 md:pb-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-16 lg:space-y-20">

          {/* Intro */}
          <section className="space-y-4 max-w-3xl animate-fade-in-up">
            <h1
              className="text-3xl sm:text-4xl lg:text-[2.65rem] font-medium text-[var(--color-ink)] leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Layanan &amp; Format Konseling
            </h1>
            <p className="text-lg text-[var(--color-ink-muted)] leading-relaxed">
              Memadukan ilmu bimbingan konseling modern dengan kehangatan nilai Islam. Dirancang khusus untuk menemanimu melewati masa-masa berat dengan lebih tenang.
            </p>
          </section>

          {/* 4 Pillars */}
          <section className="space-y-8 pt-8 border-t border-[var(--color-paper-border)]" data-reveal>
            <div className="max-w-2xl">
              <h2
                className="text-2xl font-medium text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Empat Pilar Pendekatan Amel
              </h2>
              <p className="text-sm text-[var(--color-ink-muted)] mt-1">
                Prinsip utama yang selalu aku jaga dalam setiap sesi bimbingan bersama teman-teman konseli.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pillars.map((p) => (
                <div
                  key={p.num}
                  className="p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-2 card-interactive"
                >
                  <span className="text-sm font-semibold text-[var(--color-accent)] block">
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
          <section className="space-y-8 pt-12 border-t border-[var(--color-paper-border)]" data-reveal>
            <div className="max-w-2xl">
              <h2
                className="text-2xl font-medium text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Format Konsultasi yang Tersedia
              </h2>
              <p className="text-sm text-[var(--color-ink-muted)] mt-1">
                Pilih format obrolan yang paling nyaman dan sesuai dengan kesiapanmu.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {formats.map((f, i) => (
                <div
                  key={i}
                  className="p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-3 flex flex-col justify-between card-interactive"
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
                    <Link href="/schedule" className="text-xs font-semibold text-[var(--color-accent)] hover:underline">
                      Pilih format ini &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Flow of Counseling */}
          <section className="space-y-8 pt-12 border-t border-[var(--color-paper-border)]" data-reveal>
            <div className="max-w-2xl">
              <h2
                className="text-2xl font-medium text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Alur Sederhana Sesi Bimbingan
              </h2>
              <p className="text-sm text-[var(--color-ink-muted)] mt-1">
                Proses mudah dan transparan sejak awal mendaftar sampai sesi obrolan selesai.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {steps.map((s) => (
                <div key={s.step} className="p-5 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-2 card-interactive">
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
          <section className="p-8 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 card-interactive" data-reveal>
            <div className="space-y-1">
              <h2
                className="text-xl font-medium text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Jaminan Kerahasiaan Terjaga Penuh
              </h2>
              <p className="text-sm text-[var(--color-ink-muted)] max-w-xl">
                Seluruh percakapan, data pribadi, dan topik konseling dilindungi sepenuhnya sesuai kode etik Bimbingan Konseling.
              </p>
            </div>
            <Link href="/schedule" className="btn-primary text-sm shrink-0">
              Jadwalkan Sesi Sekarang
            </Link>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
