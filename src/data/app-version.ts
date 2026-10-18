export interface VersionRelease {
  version: string;
  releaseDate: string;
  title: string;
  badge?: string;
  highlights: string[];
}

export const CURRENT_APP_VERSION = '2.5.0';

export const APP_CHANGELOG: VersionRelease[] = [
  {
    version: '2.5.0',
    releaseDate: '19 Oktober 2026',
    title: 'Optimasi Tampilan Kartu Reservasi Admin & Pengiriman Langsung Email via Gmail SMTP',
    badge: 'Rilis Pembaruan v2.5.0',
    highlights: [
      'Penyederhanaan tata letak kartu reservasi pengelola (/admin/bookings): penghapusan banner repetitif "Kirim Kabar" untuk visual yang lebih ringkas, hemat ruang, dan fokus pada tombol aksi utama WhatsApp & Email.',
      'Implementasi arsitektur Dual-Engine pengiriman email transaksional dengan integrasi penuh Gmail SMTP (Nodemailer) port 465 SSL berotentikasi Google App Password.',
      'Pengiriman email konfirmasi reservasi dan pembaruan jadwal kini terkirim langsung ke kotak masuk pribadi seluruh konseli tanpa batasan domain sandbox.',
      'Penyempurnaan modul telemetri dan penanganan peringatan sistem terstruktur (telemetry.warn) untuk keandalan serverless runtime.',
    ],
  },
  {
    version: '2.2.0',
    releaseDate: '19 Oktober 2026',
    title: 'Stabilitas Autentikasi Produksi, Pengiriman Email Resend & Pembaruan Instan PWA',
    badge: 'Rilis Stabilitas v2.2.0',
    highlights: [
      'Penyempurnaan autentikasi Portal Konselor Admin di produksi dengan sinkronisasi kunci sesi Edge & Node.js serta pesan diagnostik akurat.',
      'Optimalisasi pengiriman email transaksional Resend pada serverless runtime (await Promise.allSettled) beserta fallback otomatis inbox konselor.',
      'Perbaikan menyeluruh tombol "Perbarui Sekarang" pada kartu Pembaruan Baru Tersedia dengan aktivasi Service Worker instan, pembersihan cache halaman, dan umpan balik visual langsung.',
      'Integrasi otomatis Web Push Notification untuk pengelola admin dan konseli dengan dukungan penuh kunci VAPID.',
    ],
  },
  {
    version: '2.1.0',
    releaseDate: '19 Oktober 2026',
    title: 'Pematangan Sistem Menyeluruh: Sinkronisasi Multi-Tab, Aksesibilitas Modal, Antrean Offline & Keamanan API',
    badge: 'Rilis Sistem v2.1.0',
    highlights: [
      'Sinkronisasi multi-tab real-time untuk sesi pengelola admin, cache lintas halaman, dan mekanisme cross-tab mutex lock pada antrean pengiriman curhat offline.',
      'Penyempurnaan alur interaktif konseli: draf reservasi otomatis (sessionStorage), resolusi topik lintas halaman (Layanan, Asesmen, Artikel, Booking, Curhat), serta rekomendasi artikel reflektif pada hasil asesmen.',
      'Standarisasi aksesibilitas WCAG 2.1 AA: focus trap penuh (containerRef) dan isolasi scroll (.modal-scroll-body) di seluruh 12 modal aplikasi, serta perbaikan sticky context pada transisi halaman.',
      'Penguatan keamanan backend: proteksi CSRF Origin pada mutasi API, deduplikasi rate-limiter, invariant publikasi/landing page di data-store, serta 23 berkas test suite Vitest (218 pengujian) lulus 100%.',
    ],
  },
  {
    version: '2.0.0',
    releaseDate: '17 Oktober 2026',
    title: 'Rilis Akbar v2.0: Stabilitas Formulir Menyeluruh, Akses Instan Tanpa Jeda & Penyempurnaan Visual Editorial',
    badge: 'Rilis Akbar v2.0.0',
    highlights: [
      'Sistem Form Validation Error Message cerdas (FormErrorMessage) dengan penutupan otomatis 6 detik, bilah hitung mundur interaktif, jeda saat kursor diarahkan (hover-pause), dan eliminasi tuntas bug loop penutupan tombol silang.',
      'Akses instan tanpa jeda: penghapusan layar pembuka (PWA splash screen) sehingga pengguna langsung masuk seketika ke halaman tujuan saat pertama kali mengunjungi situs.',
      'Penyelarasan bingkai dan bayangan kartu potret editorial di Beranda (HeroSection) dan Halaman Tentang Saya (AboutHero) dengan border dan shadow terstandarisasi khas desain gaya kertas (paper design system).',
      'Pengujian sistem komprehensif: 18 berkas test suite Vitest (168 pengujian unit dan integrasi) lulus 100% dan verifikasi kompilasi Next.js 16.3 sukses tanpa error.',
    ],
  },
  {
    version: '1.9.0',
    releaseDate: '16 Oktober 2026',
    title: 'Higienitas Interaksi Kursor, Isolasi Gulir Ganda & Kebebasan Seleksi Teks',
    badge: 'UX & Interaktivitas',
    highlights: [
      'Standarisasi kursor kontekstual di seluruh situs: kursor teks (cursor: text) pada input dan textarea, kursor klik (cursor: pointer) pada seluruh kontrol interaktif, dan kursor dilarang (cursor: not-allowed) pada elemen nonaktif.',
      'Sistem pencegahan gulir ganda (dual-scroll prevention) dengan isolasi roda tetikus (wheel interceptor) dan overscroll-behavior: contain pada area teks dan slider horizontal.',
      'Higienitas seleksi teks: proteksi seleksi antarmuka (user-select: none) pada tombol, tab, dan navigasi untuk mencegah blok biru tak sengaja, serta kebebasan seleksi penuh (user-select: text) pada artikel bacaan dan jawaban curhat.',
      'Penataan z-index modal dan backdrop: bilah navigasi (Navbar) publik dan admin tetap berada di posisinya di bawah backdrop gelap tanpa kedipan hilang-muncul saat dialog terbuka.',
    ],
  },
  {
    version: '1.8.0',
    releaseDate: '15 Oktober 2026',
    title: 'Arsitektur Slug Internasional (SEO Global), Respon Curhat & Triage Prioritas',
    badge: 'SEO & Database',
    highlights: [
      'Migrasi seluruh 37 URL artikel dari Bahasa Indonesia ke slug Bahasa Inggris terstandarisasi SEO internasional dengan pengalihan otomatis 301 (permanent redirect) backward-compatible.',
      'Penyelesaian kurasi dan pengiriman tanggapan empati Islami (Tazkiyatun Nafs) pada seluruh 11 curhat tertunda yang tersinkronisasi langsung ke basis data.',
      'Sistem klasifikasi prioritas dan triage otomatis pada antrean janji temu dan curhat masuk di portal pengelola konselor.',
      'Integrasi tombol pasang aplikasi web interaktif di footer publik (FooterInstallButton) terhubung langsung ke status instalasi PWA dan panduan sistem.',
    ],
  },
  {
    version: '1.7.0',
    releaseDate: '12 Oktober 2026',
    title: 'Mesin Pengacakan Deterministik (PRNG), Rotasi Konten & Kurasi Draf Artikel',
    badge: 'Fitur Admin & Algoritma',
    highlights: [
      'Mesin algoritma pengacakan ter-seed (Pseudo-Random Number Generator / PRNG) untuk rotasi adil artikel terkait dan cuplikan curhat di beranda tanpa layout blink.',
      'Penataan Kotak Draf Artikel pengelola (ArticleDraftsModal) dengan fitur pencarian instan, filter kategori, dan indikator status autosave.',
      'Bilah alat penyunting teks markdown (ArticleEditorToolbar) dengan pintasan pemformatan cepat (bold, italic, kutipan, heading, list).',
      'Galeri kurasi 9 tema visual sampul artikel (ArticleCoverPicker) dengan pratinjau langsung sebelum publikasi.',
    ],
  },
  {
    version: '1.6.0',
    releaseDate: '09 Oktober 2026',
    title: 'Sistem Primitif UI, Notifikasi Web Push & Resend Email Terpadu',
    badge: 'Arsitektur & Komunikasi',
    highlights: [
      'Rilis komponen UI primitif terstandarisasi (Tabs, Textarea, Card, Modal, ConfirmDecisionModal, PaginationBar).',
      'Integrasi email transaksional Resend otomatis dengan template responsif: notifikasi konfirmasi booking konseli, pembaruan status sesi, dan peringatan instan ke konselor.',
      'Implementasi Web Push Notification server dengan modal persetujuan izin ramah privasi (NotificationPromptModal).',
      'Antrean mutasi offline (Offline Queue Sync) untuk pengiriman curhat saat koneksi internet terputus.',
    ],
  },
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
