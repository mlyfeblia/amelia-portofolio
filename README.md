# 🌿 Amelia (Amel) : Portofolio & Ruang Bimbingan Digital `v2.0.0`

[![Production Status](https://img.shields.io/badge/Production-Live%20v2.0.0-1A563C?style=for-the-badge&logo=vercel&logoColor=white)](https://mlyfeblia.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle%20ORM-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://orm.drizzle.team/)
[![PWA](https://img.shields.io/badge/PWA-Serwist%20Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://serwist.pages.dev/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey?style=for-the-badge)](LICENSE)

> *"Ruang aman untuk cerita yang belum sempat diucapkan, tempat hati berlabuh dalam Thuma'ninah."* 🕊️

Selamat datang di repositori resmi **Amelia (Amel) : Versi 2.0.0**, platform portofolio profesional dan ruang bimbingan konseling digital dari mahasiswi Bimbingan Konseling Islam (BKI) **Universitas Islam Negeri Siber Syekh Nurjati Cirebon (UINSSC)**.

Platform ini mengintegrasikan profil profesional praktisi layanan pelanggan (berpengalaman sejak 2020), ruang konseling sebaya (*cyber counseling*), ruang curhat anonim yang aman, asesmen mandiri kesehatan jiwa 4 dimensi, serta artikel reflektif berbasis pendekatan psikologi Islam (*Tazkiyatun Nafs*).

---

## 🌟 Pilar Desain & Standar Rekayasa (Anti-AI-Slop)

Platform ini dibangun dengan prinsip keaslian (*human craft*) dan disiplin estetika tanpa kompromi:
- **Palet Warna Organik Bernuansa Teduh:** Menggunakan token warna `Warm Paper` (`#FBF9F5`), `Forest Sage` (`#1A563C`), dan `Reading Ink` (`#192820`) yang menenangkan mata saat membaca lama.
- **Tipografi Berdisiplin Tinggi:** Pasangan elegan *Newsreader* (serif untuk headline berwibawa) dan *Plus Jakarta Sans* (sans-serif ramah untuk keterbacaan teks panjang).
- **Zero-Flicker & Micro-Interactions 60fps:** Seluruh transisi, modal terpusat, dropdown, dan animasi scroll menggunakan composited transforms hardware-accelerated tanpa lonjakan layout (*zero Cumulative Layout Shift*).
- **Kebersihan Interaksi Teks:** Teks artikel, kode reservasi, dan materi bacaan dapat disalin bebas (`select-text`), sedangkan elemen antarmuka tombol dan navigasi terlindungi dari ketidaksengajaan seleksi blok (`select-none`).
- **Aksesibilitas Universal (WCAG 2.1 AA):** Skip to content link, indikator fokus keyboard berstandar tinggi, semantik ARIA lengkap, dan dukungan ketat `prefers-reduced-motion`.

---

## ✨ Fitur Utama Versi 2.0.0

### 📱 1. Progressive Web App (PWA) Resilien & Offline Article Reading
- **Offline Article Reading:** Artikel yang pernah dibuka tersimpan otomatis dengan strategi Service Worker `NetworkFirst` (retensi 7 hari) via [Serwist](https://serwist.pages.dev/), sehingga tetap dapat dibaca tanpa sambungan internet.
- **Sistem Pembaruan Terotomasi (v2.0.0):** Pengecekan versi periodik, banner notifikasi changelog terpusat, dan modal catatan pembaruan transparan (*frosted glass*).
- **Fallback Offline Interaktif ([`src/app/~offline/page.tsx`](src/app/~offline/page.tsx)):** Menyediakan panduan latihan pernapasan grounding (*Tazkiyatun Nafs*), tombol muat ulang, dan akses darurat saat koneksi internet terputus.
- **Standar Display Modern:** Mendukung `window-controls-overlay`, `standalone`, serta modal petunjuk visual khusus untuk pengguna Safari iOS (*Add to Home Screen*).

### 🗓️ 2. Reservasi Jadwal & Pelacakan Status di Perangkat
- **Pelacakan Status Janji Temu di Perangkat:** Konseli dapat memantau status janji temu langsung di perangkat tanpa perlu registrasi/login akun (`amel_device_bookings_history`).
- **Tiga Format Sesi Fleksibel:** *Google Meet Virtual*, *Chat Terjadwal*, dan *Tatap Muka di Lingkungan Kampus UIN Siber Cirebon*.
- **Alur Mandiri & Validasi Berlapis:** Validasi nomor WhatsApp (9-15 digit), format email, 13 kategori bimbingan konseling spesifik, dan tiket reservasi instan ber-QR code.

### 💌 3. Ruang Curhat Anonim (Dinding Interaktif)
- **100% Rahasia & Aman:** Konseli dapat mencurahkan isi hati dan beban pikiran akademik maupun emosional tanpa mempublikasikan identitas pribadi.
- **Paginasi & Kategori Baku:** Penataan dinding cerita berbasis filter topik 100% Bahasa Indonesia baku.
- **Tanggapan Konselor Sebaya:** Jawaban reflektif dan suportif dari Amelia dipublikasikan ke dinding curhat publik setelah melalui proses kurasi.

### 🪞 4. Asesmen Kesejahteraan Jiwa Holistik 4 Dimensi
- **Instrumen Psikologis BKI Terstandarisasi:** Pertanyaan terstruktur yang menakar *Ritme Pikiran/Kognitif*, *Resiliensi Emosi*, *Kedamaian Batin (Thuma'ninah)*, dan *Relasi Sosial/Boundaries*.
- **Evaluasi Multi-Dimensi & Visual Bar:** Klasifikasi fase (*Nafs Muthma'innah*, *Nafs Lawwamah*, atau *Fase Pendampingan Empatis Segera*) dilengkapi rekomendasi terarah dan tombol salin hasil.
- **Riwayat di Perangkat:** Hasil evaluasi tersimpan lokal di browser (`amel_device_assessment_history`) dengan perbandingan tren skor antar sesi tanpa login.

### 📖 5. Artikel & Kajian Reflektif BKI (SEO Maksimal)
- **Dynamic OpenGraph Image Generation (`next/og`):** Setiap artikel memiliki kartu sosial dinamis beresolusi tinggi (1200x630 px) yang otomatis muncul saat dibagikan ke WhatsApp, Twitter/X, LinkedIn, atau Telegram.
- **Heading Anchor IDs (Google Sitelinks):** Sub-bab `<h2>` dan `<h3>` dilengkapi ID ter-slugifikasi untuk mendukung tautan fragmen langsung dan deep sitelinks di hasil pencarian Google.
- **Schema.org Article Terstruktur:** Mendukung Google Voice Search & Assistant melalui `speakable` specification, durasi baca ISO 8601 (`timeRequired`), status akses gratis (`isAccessibleForFree: true`), serta metadata penulis lengkap.

### 🔐 6. Portal Administrasi Konselor
- **Toolbar Filter Dropdown Terpadu:** Seluruh halaman admin (`/admin/bookings`, `/admin/counseling`, `/admin/articles`) menggunakan dropdown grid responsif dengan pemilih tanggal dinamis otomatis dan pill header rapi.
- **Kartu Artikel Responsif:** Tombol aksi pada kartu artikel tertata dalam 2 baris penuh rapi di layar ponsel dan 1 baris kompak di layar desktop.
- **Batas Sesi Keamanan 30 Menit & Autosave:** Dilengkapi widget countdown interaktif, dialog modal perpanjangan sesi instan, dan perlindungan draf otomatis di browser.

---

## ⚡ Optimalisasi Performa & SEO

### 🚀 Metrik Kinerja (Core Web Vitals)
- **Largest Contentful Paint (LCP):** Gambar profil pahlawan dioptimasi ke WebP/AVIF dengan atribut `priority` dan `sizes` responsif untuk pemuatan sub-detik.
- **Cumulative Layout Shift (CLS):** `0.000` : Dimensi elemen gambar dan font swap terkunci presisi tanpa pergeseran layout.
- **First Input Delay / INP:** Interaksi instan didukung oleh React 19 concurrent features dan bundle JavaScript modular.

### 🔍 Search Engine Optimization (SEO) Terpadu
- **Dynamic Metadata & Canonical URL:** Setiap halaman dilengkapi judul unik, deskripsi kontekstual, dan tautan kanonikal resmi ke domain produksi.
- **OpenGraph & Twitter Card Dinamis:** Pratinjau visual kaya (*rich snippet previews*) yang digenerate otomatis menggunakan edge-ready `ImageResponse` dari `next/og`.
- **JSON-LD Schema.org Berstandar:**
  - `Person` (Profil Amelia, afiliasi UIN Siber Cirebon, kompetensi konseling)
  - `WebSite` (Pencarian artikel terindeks via SearchAction)
  - `ProfessionalService` (Layanan bimbingan konseling)
  - `WebApplication` (Asesmen mandiri & PWA)
  - `Article` (Metadata artikel, penulis, `speakable`, `timeRequired`)
  - `BreadcrumbList` (Hierarki navigasi di setiap sub-halaman)
- **Sitemap Dinamis & Robots:** Berkas [`sitemap.xml`](src/app/sitemap.ts) yang mengindeks artikel aktif dan gambar OG dinamis secara otomatis serta [`robots.txt`](src/app/robots.ts) yang memblokir crawler dari area privat admin/API.

---

## 🛡️ Standar Keamanan (OWASP Top 10 Hardened)

1. **Proteksi Cross-Site Scripting (XSS):**
   Renderer markdown artikel menggunakan sanitasi ketat untuk skema URL (`http:`, `https:`, `mailto:`, `tel:`), memblokir injeksi berbasis `javascript:`, `data:`, atau `vbscript:`.
2. **HTTP Security Headers Lengkap:**
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (HSTS)
   - `X-Frame-Options: SAMEORIGIN` (Pencegahan Clickjacking)
   - `X-Content-Type-Options: nosniff` (Pencegahan MIME-sniffing)
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()`
   - `Cross-Origin-Resource-Policy: same-origin` (CORP)
   - `Content-Security-Policy`: Diperketat dengan `object-src 'none'` dan `upgrade-insecure-requests`.
3. **Pembatasan Frekuensi Akses (Rate Limiting) & Honeypot:**
   Pencegahan serangan brute force formulir publik menggunakan distributed sliding-window limiter dan server-side honeypot bot trap.
4. **Proteksi Sesi Konselor:**
   Cookie sesi menggunakan tanda tangan HMAC SHA-256, `HttpOnly`, `SameSite=Lax`, dan `Secure` dengan timing-safe PIN comparison.
5. **Privasi Data Konseli:**
   Endpoint publik pelacakan janji temu secara ketat menyaring nomor WhatsApp dan email agar tidak dapat diakses pihak luar.

---

## 🛠️ Stack Teknologi & Arsitektur

| Kategori | Teknologi | Peran / Deskripsi |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) | React Server Components (RSC), Dynamic Metadata, Route Handlers, ISR |
| **Library UI** | [React 19](https://react.dev/) | `react: 19.3.0`, `useSyncExternalStore`, concurrent hydration |
| **PWA Engine** | [Serwist](https://serwist.pages.dev/) (`@serwist/next`) | Service Worker bundler, precache, offline article caching |
| **Bahasa** | [TypeScript 5](https://www.typescriptlang.org/) | Type-safety menyeluruh dari skema DB hingga antarmuka UI |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (InsForge BaaS) | Penyimpanan data relasional persisten |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) | Type-safe queries, skema terstruktur, dan Drizzle Kit |
| **Rate Limiter** | [Upstash Redis](https://upstash.com/) | Sliding-window limiter untuk rute form publik |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Utilitas styling modern dengan token CSS native |
| **Ikonografi** | [Lucide React](https://lucide.dev/) | Ikon antarmuka bersih & terstandarisasi |
| **Kompresi Aset** | [Sharp](https://sharp.pixelplumbing.com/) | Konversi & optimasi gambar WebP/AVIF |
| **Hosting & CDN**| [Vercel](https://vercel.com/) | Edge network global, HTTPS otomatis, zero-downtime deploys |

---

## 🗂️ Struktur Direktori Proyek

```text
amelia-portofolio/
├── public/
│   ├── icons/                  # Icon PWA (192px, 512px, standar & maskable)
│   ├── amelia.webp             # Foto potret profil teroptimasi WebP
│   ├── apple-icon.png          # Touch icon iOS Safari (180x180)
│   ├── manifest.json           # Salinan statis Web App Manifest
│   └── sw.js                   # Service Worker produksi terkompilasi
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── ~offline/           # Fallback PWA saat jaringan terputus
│   │   ├── about/              # Profil lengkap, perjalanan, dan riwayat kerja
│   │   ├── admin/              # Portal Manajemen Konselor
│   │   │   ├── articles/       # Manajemen artikel refleksi
│   │   │   ├── bookings/       # Manajemen janji temu konseling
│   │   │   └── counseling/     # Manajemen ruang curhat anonim
│   │   ├── api/                # Endpoint API (Admin, Bookings, Curhat, Articles)
│   │   ├── articles/           # Koleksi artikel & rute dinamis [slug]
│   │   │   └── [slug]/         # Detail artikel & generator opengraph-image
│   │   ├── assessment/         # Asesmen reflektif kesejahteraan jiwa
│   │   ├── counseling/         # Ruang curhat anonim & dinding interaktif
│   │   ├── schedule/           # Formulir reservasi janji temu konseling
│   │   ├── services/           # Format layanan & tahapan alur bimbingan
│   │   ├── opengraph-image.tsx # Generator Dynamic OG Card default
│   │   ├── error.tsx           # Route Error Boundary
│   │   ├── global-error.tsx    # Root Layout Fatal Error Boundary
│   │   ├── not-found.tsx       # Empathetic Custom 404 Page
│   │   ├── layout.tsx          # Root Layout, injection font, & JSON-LD
│   │   ├── manifest.ts         # Dynamic Web App Manifest
│   │   ├── robots.ts           # Konfigurasi perayapan mesin pencari
│   │   └── sitemap.ts          # Generator sitemap XML otomatis
│   ├── components/
│   │   ├── about/              # Komponen modular halaman Tentang
│   │   ├── admin/              # Antarmuka dashboard admin konselor
│   │   ├── articles/           # Card artikel, renderer markdown aman
│   │   ├── booking/            # Wizard form reservasi konseling
│   │   ├── counseling/         # Form input & kartu dinding curhat
│   │   ├── home/               # Hero, Track Record, Layanan, & Showcase
│   │   ├── pwa/                # Komponen siklus hidup PWA & aksi offline
│   │   ├── Navbar.tsx          # Navigasi utama dengan ikon terstandarisasi
│   │   └── Footer.tsx          # Footer informatif, tautan & kontak resmi
│   ├── db/
│   │   ├── index.ts            # Inisialisasi koneksi Drizzle ORM
│   │   └── schema.ts           # Skema tabel PostgreSQL
│   ├── lib/
│   │   ├── data-store.ts       # Lapisan akses data (PostgreSQL + Mock Fallback)
│   │   ├── admin-auth.ts       # Logika autentikasi admin & HMAC cookie
│   │   ├── pwa-store.ts        # Store state reaktif PWA (Install & status)
│   │   ├── rate-limiter.ts     # Integrasi Upstash Redis Rate Limiting
│   │   ├── validators.ts       # Sanitasi input & validasi ketat
│   │   └── whatsapp.ts         # Generator tautan WhatsApp otomatis
│   └── sw.ts                   # Sumber Service Worker Serwist
├── scripts/
│   ├── e2e-api-integration.mjs # Uji integrasi 21 langkah end-to-end
│   ├── verify-db-deep.mjs      # Audit kolom tabel & uji CRUD database
│   └── seed.mjs                # Pengisian sampel awal database
├── next.config.ts              # Konfigurasi Next.js, Serwist, & Security Headers
├── tsconfig.json               # Konfigurasi compiler TypeScript
└── package.json                # Rincian dependensi & skrip proyek v1.5.0
```

---

## 🚀 Panduan Memulai di Komputer Lokal

### 1. Kloning Repositori
```bash
git clone https://github.com/mlyfeblia/amelia-portofolio.git
cd amelia-portofolio
```

### 2. Pasang Dependensi
```bash
pnpm install
```

### 3. Konfigurasi Lingkungan (`.env.local`)
Salin file `.env.example` ke `.env.local` dan lengkapi kredensial:
```env
# Database PostgreSQL / InsForge
DATABASE_URL="postgresql://postgres:password@host:5432/insforge?sslmode=require"
NEXT_PUBLIC_INSFORGE_URL="https://your-project.insforge.app"
NEXT_PUBLIC_INSFORGE_ANON_KEY="your-anon-key"
INSFORGE_API_KEY="your-api-key"

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Autentikasi Admin
ADMIN_PIN="160523"
ADMIN_AUTH_SECRET="rahasia-token-jwt-minimal-32-karakter"

# Metadata Situs
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
GOOGLE_SITE_VERIFICATION="kode-verifikasi-google"
```

### 4. Sinkronisasi & Verifikasi Database
```bash
# Verifikasi konektivitas dan audit skema tabel
pnpm run db:verify

# Mendorong perubahan skema Drizzle ke PostgreSQL (jika diperlukan)
pnpm run db:push

# Mengisi data sampel awal
pnpm run db:seed
```

### 5. Jalankan Server Development
```bash
pnpm dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

### 6. Pengujian Integrasi End-to-End & Build Produksi
```bash
# Membangun bundel produksi
pnpm build

# Menjalankan server produksi
pnpm start

# Menjalankan 21 pengujian integrasi otomatis
pnpm run test:integration
```

---

## 📋 Daftar Perintah (Scripts)

| Perintah | Deskripsi |
| :--- | :--- |
| `pnpm dev` | Menjalankan server pengembangan lokal dengan Next.js |
| `pnpm build` | Membangun bundel produksi Next.js dengan kompilasi Service Worker Serwist |
| `pnpm start` | Menjalankan aplikasi hasil build produksi di server lokal |
| `pnpm lint` | Memeriksa kepatuhan kode dan linting ESLint |
| `pnpm db:verify` | Mengaudit kolom database dan memverifikasi siklus CRUD PostgreSQL |
| `pnpm test:integration`| Menjalankan pengujian integrasi 21 langkah end-to-end API & Halaman |
| `pnpm db:push` | Mendorong perubahan skema Drizzle langsung ke basis data PostgreSQL |
| `pnpm db:generate` | Menghasilkan berkas migrasi SQL baru |
| `pnpm db:studio` | Membuka antarmuka visual Drizzle Studio di peramban |
| `pnpm db:seed` | Mengisi data sampel awal ke database |

---

## 📜 Catatan Pembaruan Aplikasi (Changelog)

### [2.0.0] - 17 Oktober 2026
> **Rilis Akbar v2.0: Stabilitas Formulir Menyeluruh, Akses Instan Tanpa Jeda & Penyempurnaan Visual Editorial**
- **Validasi Formulir Interaktif & Efisien:** Implementasi komponen FormErrorMessage cerdas dengan penutupan otomatis 6 detik, visual bar hitung mundur, pause on hover, dan eliminasi tuntas bug loop penutupan tombol silang manual.
- **Akses Instan Tanpa Jeda:** PWA splash screen dinonaktifkan sehingga pengguna langsung mengakses konten tanpa layar pembuka perantara saat pertama kali membuka situs.
- **Penyelarasan Desain Editorial:** Pembaharuan bingkai foto kartu dan bayangan (border dan shadow) pada HeroSection dan Halaman Tentang Saya (AboutHero) dengan aksen paper design system yang elegan dan terarah.
- **Pengujian Komprehensif:** 18 test suite Vitest (168 unit & integration tests) lulus 100% dan verifikasi build Next.js 16.3 tanpa catatan peringatan.

### [1.9.0] - 16 Oktober 2026
> **Higienitas Interaksi Kursor, Isolasi Gulir Ganda & Kebebasan Seleksi Teks**
- **Standarisasi Kursor Kontekstual:** Penerapan `cursor: text` pada input dan textarea, `cursor: pointer` pada semua kontrol interaktif, dan `cursor: not-allowed` pada elemen disabled di seluruh antarmuka.
- **Isolasi Gulir Ganda:** Interceptor event roda tetikus (wheel) dan aturan `overscroll-behavior: contain` pada textarea serta kontainer geser horizontal untuk mencegah scroll jumping pada kontainer utama.
- **Higienitas Seleksi Teks:** Penerapan `user-select: none` pada elemen kontrol interaktif (tombol, tab, navigasi) untuk mencegah blok seleksi biru yang tidak disengaja, serta jaminan `user-select: text` penuh pada seluruh konten artikel dan respons curhat.
- **Stabilitas Layering Modal & Navigasi:** Perbaikan z-index pada modal backdrop sehingga Navbar publik dan admin tetap stabil di bawah backdrop gelap tanpa efek kedip atau hilang-muncul.

### [1.8.0] - 15 Oktober 2026
> **Arsitektur Slug Internasional (SEO Global), Respon Curhat & Triage Prioritas**
- **Migrasi Slug Artikel Global:** Standarisasi 37 slug artikel ke format Bahasa Inggris ramah SEO internasional dengan pengalihan otomatis 301 (permanent redirect) backward-compatible untuk menjaga backlink dan bookmark.
- **Sinkronisasi Respons Curhat:** Kurasi dan publikasi tanggapan empati Islami (Tazkiyatun Nafs) untuk 11 curhat tertunda yang tersinkronisasi penuh ke basis data PostgreSQL.
- **Triage Prioritas Admin:** Klasifikasi prioritas otomatis pada reservasi janji temu dan antrean curhat masuk di portal konselor.
- **Tombol Pasang PWA Footer:** Penambahan tombol instalasi interaktif di footer publik dengan panduan sistem operasi (Android, iOS Safari, Desktop).

### [1.7.0] - 12 Oktober 2026
> **Mesin Pengacakan Deterministik (PRNG), Rotasi Konten & Kurasi Draf Artikel**
- **Rotasi Konten Deterministik:** Implementasi algoritma PRNG (Pseudo-Random Number Generator) ter-seed untuk rotasi adil artikel terkait dan cuplikan curhat di beranda tanpa layout blink.
- **Modal Draf Artikel:** Penambahan antarmuka ArticleDraftsModal untuk mengelola draf tulisan konselor dengan pencarian instan, filter kategori, dan status penyimpanan lokal.
- **Bilah Alat Penyunting Markdown:** Penyediaan toolbar pemformatan cepat (bold, italic, kutipan, heading, list) untuk mempermudah penulisan artikel reflektif konselor.
- **Galeri Sampul Kurasi:** Pemilih sampul visual 9 tema terkurasi (ArticleCoverPicker) dengan pratinjau langsung sebelum artikel diterbitkan.

### [1.6.0] - 09 Oktober 2026
> **Sistem Primitif UI, Notifikasi Web Push & Resend Email Terpadu**
- **Standarisasi Komponen Primitif:** Rilis fondasi antarmuka modular (Tabs, Textarea, Card, Modal, ConfirmDecisionModal, PaginationBar).
- **Email Transaksional Terpadu:** Integrasi Resend email dengan template responsif untuk konfirmasi reservasi sesi konseling, pembaruan status, dan notifikasi konselor.
- **Server Notifikasi Web Push:** Dukungan pengiriman Web Push Notification dengan modal persetujuan izin ramah privasi (NotificationPromptModal).
- **Sinkronisasi Mutasi Offline:** Antrean mutasi lokal (Offline Queue) untuk pengiriman curhat yang otomatis disinkronkan saat koneksi internet kembali pulih.

### [1.5.0] - 06 Oktober 2026
> **Integrasi Menyeluruh Database & API, SEO Maksimal, PWA Offline, & Desain Editorial Modern**
- **Integrasi Penuh Database:** Sinkronisasi menyeluruh antara Frontend, Backend API, dan PostgreSQL (InsForge BaaS) via Drizzle ORM dengan verifikasi otomatis (`pnpm run db:verify`).
- **Uji Integrasi End-to-End 21 Skenario:** Ditambahkan skrip uji otomatis (`pnpm run test:integration`) yang memvalidasi prerender halaman publik, sanitasi privasi konseli, proteksi 401 unauthenticated, alur login PIN HMAC, dan operasi CRUD live.
- **Dynamic OpenGraph Cards (`next/og`):** Pembuatan otomatis kartu pratinjau sosial beresolusi tinggi (1200x630 px) untuk setiap artikel di `/articles/[slug]/opengraph-image` dan beranda utama di `/opengraph-image`.
- **Optimalisasi SEO Artikel:** Tag heading `<h2>` dan `<h3>` dilengkapi anchor ID slug otomatis untuk Google Sitelinks, Schema.org `Article` ditingkatkan dengan `speakable` specification untuk voice search, durasi baca ISO 8601 (`timeRequired`), dan sitemap gambar diperbarui.
- **PWA Offline Article Reading:** Penambahan caching `NetworkFirst` (retensi 7 hari) di Service Worker Serwist agar artikel yang pernah dikunjungi dapat dibaca saat offline tanpa koneksi internet.
- **Penguatan Keamanan Web:** Penerapan `Cross-Origin-Resource-Policy: same-origin`, pengetatan `Content-Security-Policy` (`object-src 'none'`, `upgrade-insecure-requests`), dan pelarangan pelacakan `interest-cohort`.
- **Penyelarasan Toolbar Admin:** Penyeragaman seluruh filter admin di `/admin/bookings`, `/admin/counseling`, dan `/admin/articles` menggunakan dropdown `<select>` responsif, tombol pill "Semua (count)" yang rapi di layar ponsel, dan tombol aksi kartu artikel 2 baris penuh di mobile.
- **Penyempurnaan Navigasi Mobile:** Eliminasi scroll jitter pada navbar mobile menggunakan lapisan GPU composite hardware-accelerated.

### [1.4.0] - 28 September 2026
> **Pelacakan Janji Temu di Perangkat & Keamanan Sesi 30 Menit**
- Pelacakan status janji temu otomatis di perangkat tanpa perlu registrasi/login akun konseli (`amel_device_bookings_history`).
- Perluasan topik bimbingan konseling menjadi 13 ranah spesifik.
- Sistem keamanan pengelola dengan batas sesi 30 menit, penghitung mundur aktif, dan autosave draf otomatis.
- Animasi transisi antartab dan navigasi halus 60fps tanpa pergeseran layout (*zero layout shift*).

### [1.3.0] - 20 September 2026
> **Paginasi Direktori, Kategori Baku & Optimasi SEO Google**
- Paginasi dan pencarian instan pada ruang curhat anonim dan direktori artikel refleksi.
- Penyelarasan seluruh kategori curhat & artikel menjadi 100% Bahasa Indonesia baku.
- Fleksibilitas portal admin untuk mengatur penayangan artikel dan curhat yang disematkan ke beranda (`showOnLandingPage`).
- Optimasi SEO teknis dengan Schema.org JSON-LD (`Person`, `WebApplication`, `BlogPosting`).

### [1.2.0] - 14 September 2026
> **Progressive Web App (PWA) Standalone & Dukungan Offline**
- Dukungan pemasangan PWA standalone untuk Android, iOS Safari (*Add to Home Screen*), dan Desktop.
- Halaman cadangan mode offline (`~offline`) dengan panduan latihan pernapasan grounding (*Tazkiyatun Nafs*).
- Penyimpanan cache aset statis berbasis Serwist Service Worker yang resilien dan hemat kuota.

### [1.1.0] - 08 September 2026
> **Portal Admin Konselor & Arsitektur Database Relasional**
- Portal administrasi konselor terlindungi untuk memoderasi curhat masuk dan mengelola janji temu konseling.
- Integrasi basis data PostgreSQL terstruktur dengan skema Drizzle ORM.
- Proteksi keamanan OWASP Top 10, sanitasi input XSS, dan rate limiter Upstash Redis.

### [1.0.0] - 01 September 2026
> **Rilis Perdana Portofolio & Ruang Bimbingan Digital Amelia**
- Peluncuran platform resmi portofolio profesional dan ruang bimbingan konseling sebaya Amelia (BKI UIN Siber Cirebon).
- Desain editorial human-craft bernuansa *Warm Paper* (`#FBF9F5`) dan *Forest Sage* (`#1A563C`).
- Formulir reservasi janji temu privat dengan 3 format sesi (Virtual Meet, Chat Terjadwal, Tatap Muka Kampus).

---

## 🌐 Tautan & Akses Resmi

- 🌟 **Situs Produksi:** [https://mlyfeblia.vercel.app](https://mlyfeblia.vercel.app)
- 🔗 **Domain Alternatif:** [https://amelia-portofolio.vercel.app](https://amelia-portofolio.vercel.app)
- 📦 **Repositori Sumber:** [mlyfeblia/amelia-portofolio](https://github.com/mlyfeblia/amelia-portofolio)
- 📸 **Instagram:** [@mlyfeb.lia](https://www.instagram.com/mlyfeb.lia)

---

<div align="center">
  <p>Diciptakan dengan kehangatan dan dedikasi penuh untuk mendampingi jiwa-jiwa bertumbuh. 🤍🌿</p>
  <p><sub>Versi 2.0.0 · © 2026 Amelia · Bimbingan Konseling Islam UIN Siber Syekh Nurjati Cirebon.</sub></p>
</div>
