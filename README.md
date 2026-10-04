# 🌿 Amelia (Amel) — Portofolio & Ruang Dengar Digital

> *"Ruang aman untuk cerita yang belum sempat diucapkan, tempat hati berlabuh dalam Thuma'ninah."* 🕊️

Selamat datang di repositori portofolio resmi **Amelia (Amel)** — mahasiswi Bimbingan Konseling Islam (BKI) di **UIN Siber Syekh Nurjati Cirebon**, konselor sebaya generasi digital, dan praktisi layanan pelanggan berpengalaman sejak 2020.

Website ini bukan sekadar portofolio statis, melainkan platform **Progressive Web App (PWA)** interaktif yang dirancang dengan dedikasi tinggi (*human craft*, tanpa *AI-slop*), performa tinggi, dan ketahanan *offline* penuh untuk mendampingi siapa saja yang membutuhkan ruang aman mendengar, bercerita, dan bertumbuh.

---

## ✨ Fitur-Fitur Utama

### 📱 1. PWA Modern & Resilien (Powered by Serwist)
- **Offline-First Resilience:** Seluruh aset statis, font (*Google Fonts*), artikel, dan halaman yang pernah dibuka tersimpan otomatis ke dalam cache lokal.
- **Halaman Fallback Offline ([`src/app/~offline/page.tsx`](src/app/~offline/page.tsx)):** Jika koneksi terputus saat membuka tautan baru, aplikasi menyajikan halaman khusus bertema *Tazkiyatun Nafs* lengkap dengan panduan latihan pernapasan sadar (*grounding exercise*), tombol muat ulang, dan kontak WhatsApp darurat.
- **Instalasi ke Layar Utama (Add to Home Screen):** Mendukung instalasi native di Android, iOS, Windows, dan macOS dengan icon adaptif (*maskable icons*) beresolusi tinggi (192px & 512px).
- **Deteksi Pembaruan Otomatis (Lifecycle Management):** Komponen [`PwaLifecycle.tsx`](src/components/pwa/PwaLifecycle.tsx) otomatis mendeteksi Service Worker baru dan menampilkan dialog pembaruan instan (*Skip Waiting*).
- **Dukungan Penuh "Minta Situs Desktop":** Tampilan dan skala otomatis menyesuaikan secara proporsional saat pengguna beralih ke mode situs desktop di browser mobile (Chrome Android, Safari iOS), lengkap dengan dukungan *pinch-to-zoom*.

### 🗓️ 2. Janji Temu Konseling (Reservasi Terpadu)
- **Pilihan 3 Format Fleksibel:** *Google Meet Virtual*, *Chat Terjadwal*, atau *Tatap Muka di Kampus UIN Siber Cirebon*.
- **Validasi Multi-Lapisan:** Validasi nomor WhatsApp (9–15 digit), format email, pencegahan tanggal masa lalu, dan batas reservasi hingga 60 hari ke depan.
- **Keamanan Berlapis:** Dilengkapi *honeypot bot trap* dan Upstash Redis *sliding-window rate limiter* untuk mencegah spam.

### 💌 3. Ruang Curhat Anonim (Interactive Q&A)
- **100% Aman & Terjaga:** Memungkinkan konseli menumpahkan keluh kesah akademik, emosional, atau keluarga tanpa perlu mencantumkan identitas asli.
- **Moderasi & Tanggapan Konselor:** Amelia dapat membaca, memoderasi, dan memberikan jawaban meneduhkan langsung dari Dashboard Admin.

### 🪞 4. Asesmen Kesejahteraan Diri Mandiri
- Kuis refleksi interaktif 2 menit untuk mengevaluasi ritme pikiran, kestabilan emosi, dan ketenangan batin secara terarah.

### 📖 5. Artikel & Kajian Reflektif BKI
- Wawasan mendalam seputar integrasi *Cognitive Behavioral Therapy* (CBT) dengan psikologi Islam, *Tazkiyatun Nafs*, serta etika *Cyber Counseling*.

### 🔐 6. Portal Manajemen Admin Terproteksi
- Dashboard privat khusus konselor untuk mengelola antrean reservasi konseli, membalas curhatan publik/privat, dan menerbitkan artikel.
- Dilengkapi sistem otentikasi berbasis token JWT HttpOnly, verifikasi sesi realtime, dan proteksi brute-force.

