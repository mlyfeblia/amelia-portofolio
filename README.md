# 🌿 Amelia (Amel) — Portofolio & Ruang Bimbingan Digital `v1.5.0`

[![Production Status](https://img.shields.io/badge/Production-Live%20v1.5.0-1A563C?style=for-the-badge&logo=vercel&logoColor=white)](https://mlyfeblia.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-Serwist%20Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://serwist.pages.dev/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey?style=for-the-badge)](LICENSE)

> *"Ruang aman untuk cerita yang belum sempat diucapkan, tempat hati berlabuh dalam Thuma'ninah."* 🕊️

Selamat datang di repositori resmi **Amelia (Amel) — Versi 1.5.0**, platform portofolio profesional dan ruang bimbingan konseling digital dari mahasiswi Bimbingan Konseling Islam (BKI) **Universitas Islam Negeri Siber Syekh Nurjati Cirebon (UINSSC)**.

Platform ini mengintegrasikan profil profesional praktisi layanan pelanggan (berpengalaman sejak 2020), ruang konseling sebaya (*cyber counseling*), ruang curhat anonim yang aman, asesmen mandiri kesehatan jiwa, dan artikel reflektif berbasis pendekatan psikologi Islam (*Tazkiyatun Nafs*).

---

## 🌟 Pilar Desain & Standar Rekayasa (Anti-AI-Slop)

Platform ini dibangun dengan prinsip keaslian (*human craft*) dan disiplin estetika tanpa kompromi:
- **Palet Warna Organik Bernuansa Teduh:** Menggunakan token warna `Warm Paper` (`#FBF9F5`), `Forest Sage` (`#1A563C`), dan `Reading Ink` (`#192820`) yang menenangkan mata saat membaca lama.
- **Tipografi Berdisiplin Tinggi:** Pasangan elegan *Newsreader* (serif untuk headline berwibawa) dan *Plus Jakarta Sans* (sans-serif ramah untuk keterbacaan teks panjang).
- **Zero-Flicker & Micro-Interactions 60fps:** Seluruh transisi, modal terpusat, dropdown, dan animasi scroll menggunakan composited transforms hardware-accelerated tanpa lonjakan layout (*zero Cumulative Layout Shift*).
- **Kebersihan Interaksi Teks:** Teks artikel, kode reservasi, dan materi bacaan dapat disalin bebas (`select-text`), sedangkan elemen antarmuka tombol dan navigasi terlindungi dari ketidaksengajaan seleksi blok (`select-none`).
- **Aksesibilitas Universal (WCAG 2.1 AA):** Skip to content link, indikator fokus keyboard berstandar tinggi, semantik ARIA lengkap, dan dukungan ketat `prefers-reduced-motion`.

---

## ✨ Fitur Utama Versi 1.0.0

### 📱 1. Progressive Web App (PWA) Resilien & Sistem Update Otomatis
- **Offline-First Resilience:** Seluruh halaman, font, dan aset statis yang pernah dibuka di-cache secara otomatis via Service Worker berbasis [Serwist](https://serwist.pages.dev/).
- **Sistem Pembaruan Terotomasi (v1.5.0):** Pengecekan versi periodik, banner notifikasi changelog terpusat, dan modal catatan pembaruan transparan (*frosted glass*).
- **Fallback Offline Interaktif ([`src/app/~offline/page.tsx`](src/app/~offline/page.tsx)):** Menyediakan panduan latihan pernapasan grounding (*Tazkiyatun Nafs*), tombol muat ulang, dan akses darurat saat koneksi internet terputus.
- **Panduan Pasang Lintas Platform:** Dukungan instalasi native di Android, Windows, macOS, serta modal petunjuk visual khusus untuk pengguna Safari iOS (*Add to Home Screen*).

### 🗓️ 2. Reservasi Jadwal & Pelacakan Status di Perangkat
- **Pelacakan Status Janji Temu di Perangkat:** Konseli dapat memantau status janji temu langsung di perangkat tanpa perlu registrasi/login akun (`amel_device_bookings_history`).
- **Tiga Format Sesi Fleksibel:** *Google Meet Virtual*, *Chat Terjadwal*, dan *Tatap Muka di Lingkungan Kampus UIN Siber Cirebon*.
- **Alur Mandiri & Validasi Berlapis:** Validasi nomor WhatsApp (9–15 digit), format email, 8 topik bimbingan konseling spesifik, dan tiket reservasi instan ber-QR code.

### 💌 3. Ruang Curhat Anonim (Dinding Interaktif)
- **100% Rahasia & Aman:** Konseli dapat mencurahkan isi hati dan beban pikiran akademik maupun emosional tanpa mempublikasikan identitas pribadi.
- **Paginasi & Kategori Baku:** Penataan dinding cerita berbasis paginasi dan filter topik 100% Bahasa Indonesia baku.
- **Tanggapan Konselor Sebaya:** Jawaban reflektif dan suportif dari Amelia dipublikasikan ke dinding curhat publik setelah melalui proses kurasi.

### 🪞 4. Asesmen Kesejahteraan Jiwa Holistik 4 Dimensi
- **Instrumen Psikologis BKI Terstandarisasi:** 8 pertanyaan terstruktur (skala 0–3, total 24 poin) yang menakar *Ritme Pikiran/Kognitif*, *Resiliensi Emosi*, *Kedamaian Batin (Thuma'ninah)*, dan *Relasi Sosial/Boundaries*.
- **Evaluasi Multi-Dimensi & Visual Bar:** Klasifikasi fase (*Nafs Muthma'innah*, *Nafs Lawwamah*, atau *Fase Pendampingan Empatis Segera*) dilengkapi rekomendasi terarah dan tombol salin hasil.
- **Riwayat di Perangkat:** Hasil evaluasi tersimpan lokal di browser (`amel_device_assessment_history`) dengan perbandingan tren skor antar sesi tanpa login.

### 📖 5. Artikel & Kajian Reflektif BKI
- Kumpulan artikel mendalam tentang *Tazkiyatun Nafs*, navigasi kecemasan (*overthinking*), *Cyber Counseling*, serta relasi bimbingan konseling sebaya.
- Dilengkapi estimasi waktu baca, filter kategori, format markdown aman, paginasi terstruktur, dan optimasi SEO Google Search.

### 🔐 6. Portal Administrasi Konselor
- Dashboard terlindungi untuk memantau pendaftar konseling, memoderasi pesan curhat, dan mempublikasikan artikel baru.
- **Batas Sesi Keamanan 30 Menit & Autosave:** Dilengkapi dialog modal interaktif perpanjangan sesi yang responsif pada layar mobile maupun desktop, serta proteksi autosave draf otomatis.
- Otentikasi berbasis token JWT HttpOnly, hash verifikasi, dan proteksi sesi berlapis.

---

## ⚡ Optimalisasi Performa & SEO

### 🚀 Metrik Kinerja (Core Web Vitals)
- **Largest Contentful Paint (LCP):** Gambar profil pahlawan dioptimasi ke WebP/AVIF dengan atribut `priority` dan `sizes` responsif untuk pemuatan sub-detik.
- **Cumulative Layout Shift (CLS):** `0.000` — Dimensi elemen gambar dan font swap terkunci presisi tanpa pergeseran layout.
- **First Input Delay / INP:** Interaksi instan didukung oleh React 19 concurrent features dan bundle JavaScript modular.

### 🔍 Search Engine Optimization (SEO) Terpadu
- **Dynamic Metadata & Canonical URL:** Setiap halaman dilengkapi judul unik, deskripsi kontekstual, dan tautan kanonikal resmi ke domain produksi.
- **OpenGraph & Twitter Card:** Tampilan pratinjau kaya (*rich snippet previews*) untuk pembagian di WhatsApp, Telegram, Twitter/X, dan Instagram.
- **JSON-LD Schema.org Berstandar:**
  - `Person` (Profil Amelia, afiliasi UIN Siber Cirebon, kompetensi konseling)
  - `WebSite` (Pencarian artikel terindeks)
  - `ProfessionalService` (Layanan bimbingan konseling)
  - `WebApplication` (Asesmen mandiri & PWA)
  - `BlogPosting` (Metadata artikel, penulis, dan tanggal rilis)
  - `BreadcrumbList` (Hierarki navigasi di setiap sub-halaman)
- **Sitemap Dinamis & Robots:** Berkas [`sitemap.xml`](src/app/sitemap.ts) yang mengindeks artikel aktif secara otomatis serta [`robots.txt`](src/app/robots.ts) yang memblokir crawler dari area privat admin/API.

---

## 🛡️ Standar Keamanan (OWASP Top 10 Hardened)

1. **Proteksi Cross-Site Scripting (XSS):**
   Renderer markdown artikel menggunakan whitelist ketat untuk skema URL (`http:`, `https:`, `mailto:`, `tel:`), memblokir injeksi berbasis `javascript:`, `data:`, atau `vbscript:`.
2. **HTTP Security Headers Lengkap:**
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (HSTS)
   - `X-Frame-Options: SAMEORIGIN` (Pencegahan Clickjacking)
   - `X-Content-Type-Options: nosniff` (Pencegahan MIME-sniffing)
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
3. **Pembatasan Frekuensi Akses (Rate Limiting):**
   Pencegahan serangan DDoS dan pengiriman formulir berulang menggunakan Upstash Redis Sliding Window Rate Limiter.
4. **Proteksi Sesi Konselor:**
   Cookie sesi menggunakan atribut `HttpOnly`, `SameSite=Lax`, dan `Secure` untuk mencegah kebocoran kredensial via script injeksi.

---

## 🛠️ Stack Teknologi & Arsitektur

| Kategori | Teknologi | Peran / Deskripsi |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) | React Server Components (RSC), Dynamic Metadata, Route Handlers |
| **Library UI** | [React 19](https://react.dev/) | `react: 19.3.0`, `useSyncExternalStore`, concurrent hydration |
| **PWA Engine** | [Serwist](https://serwist.pages.dev/) (`@serwist/next`) | Service Worker bundler, precache, tiering cache statis |
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
│   │   ├── api/                # Endpoint API (Admin, Bookings, Curhat, Articles)
│   │   ├── articles/           # Koleksi artikel & rute dinamis [slug]
│   │   ├── assessment/         # Asesmen reflektif kesejahteraan jiwa
│   │   ├── counseling/         # Ruang curhat anonim & dinding interaktif
│   │   ├── schedule/           # Formulir reservasi janji temu konseling
│   │   ├── services/           # Format layanan & tahapan alur bimbingan
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
│   │   ├── pwa-store.ts        # Store state reaktif PWA (Install & status)
│   │   ├── rate-limiter.ts     # Integrasi Upstash Redis Rate Limiting
│   │   └── utils.ts            # Sanitasi teks, format tanggal, & helper UI
│   └── sw.ts                   # Sumber Service Worker Serwist
├── next.config.ts              # Konfigurasi Next.js + Serwist
├── tsconfig.json               # Konfigurasi compiler TypeScript
└── package.json                # Rincian dependensi & script v1.0.0
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
DATABASE_URL="postgresql://postgres:password@host:5432/dbname?sslmode=require"
NEXT_PUBLIC_INSFORGE_URL="https://your-project.insforge.app"
NEXT_PUBLIC_INSFORGE_ANON_KEY="your-anon-key"
INSFORGE_API_KEY="your-api-key"

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Autentikasi Admin
ADMIN_SECRET="kata-sandi-admin-yang-kuat"
ADMIN_SESSION_SECRET="rahasia-token-jwt-minimal-32-karakter"

# Metadata Situs
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
GOOGLE_SITE_VERIFICATION="kode-verifikasi-google"
```

### 4. Sinkronisasi Skema Database
```bash
pnpm db:push
# Opsional: Memasukkan data artikel & sampel awal
pnpm db:seed
```

### 5. Jalankan Server Development
```bash
pnpm dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

### 6. Pengujian Build Produksi & Service Worker
```bash
pnpm build
pnpm start
```

---

## 📋 Daftar Perintah (Scripts)

| Perintah | Deskripsi |
| :--- | :--- |
| `pnpm dev` | Menjalankan server pengembangan lokal dengan Turbopack |
| `pnpm build` | Membangun bundel produksi Next.js dengan kompilasi Service Worker Serwist |
| `pnpm start` | Menjalankan aplikasi hasil build produksi di server lokal |
| `pnpm lint` | Memeriksa kepatuhan kode dan linting ESLint |
| `pnpm db:push` | Mendorong perubahan skema Drizzle langsung ke basis data PostgreSQL |
| `pnpm db:generate` | Menghasilkan berkas migrasi SQL baru |
| `pnpm db:studio` | Membuka antarmuka visual Drizzle Studio di peramban |
| `pnpm db:seed` | Mengisi data sampel awal ke database |

---

## 🌐 Tautan & Akses Resmi

- 🌟 **Situs Produksi:** [https://mlyfeblia.vercel.app](https://mlyfeblia.vercel.app)
- 🔗 **Domain Alternatif:** [https://amelia-portofolio.vercel.app](https://amelia-portofolio.vercel.app)
- 📦 **Repositori Sumber:** [mlyfeblia/amelia-portofolio](https://github.com/mlyfeblia/amelia-portofolio)
- 📸 **Instagram:** [@mlyfeb.lia](https://www.instagram.com/mlyfeb.lia)

---

<div align="center">
  <p>Diciptakan dengan kehangatan dan dedikasi penuh untuk mendampingi jiwa-jiwa bertumbuh. 🤍🌿</p>
  <p><sub>Versi 1.0.0 · © 2026 Amelia · Bimbingan Konseling Islam UIN Siber Syekh Nurjati Cirebon.</sub></p>
</div>
