export interface VersionRelease {
  version: string;
  releaseDate: string;
  title: string;
  badge?: string;
  highlights: string[];
}

export const CURRENT_APP_VERSION = '1.5.0';

export const APP_CHANGELOG: VersionRelease[] = [
  {
    version: '1.5.0',
    releaseDate: '06 Oktober 2026',
    title: 'Integrasi Menyeluruh Database & API, SEO Maksimal, PWA Offline, & Desain Editorial Modern',
    badge: 'Rilis Penuh v1.5.0',
    highlights: [
      'Integrasi penuh Frontend, Backend, dan Database PostgreSQL (InsForge / Drizzle ORM) dengan pengujian otomatis 21 skenario end-to-end tanpa kendala.',
      'Optimalisasi maksimal SEO Artikel: Dynamic OpenGraph card 1200x630 (next/og), heading anchor IDs untuk Google Sitelinks, dan Schema.org Article dengan speakable voice search.',
      'Dukungan membaca artikel secara offline (NetworkFirst caching 7 hari via Service Worker Serwist) dan manifest PWA window-controls-overlay.',
      'Penguatan keamanan OWASP: Cross-Origin-Resource-Policy, Content Security Policy tanpa plugin usang, dan pelarangan pelacakan interest-cohort.',
      'Penyelarasan antarmuka Admin Konselor: toolbar filter dropdown seragam, tombol header pill rapi, dan tombol aksi kartu artikel 2 baris responsif di layar mobile.',
      'Standarisasi instrumen Asesmen Kesejahteraan Jiwa 4 Dimensi dengan riwayat lokal dan visualisasi tren skor.',
      'Batas sesi keamanan admin 30 menit dengan countdown aktif, widget interaktif, dan perlindungan autosave draf tulisan.',
    ],
  },
  {
    version: '1.4.0',
    releaseDate: '28 September 2026',
    title: 'Pelacakan Janji Temu di Perangkat & Keamanan Sesi 30 Menit',
    badge: 'Fitur Utama',
    highlights: [
      'Pelacakan status janji temu otomatis di perangkat tanpa perlu registrasi/login akun konseli (amel_device_bookings_history).',
      'Perluasan topik bimbingan konseling menjadi 8 ranah spesifik (Akademik, Keluarga, Regulasi Emosi, Karier, Spiritualitas).',
      'Sistem keamanan pengelola dengan batas sesi 30 menit, penghitung mundur aktif, dan autosave draf otomatis.',
      'Animasi transisi antartab dan navigasi halus 60fps tanpa pergeseran layout (zero layout shift).',
    ],
  },
  {
    version: '1.3.0',
    releaseDate: '20 September 2026',
    title: 'Paginasi Direktori, Kategori Baku & Optimasi SEO Google',
    badge: 'Peningkatan',
    highlights: [
      'Paginasi dan pencarian instan pada ruang curhat anonim dan direktori artikel refleksi.',
      'Penyelarasan seluruh kategori curhat & artikel menjadi 100% Bahasa Indonesia baku yang terhubung langsung ke basis data.',
      'Fleksibilitas portal admin untuk mengatur jumlah artikel dan curhat yang tampil di beranda utama.',
      'Optimasi SEO teknis dengan Schema.org JSON-LD (Person, WebApplication, BlogPosting) dan dynamic OpenGraph.',
    ],
  },
  {
    version: '1.2.0',
    releaseDate: '14 September 2026',
    title: 'Progressive Web App (PWA) Standalone & Dukungan Offline',
    badge: 'PWA',
    highlights: [
      'Dukungan pemasangan PWA standalone untuk Android, iOS Safari (Add to Home Screen), dan Desktop.',
      'Halaman cadangan mode offline (~offline) dengan panduan latihan pernapasan grounding (Tazkiyatun Nafs).',
      'Penyimpanan cache aset statis berbasis Serwist Service Worker yang resilien dan hemat kuota.',
    ],
  },
  {
    version: '1.1.0',
    releaseDate: '08 September 2026',
    title: 'Portal Admin Konselor & Arsitektur Database Relasional',
    badge: 'Keamanan',
    highlights: [
      'Portal administrasi konselor terlindungi untuk memoderasi curhat masuk dan mengelola janji temu konseling.',
      'Integrasi basis data PostgreSQL terstruktur dengan skema Drizzle ORM.',
      'Proteksi keamanan OWASP Top 10, sanitasi input XSS, dan rate limiter Upstash Redis.',
    ],
  },
  {
    version: '1.0.0',
    releaseDate: '01 September 2026',
    title: 'Rilis Perdana Portofolio & Ruang Bimbingan Digital Amelia',
    badge: 'Rilis Awal',
    highlights: [
      'Peluncuran platform resmi portofolio profesional dan ruang bimbingan konseling sebaya Amelia (BKI UIN Siber Cirebon).',
      'Desain editorial human-craft bernuansa Warm Paper (#FBF9F5) dan Forest Sage (#1A563C).',
      'Formulir reservasi janji temu privat dengan 3 format sesi (Virtual Meet, Chat Terjadwal, Tatap Muka Kampus).',
    ],
  },
];

export function getLatestRelease(): VersionRelease {
  return APP_CHANGELOG[0];
}