---

## 🛠️ Stack Teknologi

Platform ini dibangun menggunakan arsitektur web modern berkinerja tinggi:

| Layer | Teknologi | Deskripsi / Peran |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) | Server Components (RSC), Dynamic Metadata, SEO |
| **UI Library** | [React 19](https://react.dev/) | `react: 19.3.0`, `useSyncExternalStore` |
| **PWA Engine** | [Serwist](https://serwist.pages.dev/) (`@serwist/next`) | Service Worker bundler, precache, runtime caching tiers |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict type-safety dari ujung frontend hingga query database |
| **Database** | [PostgreSQL 15](https://www.postgresql.org/) (InsForge BaaS) | Database relasional persisten & transaksi ACID |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) | Type-safe query builder & otomatisasi migrasi |
| **Rate Limiting** | [Upstash Redis](https://upstash.com/) (`@upstash/ratelimit`) | Perlindungan DDoS & pembatasan frekuensi pengiriman pesan |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Desain kustom bertema *Warm Paper*, *Forest Sage*, dan *Reading Ink* |
| **Asset Pipeline**| [Sharp](https://sharp.pixelplumbing.com/) | Optimasi gambar WebP/AVIF dan kompilasi icon PWA |
| **Icons & Font** | `lucide-react`, Google Fonts (`Newsreader` & `Plus Jakarta Sans`) | Tipografi berdisiplin tinggi dan ikonografi konsisten |
| **Deployment** | [Vercel](https://vercel.com/) | Edge network global, zero-downtime CI/CD deployment |

---

## 🗂️ Struktur Direktori Proyek

```text
amelia-portofolio/
├── public/
│   ├── icons/                  # Icon PWA (192x192, 512x512, standard & maskable)
│   ├── amelia.webp             # Foto profil beresolusi tinggi (teroptimasi)
│   ├── apple-icon.png          # Touch icon iOS Safari (180x180)
│   ├── manifest.json           # Salinan statis Web App Manifest
│   └── sw.js                   # Service Worker produksi (digenerasi oleh Serwist)
├── src/
│   ├── app/                    # Next.js App Router Routes
│   │   ├── ~offline/           # Halaman fallback saat koneksi terputus
│   │   ├── about/              # Profil lengkap, riwayat kerja & kepemimpinan
│   │   ├── admin/              # Portal Manajemen Konselor (Dashboard, Bookings, Curhat)
│   │   ├── api/                # API Route Handlers (Admin, Bookings, Curhat, Articles)
│   │   ├── articles/           # Koleksi artikel & halaman dinamis [slug]
│   │   ├── assessment/         # Kuis evaluasi diri & kesehatan mental mandiri
│   │   ├── counseling/         # Ruang Curhat Anonim & dinding interaktif
│   │   ├── schedule/           # Formulir reservasi janji temu konseling
│   │   ├── services/           # Rincian format layanan & alur konsultasi
│   │   ├── layout.tsx          # Root Layout, font injection, viewport, & JSON-LD
│   │   ├── manifest.ts         # Dynamic App Router Web App Manifest
│   │   ├── robots.ts           # Konfigurasi robots crawler
│   │   └── sitemap.ts          # Generator sitemap XML otomatis
│   ├── components/
│   │   ├── about/              # Komponen halaman Tentang
│   │   ├── admin/              # Komponen panel admin & proteksi sesi
│   │   ├── booking/            # Langkah-langkah formulir reservasi
│   │   ├── counseling/         # Form input curhat & dinding pesan
│   │   ├── home/               # Hero, Approach, Services, & Track Record
│   │   ├── pwa/                # PwaLifecycle (Update, Install, Status Jaringan) & OfflineActions
│   │   ├── Navbar.tsx          # Navigasi responsif (Desktop & Mobile)
│   │   └── Footer.tsx          # Navigasi bawah, kontak, dan hak cipta
│   ├── db/
│   │   ├── index.ts            # Inisialisasi koneksi Drizzle ORM
│   │   └── schema.ts           # Definisi skema tabel (articles, bookings, curhat)
│   ├── lib/
│   │   ├── data-store.ts       # Lapisan akses data (PostgreSQL + Fallback Mock)
│   │   ├── rate-limiter.ts     # Integrasi Upstash Redis Rate Limiting
│   │   └── utils.ts            # Helper utilitas Tailwind & JSON-LD sanitization
│   └── sw.ts                   # Sumber Service Worker Serwist (Caching tiers & Fallbacks)
├── next.config.ts              # Konfigurasi Next.js + withSerwistInit
├── tsconfig.json               # Konfigurasi TypeScript + lib webworker & serwist typings
└── package.json
```

---

## 🚀 Panduan Menjalankan di Komputer Lokal

Ikuti langkah-langkah berikut untuk menjalankan repositori ini di lingkungan lokal Anda:

### 1. Kloning Repositori
```bash
git clone https://github.com/mlyfeblia/amelia-portofolio.git
cd amelia-portofolio
```

### 2. Pasang Dependensi
Aplikasi ini menggunakan package manager `pnpm`:
```bash
pnpm install
```

### 3. Konfigurasi Environment Variables (`.env.local`)
Salin file template `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Sesuaikan konfigurasi variabel lingkungan yang dibutuhkan:
```env
# InsForge Backend / PostgreSQL
DATABASE_URL="postgresql://postgres:password@host:5432/dbname?sslmode=require"
NEXT_PUBLIC_INSFORGE_URL="https://your-project.insforge.app"
NEXT_PUBLIC_INSFORGE_ANON_KEY="your-anon-key"
INSFORGE_API_KEY="your-api-key"

# Upstash Redis Rate Limiting (Opsional di lokal, wajib di produksi)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Keamanan Admin Dashboard
ADMIN_SECRET="your-strong-admin-passphrase"
ADMIN_SESSION_SECRET="your-32-char-random-jwt-secret-key"

# Metadata & Verifikasi
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
GOOGLE_SITE_VERIFICATION="your-verification-code"
```

### 4. Sinkronisasi Skema Database
Dorong skema tabel Drizzle ke database PostgreSQL:
```bash
pnpm db:push
```
*(Opsional)* Jalankan script pengisian data awal:
```bash
pnpm db:seed
```

### 5. Jalankan Server Development
```bash
pnpm dev
```
Buka peramban Anda di [http://localhost:3000](http://localhost:3000).

### 6. Build Produksi (Kompilasi PWA & Service Worker)
Untuk menguji performa penuh PWA dan kompilasi Service Worker Serwist:
```bash
pnpm build
pnpm start
```

---

## 📑 Daftar Perintah Kerja (Scripts)

| Perintah | Deskripsi |
| :--- | :--- |
| `pnpm dev` | Menjalankan server pengembangan lokal |
| `pnpm build` | Membangun bundel produksi Next.js dengan kompilasi Service Worker Serwist (`--webpack`) |
| `pnpm start` | Menjalankan server aplikasi produksi lokal |
| `pnpm lint` | Memeriksa kepatuhan kode dan linting ESLint |
| `pnpm db:push` | Mendorong perubahan skema Drizzle langsung ke PostgreSQL |
| `pnpm db:generate` | Menghasilkan berkas migrasi SQL |
| `pnpm db:studio` | Membuka antarmuka grafis Drizzle Studio di browser |
| `pnpm db:seed` | Memasukkan data awal artikel dan rekam jejak ke database |

---

## 🌐 Tautan Resmi

- 🌟 **Situs Resmi Utama:** [https://mlyfeblia.vercel.app](https://mlyfeblia.vercel.app)
- 📦 **Repositori GitHub:** [mlyfeblia/amelia-portofolio](https://github.com/mlyfeblia/amelia-portofolio)
- 💼 **LinkedIn Amelia:** [linkedin.com/in/amelia](https://linkedin.com/in/amelia)
- 💬 **Layanan Konseling & Curhat:** Tersedia melalui menu navigasi di situs resmi.

---

<div align="center">
  <p>Didedikasikan dengan ketulusan untuk mendampingi jiwa-jiwa tangguh generasi siber. 🤍🌿</p>
  <p><sub>© 2026 Amelia · Bimbingan Konseling Islam UIN Siber Syekh Nurjati Cirebon.</sub></p>
</div>
