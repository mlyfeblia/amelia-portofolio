import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  MessageCircle,
  Heart,
  Lock,
  ShieldCheck,
  Briefcase,
  Users,
  GraduationCap,
} from 'lucide-react';
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
        aria-label="Beranda Portofolio Amelia"
        tabIndex={-1}
      >
        {/* ── 1. Hero Section with Real Photo (No Eyebrow) ──────── */}
        <section className="pt-8 sm:pt-10 md:pt-12 pb-16 sm:pb-20 md:pb-24 border-b border-[var(--color-paper-border)]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 lg:gap-16 items-center">

              {/* Left Column: Heading & Value Proposition */}
              <div className="md:col-span-7 space-y-6 lg:space-y-8">
                <div className="space-y-4">
                  <h1
                    className="text-3xl sm:text-4xl lg:text-[2.85rem] font-medium text-[var(--color-ink)] leading-[1.2] tracking-tight"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Ruang Aman untuk Mendengar, Bercerita, dan Bertumbuh.
                  </h1>

                  <p className="text-base sm:text-lg lg:text-[1.125rem] text-[var(--color-ink-muted)] leading-relaxed max-w-2xl">
                    Hai, kenalkan aku <strong className="text-[var(--color-ink)] font-semibold">Amelia (Amel)</strong>, teman sebaya untuk mendengar cerita dan keluh kesahmu. Di sini kamu bisa bebas melepaskan overthinking atau curhat tanpa rasa takut dihakimi.
                  </p>
                </div>

                {/* Primary Actions */}
                <div className="flex flex-wrap items-center gap-3.5 pt-1">
                  <Link
                    href="/schedule"
                    className="btn-primary min-h-[46px] px-6 text-[15px]"
                  >
                    Jadwalkan Konsultasi
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </Link>
                  <Link
                    href="/about"
                    className="btn-secondary min-h-[46px] px-6 text-[15px]"
                  >
                    Kenali Profil Amel
                  </Link>
                </div>

                {/* Commitments Summary */}
                <div className="pt-8 border-t border-[var(--color-paper-border)] grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-xs sm:text-sm text-[var(--color-ink-muted)]">
                  <div className="p-3 sm:p-0 rounded-lg sm:rounded-none bg-[var(--color-surface)] sm:bg-transparent border sm:border-0 border-[var(--color-paper-border)]">
                    <span className="block font-semibold text-[var(--color-ink)] text-sm sm:text-base">Pengalaman 2020+</span>
                    <span>Operasional &amp; Kasir</span>
                  </div>
                  <div className="p-3 sm:p-0 rounded-lg sm:rounded-none bg-[var(--color-surface)] sm:bg-transparent border sm:border-0 border-[var(--color-paper-border)]">
                    <span className="block font-semibold text-[var(--color-ink)] text-sm sm:text-base">Kepemimpinan</span>
                    <span>Duta &amp; Fasilitator</span>
                  </div>
                  <div className="p-3 sm:p-0 rounded-lg sm:rounded-none bg-[var(--color-surface)] sm:bg-transparent border sm:border-0 border-[var(--color-paper-border)]">
                    <span className="block font-semibold text-[var(--color-ink)] text-sm sm:text-base">Konseling Sebaya</span>
                    <span>100% Rahasia &amp; Hangat</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Clean Portrait Photo */}
              <div className="md:col-span-5 flex justify-center md:justify-end">
                <div className="relative w-full max-w-[340px] aspect-[4/5] rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-sm group card-interactive">
                  <Image
                    src="/amelia.webp"
                    alt="Foto Profil Amelia, Mahasiswi Bimbingan Konseling UIN Siber Syekh Nurjati Cirebon"
                    fill
                    sizes="(max-width: 768px) 100vw, 340px"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)]/70 via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p
                      className="text-lg font-medium leading-snug"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      Amelia
                    </p>
                    <p className="text-xs text-white/80">
                      Bimbingan Konseling · UIN Siber Cirebon
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 2. Sorotan Rekam Jejak (Highlight CV Amelia) ───────── */}
        <section className="py-16 sm:py-24 border-b border-[var(--color-paper-border)] bg-[var(--color-surface)]" data-reveal>
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-10 lg:space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2
                  className="text-2xl sm:text-3xl lg:text-[2.25rem] font-medium text-[var(--color-ink)] leading-snug"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Dedikasi di Lapangan, Organisasi, dan Akademik
                </h2>
                <p className="text-sm sm:text-base text-[var(--color-ink-muted)] mt-1.5 max-w-2xl leading-relaxed">
                  Pengalaman nyata mengasah empati, ketelitian pengolahan keuangan, dan keterampilan kepemimpinan.
                </p>
              </div>
              <Link
                href="/about"
                className="text-sm font-semibold text-[var(--color-accent)] hover:underline shrink-0 inline-flex items-center gap-1"
              >
                Lihat profil lengkap di Tentang
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Card 1: Pengalaman Kerja Operasional */}
              <div className="p-6 lg:p-7 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-xl space-y-4 flex flex-col justify-between card-interactive">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--color-ink)] leading-snug">
                    Operasional Kasir &amp; Layanan Pelanggan
                  </h3>
                  <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    Pengalaman di PT Sinar Kreasi Jaya (SKY Games), Kedai SK Kupat Tahu, dan Usaha Cireng Kuah Mandiri. Terbiasa mengelola transaksi presisi, laporan kas Excel, serta pelayanan prima ratusan pelanggan.
                  </p>
                </div>
                <div className="pt-3 border-t border-[var(--color-paper-border)] text-xs text-[var(--color-ink-soft)] font-medium">
                  2020 - Sekarang · Kasir &amp; Logistik
                </div>
              </div>

              {/* Card 2: Organisasi & Konten Digital */}
              <div className="p-6 lg:p-7 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-xl space-y-4 flex flex-col justify-between card-interactive">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--color-ink)] leading-snug">
                    Duta Inspirasi &amp; Fasilitator Parlemen
                  </h3>
                  <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    Duta Inspirasi Indonesia (Media &amp; Content Creator), Fasilitator Youth Parliamentary Cirebon, Duta Inisiatif Jabar, dan Wakil Ketua Iremas Jami Al-Falah &amp; Rohis.
                  </p>
                </div>
                <div className="pt-3 border-t border-[var(--color-paper-border)] text-xs text-[var(--color-ink-soft)] font-medium">
                  Public Speaking · Content Creator · Fasilitator
                </div>
              </div>

              {/* Card 3: Pendidikan & Bimbingan Konseling */}
              <div className="p-6 lg:p-7 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-xl space-y-4 flex flex-col justify-between card-interactive">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--color-ink)] leading-snug">
                    S1 Bimbingan Konseling UIN Siber
                  </h3>
                  <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    Menempuh studi di UIN Siber Syekh Nurjati Cirebon dengan fondasi pendidikan keagamaan kuat dari MAN 4 Cirebon. Memadukan psikologi konseling dengan kehangatan nilai Islam.
                  </p>
                </div>
                <div className="pt-3 border-t border-[var(--color-paper-border)] text-xs text-[var(--color-ink-soft)] font-medium">
                  Semester 3 · Konselor Sebaya · Nilai Islami
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Nilai & Pendekatan Ruang Dengar ─────────────────── */}
        <section className="py-16 sm:py-24 border-b border-[var(--color-paper-border)]" data-reveal>
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 lg:gap-16 items-start">

              <div className="md:col-span-5 space-y-4">
                <h2
                  className="text-2xl sm:text-3xl lg:text-[2.25rem] font-medium text-[var(--color-ink)] leading-snug"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Mendengar tanpa menghakimi, mendampingi dengan hati.
                </h2>
                <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
                  Setiap orang berhak punya safe space untuk melepaskan beban pikiran yang selama ini dipendam sendirian. Kamu tidak harus memikul semuanya seorang diri.
                </p>
                <div className="pt-2">
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)] hover:underline"
                  >
                    Kenali lebih dekat sosok Amel
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div className="p-5 sm:p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-2 card-interactive">
                  <Heart className="w-5 h-5 text-[var(--color-accent)]" />
                  <h3 className="text-sm sm:text-base font-semibold text-[var(--color-ink)]">
                    Penerimaan Tanpa Syarat
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    Menerima seluruh cerita dan kerapuhan Anda tanpa prasangka atau penghakiman moral.
                  </p>
                </div>

                <div className="p-5 sm:p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-2 card-interactive">
                  <Lock className="w-5 h-5 text-[var(--color-accent)]" />
                  <h3 className="text-sm sm:text-base font-semibold text-[var(--color-ink)]">
                    Kerahasiaan Terjaga Mutlak
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    Identitas dan materi konseling terlindungi sepenuhnya sesuai kode etik bimbingan.
                  </p>
                </div>

                <div className="p-5 sm:p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-2 card-interactive">
                  <ShieldCheck className="w-5 h-5 text-[var(--color-accent)]" />
                  <h3 className="text-sm sm:text-base font-semibold text-[var(--color-ink)]">
                    Integrasi Nilai &amp; Adab
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    Menghubungkan ikhtiar kognitif praktis dengan kedamaian batin melalui muhasabah.
                  </p>
                </div>

                <div className="p-5 sm:p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-2 card-interactive">
                  <MessageCircle className="w-5 h-5 text-[var(--color-accent)]" />
                  <h3 className="text-sm sm:text-base font-semibold text-[var(--color-ink)]">
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

        {/* ── 4. Layanan & Format Konseling (Preview) ───────────── */}
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

        {/* ── 5. Asesmen Jiwa (Callout Teaser) ───────────────────── */}
        <section className="py-16 sm:py-24 border-b border-[var(--color-paper-border)]" data-reveal>
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
            <div className="p-8 sm:p-12 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-xs card-interactive">
              <div className="space-y-2.5 max-w-2xl">
                <h2
                  className="text-2xl sm:text-3xl lg:text-[2.25rem] font-medium text-[var(--color-ink)] leading-snug"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Asesmen Kesejahteraan Jiwa Mandiri
                </h2>
                <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
                  Hanya butuh dua menit untuk jeda sejenak dan merefleksikan diri. Kenali ritme pikiran, kestabilan emosi, serta tingkat burnout yang sedang kamu rasakan.
                </p>
              </div>
              <Link
                href="/assessment"
                className="btn-primary min-h-[46px] px-6 text-sm shrink-0"
              >
                Mulai Asesmen Diri
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── 6. Ruang Curhat Terbuka (Preview) ─────────────────── */}
        <section className="py-16 sm:py-24 border-b border-[var(--color-paper-border)] bg-[var(--color-surface)]" data-reveal>
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-8 lg:space-y-10">

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2
                  className="text-2xl sm:text-3xl lg:text-[2.25rem] font-medium text-[var(--color-ink)] leading-snug"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Ruang Curhat Anonim
                </h2>
                <p className="text-sm sm:text-base text-[var(--color-ink-muted)] mt-1.5">
                  Kutipan tanya jawab santai seputar kegelisahan hidup yang dijawab langsung oleh Amel.
                </p>
              </div>
              <Link
                href="/counseling"
                className="text-sm font-semibold text-[var(--color-accent)] hover:underline shrink-0 inline-flex items-center gap-1"
              >
                Kirim curhat &amp; baca semua tanggapan &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {answeredCurhat.map((item) => (
                <div
                  key={item.id}
                  className="p-6 lg:p-7 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-xl space-y-4 card-interactive"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-[var(--color-ink)]">{item.alias}</span>
                    <span className="text-[var(--color-accent)] font-medium px-2.5 py-0.5 rounded-full bg-[var(--color-accent-soft)]">{item.category}</span>
                  </div>

                  <blockquote className="text-sm sm:text-base text-[var(--color-ink-muted)] italic leading-relaxed">
                    &ldquo;{item.message}&rdquo;
                  </blockquote>

                  {item.answer && (
                    <div className="pt-3 border-t border-[var(--color-paper-border)] space-y-1.5">
                      <span className="text-xs font-semibold text-[var(--color-accent)] block uppercase tracking-wider">
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

        {/* ── 7. Artikel Pilihan (Preview) ──────────────────────── */}
        <section className="py-16 sm:py-24 border-b border-[var(--color-paper-border)]" data-reveal>
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-8 lg:space-y-10">

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2
                  className="text-2xl sm:text-3xl lg:text-[2.25rem] font-medium text-[var(--color-ink)] leading-snug"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Tulisan &amp; Refleksi Terkini
                </h2>
                <p className="text-sm sm:text-base text-[var(--color-ink-muted)] mt-1.5">
                  Kumpulan tulisan praktis seputar kesehatan mental, tips menghadapi burnout, dan mindful living.
                </p>
              </div>
              <Link
                href="/articles"
                className="text-sm font-semibold text-[var(--color-accent)] hover:underline shrink-0 inline-flex items-center gap-1"
              >
                Kunjungi direktori artikel &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {featuredArticles.map((art) => (
                <article
                  key={art.id}
                  className="p-6 lg:p-7 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-3.5 flex flex-col justify-between hover:border-[var(--color-accent-border)] transition-colors shadow-xs card-interactive"
                >
                  <div className="space-y-2.5">
                    <span className="text-xs font-medium text-[var(--color-accent)]">
                      {art.category}
                    </span>
                    <h3
                      className="text-lg sm:text-xl font-medium text-[var(--color-ink)] leading-snug"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      <Link href={`/articles/${art.slug}`} className="hover:underline">
                        {art.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed line-clamp-2">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--color-paper-border)] flex items-center justify-between text-xs sm:text-sm text-[var(--color-ink-soft)]">
                    <span>{art.readTime}</span>
                    <Link
                      href={`/articles/${art.slug}`}
                      className="font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
                    >
                      Baca tulisan
                      <ArrowUpRight className="w-4 h-4" />
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
