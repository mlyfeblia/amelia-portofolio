import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, MessageCircle, Heart, Lock, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getArticles, getCurhatList } from '@/lib/data-store';

export default async function Home() {
  const articles = await getArticles();
  const curhatMessages = await getCurhatList();
  const answeredCurhat = curhatMessages.filter((c) => c.isPublic && c.isAnswered).slice(0, 2);
  const featuredArticles = articles.slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)]">
      <Navbar />

      <main
        id="main-content"
        className="flex-1"
        aria-label="Beranda Portofolio Amelia BKI"
        tabIndex={-1}
      >
        {/* ── 1. Hero Section ───────────────────────────────────── */}
        <section className="py-16 sm:py-24 border-b border-[var(--color-paper-border)]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-center">

              {/* Left Column: Heading & Value Proposition */}
              <div className="md:col-span-7 space-y-6">
                <div className="space-y-4">
                  <h1
                    className="text-3xl sm:text-4xl lg:text-[2.65rem] font-medium text-[var(--color-ink)] leading-[1.2]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Ruang aman untuk cerita yang belum bisa diucapkan.
                  </h1>
                  <p className="text-base sm:text-lg text-[var(--color-ink-muted)] leading-relaxed">
                    Saya <strong className="text-[var(--color-ink)] font-semibold">Amelia (Amel)</strong> — konselor sebaya jurusan Bimbingan Konseling Islam di Universitas Islam Negeri Siber Syekh Nurjati Cirebon. Menyediakan ruang dengar hangat yang memadukan psikologi terapan dengan kearifan Islam di era digital.
                  </p>
                </div>

                {/* Primary Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    href="/jadwal"
                    className="btn-primary"
                  >
                    Jadwalkan Konsultasi
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/tentang"
                    className="btn-secondary"
                  >
                    Kenali Amel Lebih Dekat
                  </Link>
                </div>

                {/* Commitments Summary */}
                <div className="pt-6 border-t border-[var(--color-paper-border)] grid grid-cols-3 gap-4 text-xs sm:text-sm text-[var(--color-ink-muted)]">
                  <div>
                    <span className="block font-semibold text-[var(--color-ink)]">Amanah</span>
                    <span>100% Rahasia</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-[var(--color-ink)]">Fleksibel</span>
                    <span>Online &amp; Offline</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-[var(--color-ink)]">Pendekatan</span>
                    <span>CBT &amp; Tazkiyah</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Clean Profile Card */}
              <div className="md:col-span-5">
                <div className="bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl p-8 space-y-5 shadow-xs">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-medium text-2xl flex items-center justify-center shrink-0"
                      style={{ fontFamily: 'var(--font-display)' }}
                      aria-hidden="true"
                    >
                      A
                    </div>
                    <div>
                      <h2
                        className="text-xl font-medium text-[var(--color-ink)] leading-snug"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        Amelia
                      </h2>
                      <p className="text-xs text-[var(--color-ink-soft)] font-medium">
                        Konselor Sebaya · Mahasiswi BKI
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    Menempuh studi di UIN Siber Syekh Nurjati Cirebon, siap mendampingi mahasiswa dan generasi muda menghadapi kecemasan akademik, quarter-life crisis, dan pencarian jati diri.
                  </p>

                  <div className="pt-4 border-t border-[var(--color-paper-border)] flex items-center justify-between text-xs text-[var(--color-ink-soft)]">
                    <span>Wilayah: Cirebon &amp; Daring</span>
                    <span className="text-[var(--color-accent)] font-semibold">Menerima Konsultasi</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 2. Sekilas Tentang Amel (Overview Preview) ─────────── */}
        <section className="py-16 sm:py-20 border-b border-[var(--color-paper-border)] bg-[var(--color-surface)]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">

              <div className="md:col-span-5 space-y-3">
                <h2
                  className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Mendengar tanpa menghakimi, mendampingi dengan hati.
                </h2>
                <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
                  Setiap orang berhak memiliki tempat aman untuk melepaskan beban pikiran yang selama ini dipendam sendirian.
                </p>
                <div className="pt-2">
                  <Link
                    href="/tentang"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)] hover:underline"
                  >
                    Selengkapnya tentang profil Amel
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-lg space-y-1.5">
                  <Heart className="w-5 h-5 text-[var(--color-accent)]" />
                  <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                    Penerimaan Tanpa Syarat
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    Menerima seluruh cerita dan kerapuhan Anda tanpa prasangka atau penghakiman moral.
                  </p>
                </div>

                <div className="p-5 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-lg space-y-1.5">
                  <Lock className="w-5 h-5 text-[var(--color-accent)]" />
                  <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                    Kerahasiaan Terjaga
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    Identitas dan materi konseling terlindungi sepenuhnya sesuai kode etik bimbingan.
                  </p>
                </div>

                <div className="p-5 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-lg space-y-1.5">
                  <ShieldCheck className="w-5 h-5 text-[var(--color-accent)]" />
                  <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                    Integrasi Nilai Islami
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    Menghubungkan ikhtiar kognitif praktis dengan kedamaian batin melalui muhasabah.
                  </p>
                </div>

                <div className="p-5 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-lg space-y-1.5">
                  <MessageCircle className="w-5 h-5 text-[var(--color-accent)]" />
                  <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                    Akses Daring Fleksibel
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    Dapat diakses secara virtual dari mana pun Anda berada tanpa batasan jarak.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 3. Layanan & Format Konseling (Preview) ───────────── */}
        <section className="py-16 sm:py-20 border-b border-[var(--color-paper-border)]">
          <div className="max-w-5xl mx-auto px-6 space-y-8">

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2
                  className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Layanan &amp; Format Bimbingan
                </h2>
                <p className="text-sm sm:text-base text-[var(--color-ink-muted)] mt-1">
                  Pilihan sesi yang disesuaikan dengan kenyamanan interaksi Anda.
                </p>
              </div>
              <Link
                href="/layanan"
                className="text-sm font-semibold text-[var(--color-accent)] hover:underline shrink-0"
              >
                Lihat rincian layanan lengkap &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-lg space-y-3">
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

              <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-lg space-y-3">
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

              <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-lg space-y-3">
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

        {/* ── 4. Asesmen Jiwa (Callout Teaser) ───────────────────── */}
        <section className="py-16 sm:py-20 border-b border-[var(--color-paper-border)] bg-[var(--color-surface)]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="p-8 sm:p-10 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="space-y-2 max-w-xl">
                <h2
                  className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Asesmen Kesejahteraan Jiwa Mandiri
                </h2>
                <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
                  Hanya butuh 2 menit untuk melakukan refleksi batin. Kenali ritme pikiran, kestabilan emosi, dan ketenangan spiritual Anda hari ini.
                </p>
              </div>
              <Link
                href="/asesmen"
                className="btn-primary text-sm shrink-0"
              >
                Mulai Asesmen Diri
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── 5. Ruang Curhat Terbuka (Preview) ─────────────────── */}
        <section className="py-16 sm:py-20 border-b border-[var(--color-paper-border)]">
          <div className="max-w-5xl mx-auto px-6 space-y-8">

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2
                  className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Ruang Curhat Anonim
                </h2>
                <p className="text-sm sm:text-base text-[var(--color-ink-muted)] mt-1">
                  Kutipan pertanyaan dari sahabat yang telah dijawab oleh Amel secara berkala.
                </p>
              </div>
              <Link
                href="/curhat"
                className="text-sm font-semibold text-[var(--color-accent)] hover:underline shrink-0"
              >
                Kirim curhat &amp; baca semua tanggapan &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {answeredCurhat.map((item) => (
                <div
                  key={item.id}
                  className="p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--color-ink)]">{item.alias}</span>
                    <span className="text-[var(--color-accent)] font-medium">{item.category}</span>
                  </div>

                  <blockquote className="text-sm text-[var(--color-ink-muted)] italic leading-relaxed">
                    &ldquo;{item.message}&rdquo;
                  </blockquote>

                  {item.answer && (
                    <div className="pt-3 border-t border-[var(--color-paper-border)] space-y-1">
                      <span className="text-xs font-semibold text-[var(--color-accent)] block">
                        Tanggapan Amel:
                      </span>
                      <p className="text-xs sm:text-sm text-[var(--color-ink)] leading-relaxed line-clamp-3">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── 6. Artikel Pilihan (Preview) ──────────────────────── */}
        <section className="py-16 sm:py-20 border-b border-[var(--color-paper-border)] bg-[var(--color-surface)]">
          <div className="max-w-5xl mx-auto px-6 space-y-8">

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2
                  className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Tulisan &amp; Refleksi Terkini
                </h2>
                <p className="text-sm sm:text-base text-[var(--color-ink-muted)] mt-1">
                  Catatan pemikiran seputar kesehatan jiwa dan konseling Islam.
                </p>
              </div>
              <Link
                href="/artikel"
                className="text-sm font-semibold text-[var(--color-accent)] hover:underline shrink-0"
              >
                Kunjungi direktori artikel &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredArticles.map((art) => (
                <article
                  key={art.id}
                  className="p-6 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-lg space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wider">
                      {art.category}
                    </span>
                    <h3
                      className="text-lg font-medium text-[var(--color-ink)] leading-snug"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      <Link href={`/artikel/${art.slug}`} className="hover:underline">
                        {art.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed line-clamp-2">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--color-paper-border)] flex items-center justify-between text-xs text-[var(--color-ink-soft)]">
                    <span>{art.readTime}</span>
                    <Link
                      href={`/artikel/${art.slug}`}
                      className="font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
                    >
                      Baca tulisan
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
