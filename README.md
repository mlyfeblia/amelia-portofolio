# 🌸 Amelia (Amel) — Portofolio & Ruang Dengar Digital ✨

> *"Ruang aman untuk cerita yang belum sempat diucapkan, tempat hati berlabuh dalam Thuma'ninah."* 🌿🕊️

Selamat datang di repositori portofolio resmi **Amelia (Amel)** — mahasiswi Bimbingan Konseling Islam (BKI) di **UIN Siber Syekh Nurjati Cirebon** sekaligus konselor sebaya generasi digital! 

Website ini dirancang bukan sekadar sebagai pajangan CV biasa, tapi sebagai **ruang hangat dan interaktif** bagi siapa saja yang ingin melepaskan penat, curhat secara anonim, menguji kesejahteraan jiwa mandiri, hingga menjadwalkan sesi bimbingan konseling yang amanah dan rahasia. 🍵🌷

---

## 🎀 Kenalan Sama Fitur-Fiturnya Yuk!

Berikut adalah hal-hal seru dan bermakna yang ada di dalam website ini:

- 🗓️ **Janji Temu Konseling (Booking System)**: Teman-teman bisa memilih format konseling yang paling bikin nyaman: *Google Meet*, *Chat Terjadwal*, atau *Tatap Muka di Cirebon*. Data langsung tersimpan aman ke database!
- 💌 **Kotak Curhat Anonim (Interactive Q&A)**: Tempat menumpahkan unek-unek tanpa perlu takut dihakimi atau diketahui identitasnya. Kak Amel bisa membaca dan memberikan tanggapan penguat jiwa langsung dari portal admin.
- 🪞 **Asesmen Kesejahteraan Jiwa Mandiri**: Kuis refleksi diri 2 menit untuk mengenali ritme pikiran, kestabilan emosi, dan ketenangan spiritual harian.
- 📖 **Artikel & Refleksi BKI**: Kumpulan tulisan reflektif bertema *Tazkiyatun Nafs*, integrasi CBT (*Cognitive Behavioral Therapy*) dengan psikologi Islam, dan etika *Cyber Counseling*.
- 🔐 **Portal Admin Konselor**: Dashboard rahasia khusus Kak Amel untuk mengelola antrean janji temu konseli dan membalas curhatan yang masuk secara rapi.

---

## 🛠️ Stack Teknologi (Under the Hood)

Dibuat dengan cinta, kerapian kode, dan teknologi web modern:

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router + Turbopack) | Cepat, responsif, dan SEO-friendly |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) | Type-safe dari ujung frontend ke backend |
| **Backend / BaaS** | [InsForge](https://insforge.dev/) | Cloud Backend, Auth, Storage & Edge Functions |
| **Database** | [PostgreSQL 15](https://www.postgresql.org/) (Hosted on InsForge) | Database relasional tangguh |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) | Query builder cepat, ringan, dan elegan |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + Custom Aesthetic Theme | Nuansa *Warm Paper*, *Sage*, dan *Earthy Ink* |
| **Deployment** | [Vercel](https://vercel.com/) | Deployment otomatis berbasis cloud serverless |

---

## 🗂️ Struktur Direktori

```text
amelia-portofolio/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/              # Portal Manajemen Konselor
│   │   ├── api/                # Route Handlers (Articles, Bookings, Curhat)
│   │   ├── artikel/            # Direktori & Halaman Detail Artikel
│   │   ├── asesmen/            # Halaman Asesmen Diri Mandiri
│   │   ├── curhat/             # Halaman Ruang Curhat Anonim
│   │   ├── jadwal/             # Halaman Formulir Janji Temu
│   │   ├── layanan/            # Rincian Format Layanan Konseling
│   │   └── tentang/            # Profil Lengkap, Pendidikan & Filosofi Amel
│   ├── components/             # Komponen UI Reusable & Modular
│   ├── db/                     # Koneksi Drizzle & Schema PostgreSQL
│   │   ├── index.ts            # Client Drizzle ORM
│   │   └── schema.ts           # Definisi Tabel (articles, bookings, curhat)
│   ├── lib/                    # SDK InsForge & Data Access Layer
│   └── types/                  # Definisi Type TypeScript
├── scripts/
│   └── seed.mjs                # Script Seeding Data Awal ke PostgreSQL
├── drizzle.config.ts           # Konfigurasi Drizzle Kit
└── package.json
```

---

## 🚀 Cara Menjalankan di Komputer Lokal

Ingin mencoba atau mengembangkan website ini di komputermu? Ikuti langkah mudah berikut:

### 1. Kloning Repositori
```bash
git clone https://github.com/mlyfeblia/amelia-portofolio.git
cd amelia-portofolio
```

### 2. Pasang Dependensi
Website ini menggunakan package manager `pnpm`:
```bash
pnpm install
```

### 3. Konfigurasi Variabel Lingkungan (`.env.local`)
Buat file `.env.local` di root folder (bisa menyalin dari `.env.example`):
```env
# InsForge Cloud
NEXT_PUBLIC_INSFORGE_URL=https://y8ug7mrt.ap-southeast.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=anon_your_key_here
INSFORGE_API_KEY=ik_your_api_key_here

# PostgreSQL / Drizzle
DATABASE_URL=postgresql://postgres:password@y8ug7mrt.ap-southeast.database.insforge.app:5432/insforge?sslmode=require

# App
NEXT_PUBLIC_SITE_URL=https://amelia-bki.vercel.app
```

### 4. Sinkronisasi Database
```bash
# Push skema tabel ke database
pnpm db:push

# (Opsional) Jalankan seed data awal
pnpm db:seed
```

### 5. Jalankan Server Development!
```bash
pnpm dev
```
Buka browser favoritmu di [http://localhost:3000](http://localhost:3000) dan nikmati suasananya! 🌻✨

---

## 📑 Helper Scripts

| Perintah | Fungsi |
| :--- | :--- |
| `pnpm dev` | Menjalankan local development server (Turbopack) |
| `pnpm build` | Membangun produksi Next.js teroptimasi |
| `pnpm db:push` | Sinkronisasi skema Drizzle langsung ke PostgreSQL |
| `pnpm db:generate` | Menghasilkan migration SQL dari skema |
| `pnpm db:studio` | Membuka Drizzle Studio UI untuk melihat isi database |
| `pnpm db:seed` | Mengisi data awal ke database PostgreSQL |

---

## 🌐 Tautan Live & Kontak

* 🌟 **Live Website**: [https://amelia-bki.vercel.app](https://amelia-bki.vercel.app) *(Tersedia juga di [https://mlyfeblia.vercel.app](https://mlyfeblia.vercel.app))*
* 📦 **GitHub Repository**: [mlyfeblia/amelia-portofolio](https://github.com/mlyfeblia/amelia-portofolio)
* ☁️ **Vercel Dashboard**: [mlyfeblia/amelia-portofolio](https://vercel.com/mlyfeblia/amelia-portofolio)
* 🗄️ **InsForge Dashboard**: [amelia-portofolio (InsForge)](https://insforge.dev/dashboard/project/5036fd47-4cff-4810-ac38-4fba27a68450)
* 💬 **Konsultasi & Tanya Jawab**: Melalui menu **Janji Temu** atau **Kotak Curhat** di website.

---

<div align="center">
  <p>Dibuat dengan setulus hati untuk mendampingi jiwa-jiwa tangguh generasi siber. 🤍🌿</p>
  <p><sub>© 2026 Amelia. UIN Siber Syekh Nurjati Cirebon.</sub></p>
</div>
