# Tab Visibility Caching, Resend Notifications, Mobile Topic Explorer, Article Images & View Counter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun sistem deteksi tab browser (tab visibility) dan optimalisasi caching, sistem notifikasi menyeluruh (Email Resend dengan template desain islami modern untuk user & Amelia, serta notifikasi Web/PWA), penjelajah topik mobile di dalam artikel, penghitung jumlah dibaca (*view counter*), sistem foto sampul artikel dengan fitur drag & drop serta galeri kurasi di admin (hanya muncul di dalam artikel detail), serta perbaikan kedipan foto profil Amel.

**Architecture:**
1. **Email & Notifikasi:** Integrasi Resend SDK (`resend`) via API Route dengan template HTML responsif bernuansa sage/emerald. Notifikasi terpicu saat user reservasi (email konfirmasi ke user + email alert ke Amel) dan saat curhat terkirim (email alert ke Amel). Di sisi client/PWA, dipasang Notification API helper dengan izin sopan (*polite permission*).
2. **Tab Visibility & Caching:** Komponen `TabVisibilityManager` memantau `document.visibilityState` untuk mengganti title tab secara santun (*mindfulness pause*) saat tab ditinggalkan, serta memicu revalidasi otomatis data usang saat tab aktif kembali setelah > 90 detik. Service worker Serwist (`src/sw.ts`) diperkuat dengan caching media dan artikel yang optimal.
3. **Mobile Topic Explorer:** Komponen `ArticleMobileTopicExplorer` diletakkan tepat di bawah baris share artikel pada mobile (`/articles/[slug]`) agar pembaca langsung bisa beralih ke kategori lain tanpa harus scroll ke atas.
4. **Article Views Counter:** Kolom `views` pada schema artikel, endpoint `/api/articles/view` dengan proteksi sessionStorage anti-spam refresh, dan indikator mata (*eye icon*) di `ArticleHeader` serta Admin Article Card.
5. **Sistem Foto Artikel:** Kolom `coverImage` pada artikel yang hanya dirender di dalam halaman detail (`/articles/[slug]`) dengan container aspek rasio responsif (16:9 / 21:9) dan zero CLS. Admin dilengkapi fitur upload Drag & Drop, pemilihan galeri kurasi 6 kategori, dan input URL.
6. **Perbaikan Kedipan Foto Amel:** Menambahkan atribut `unoptimized` dan preloading pada `/amelia.webp` untuk menghilangkan delay fetch sekunder dari image optimizer Next.js yang menyebabkan kedip awal saat masuk artikel.

**Tech Stack:** Next.js 16.3 (App Router), React 19, TypeScript, Resend API (`resend`), Serwist PWA, Tailwind CSS v4, Lucide React icons.

**Spec / Persyaratan Pengguna:**
- Resend API Key: `re_ScpEigcE_JcR5RF3Awo7uWbRvBXkSLZiQ` (disimpan aman di `.env.local`).
- Template email berdesain rapi dan islami modern untuk user dan Amelia.
- Notifikasi di Web publik, PWA, dan admin.
- Tab browser keluar: judul tab berubah santun + caching sinkronisasi saat kembali.
- Mobile artikel: tambah "Fokus Topik & Jelajahi Kategori Lain" di bagian bawah artikel setelah membaca.
- Artikel: view counter ("dilihat berapa kali") tersimpan dan tampil di header artikel dan admin.
- Gambar artikel: HANYA muncul di dalam isi artikel (`/articles/[slug]`), TIDAK muncul di daftar `/articles` atau beranda. Dilengkapi upload drag & drop, galeri kurasi di admin. Ringan dan teroptimasi.
- Foto Amel di artikel diperbaiki agar tidak berkedip saat awal masuk.

## Global Constraints

- Kunci API Resend disimpan dalam `.env.local` sebagai `RESEND_API_KEY` (tidak boleh di-hardcode ke git).
- Foto sampul artikel tidak boleh muncul di kartu listing `/articles` atau kartu preview beranda (aturan mutlak dari pengguna).
- Semua operasi email harus non-blocking (asynchronous dengan fallback error handling) agar kegagalan jaringan email tidak menggagalkan penyimpanan reservasi atau curhat.
- View counter tidak boleh bertambah drastis akibat spam refresh (gunakan sessionStorage deduplication).
- Build Next.js (`pnpm build`) harus sukses bersih dengan 0 error di seluruh 41 rute.

---

### Task 1: Integrasi Resend Email Service & Branded HTML Templates

**Files:**
- Create: `src/lib/resend.ts`
- Create: `src/lib/email-templates/booking-confirmation-template.ts`
- Create: `src/lib/email-templates/booking-admin-alert-template.ts`
- Create: `src/lib/email-templates/curhat-admin-alert-template.ts`
- Modify: `.env.local`
- Modify: `src/app/api/bookings/route.ts`
- Modify: `src/app/api/curhat/route.ts`

**Interfaces:**
- Produces:
  ```ts
  export async function sendBookingConfirmationEmail(booking: Booking): Promise<boolean>;
  export async function sendAdminBookingAlertEmail(booking: Booking): Promise<boolean>;
  export async function sendAdminCurhatAlertEmail(curhat: AnonymousMessage): Promise<boolean>;
  ```

- [x] **Step 1: Install package `resend` dan konfigurasi environment variable**
  - Jalankan `pnpm add resend`.
  - Tambahkan `RESEND_API_KEY=re_ScpEigcE_JcR5RF3Awo7uWbRvBXkSLZiQ` dan `ADMIN_NOTIFICATION_EMAIL=mlyfeblia@gmail.com` ke `.env.local`.

- [x] **Step 2: Buat modul client Resend di `src/lib/resend.ts`**
  - Inisialisasi client `new Resend(process.env.RESEND_API_KEY)`.
  - Implementasikan fungsi pengiriman dengan fallback aman: jika API key tidak tersedia atau error jaringan, catat ke telemetry tanpa melempar exception ke request utama.

- [x] **Step 3: Buat template email responsif berdesain islami modern**
  - `booking-confirmation-template.ts`:
    - Header: Logo/Emblem Amelia, salam islami hangat ("Assalamu'alaikum Warahmatullahi Wabarakatuh, Kak [Nama]").
    - Card Rincian Reservasi: Kode tiket (font mono besar), Tanggal, Sesi Jam, Format Konseling (Google Meet / Chat / Tatap Muka), dan Topik.
    - Panduan persiapan sesi & tautan lacak jadwal (`/schedule?code=XXX`).
    - Tombol WhatsApp resmi konselor sebaya & jaminan kerahasiaan (*safe space*).
  - `booking-admin-alert-template.ts`:
    - Alert judul: "📅 Reservasi Baru Masuk: [Nama] - [Topik]".
    - Rincian kontak (Email, No WhatsApp, Catatan awal konseli).
    - Tombol langsung ke `/admin/bookings`.
  - `curhat-admin-alert-template.ts`:
    - Alert judul: "💌 Pesan Curhat Baru Masuk dari [Alias] - [Kategori]".
    - Cuplikan isi cerita konseli dalam quote card beraksen sage.
    - Tombol langsung ke `/admin/counseling` untuk memberikan tanggapan.

- [x] **Step 4: Sambungkan pemicu email pada API Route**
  - Di `src/app/api/bookings/route.ts`: panggil `sendBookingConfirmationEmail(newBooking)` dan `sendAdminBookingAlertEmail(newBooking)` setelah `createBooking` berhasil.
  - Di `src/app/api/curhat/route.ts`: panggil `sendAdminCurhatAlertEmail(newCurhat)` setelah `createCurhat` berhasil.

---

### Task 2: Tab Visibility Behavior, Title Pause Indicator & Smart Caching

**Files:**
- Create: `src/components/TabVisibilityManager.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/sw.ts`

**Interfaces:**
- Produces: Komponen `<TabVisibilityManager />` yang terpasang di root layout.

- [x] **Step 1: Buat `src/components/TabVisibilityManager.tsx`**
  - Pasang listener `visibilitychange` pada `document`.
  - Saat tab tidak aktif (`document.visibilityState === 'hidden'`):
    - Simpan `document.title` asli ke ref.
    - Ganti judul tab menjadi pesan jeda santun: `"✨ Ambil jeda sejenak... | Amelia BKI"` secara lembut.
    - Rekam timestamp waktu tab ditinggalkan (`leftAt = Date.now()`).
  - Saat tab aktif kembali (`document.visibilityState === 'visible'`):
    - Kembalikan `document.title` ke judul halaman semula.
    - Jika user meninggalkan tab lebih dari 90 detik, picu revalidasi halus (`router.refresh()`) agar data status atau jadwal selalu terbarui tanpa refresh manual.

- [x] **Step 2: Daftarkan di `src/app/layout.tsx`**
  - Render `<TabVisibilityManager />` di dalam provider tree layout utama.

- [x] **Step 3: Optimalisasi Caching di Service Worker (`src/sw.ts`)**
  - Pastikan media gambar artikel (`/images/articles/`) masuk dalam rule CacheFirst dengan eviction 30 hari.
  - Pastikan rute dokumen artikel memiliki offline fallback yang tangguh.

---

### Task 3: Sistem Notifikasi Web & PWA (In-App & Browser Push)

**Files:**
- Create: `src/lib/notifications.ts`
- Create: `src/components/pwa/NotificationPromptModal.tsx`
- Modify: `src/components/pwa/PwaLifecycle.tsx`

**Interfaces:**
- Produces:
  ```ts
  export function requestNotificationPermission(): Promise<NotificationPermission>;
  export function dispatchLocalNotification(title: string, options?: NotificationOptions): void;
  ```

- [x] **Step 1: Buat helper `src/lib/notifications.ts`**
  - Cek ketersediaan Notification API dan ServiceWorkerRegistration.
  - Sediakan fungsi `requestNotificationPermission()` dan `dispatchLocalNotification()`.
  - Simpan status preferensi ke `localStorage` (`amelia_notif_enabled`).

- [x] **Step 2: Buat modal dialog `NotificationPromptModal.tsx`**
  - Desain modal sopan dan transparan yang menjelaskan keuntungan notifikasi:
    - Pengingat jadwal konseling 1 jam sebelum sesi.
    - Pemberitahuan saat tanggapan curhat telah diterbitkan oleh Kak Amel.
    - Update artikel kesehatan mental terbaru.
  - Tombol "Aktifkan Notifikasi" dan "Nanti Saja".

- [x] **Step 3: Integrasikan dengan `PwaLifecycle.tsx`**
  - Berikan trigger lokal saat pemesanan jadwal berhasil dibuat agar user menerima notifikasi konfirmasi di browser/PWA mereka.

---

### Task 4: Mobile Topic Explorer di Dalam Artikel (`/articles/[slug]`)

**Files:**
- Create: `src/components/articles/ArticleMobileTopicExplorer.tsx`
- Modify: `src/app/articles/[slug]/page.tsx`

**Interfaces:**
- Props: `{ currentCategory: string }`

- [x] **Step 1: Buat komponen `ArticleMobileTopicExplorer.tsx`**
  - Desain container khusus mobile (`block lg:hidden`):
    - Header: Ikon `Compass`, judul "Fokus Topik & Jelajahi Kategori".
    - Deskripsi singkat mengenai kategori yang baru saja dibaca.
    - Chip daftar kategori lain (`ARTICLE_CATEGORIES` selain kategori aktif) yang dapat diklik langsung mengarah ke `/articles?kategori=[Cat]`.
    - Tombol aksi sekunder: `"Lihat Seluruh Direktori Artikel →"`.
    - Styling senada dengan kartu desain sistem (`bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl p-4.5 sm:p-5 shadow-xs`).

- [x] **Step 2: Sisipkan pada `src/app/articles/[slug]/page.tsx`**
  - Letakkan di bawah `ArticleShareBar` sebelum bagian *Tulisan Refleksi Terkait*.
  - Pembaca mobile kini dapat langsung berganti topik setelah selesai membaca tanpa harus kembali/scroll ke paling atas.

---

### Task 5: Fitur Article View Counter ("Dilihat X Kali")

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/db/schema.ts`
- Modify: `src/lib/data-store.ts`
- Create: `src/app/api/articles/view/route.ts`
- Create: `src/components/articles/ArticleViewTracker.tsx`
- Modify: `src/components/articles/ArticleHeader.tsx`
- Modify: `src/components/admin/articles/ArticleCard.tsx`

**Interfaces:**
- In `types/index.ts`: Tambahkan `views?: number` pada `Article`.
- Endpoint `POST /api/articles/view`: menerima `{ slug: string }`, mengembalikan `{ views: number }`.

- [x] **Step 1: Perbarui tipe data dan schema database**
  - Tambahkan `views?: number;` pada interface `Article`.
  - Tambahkan `views: integer('views').notNull().default(0)` pada `articles` di `src/db/schema.ts`.
  - Perbarui default data di `src/lib/data-store.ts` dan `data/db.json` dengan angka view awal yang realistis (misal 45 - 280 views).

- [x] **Step 2: Buat fungsi `incrementArticleViews(slug: string)` di `src/lib/data-store.ts`**
  - Update counter di PostgreSQL (atau in-memory fallback) dan kembalikan angka terbaru.

- [x] **Step 3: Buat endpoint `POST /api/articles/view`**
  - Menerima payload slug dan menambah hitungan view secara aman.

- [x] **Step 4: Buat komponen client `ArticleViewTracker.tsx`**
  - Mengirim POST ke `/api/articles/view` hanya jika `sessionStorage.getItem('viewed_' + slug)` belum ada.
  - Mencegah spam kalkulasi berlebih saat user me-refresh berulang kali.

- [x] **Step 5: Tampilkan view count pada UI**
  - Di `ArticleHeader.tsx`: Tambahkan chip `<span className="inline-flex items-center gap-1 text-[var(--color-ink-soft)]"><Eye className="w-3.5 h-3.5" /><span>{views} kali dibaca</span></span>`.
  - Di `ArticleCard.tsx` (Admin): Tampilkan badge view count agar admin mengetahui artikel mana yang paling populer.

---

### Task 6: Sistem Foto Sampul Artikel (Cover Image, Upload Drag-and-Drop & Curated Gallery)

**Files:**
- Create: `public/images/articles/` (aset kurasi WebP untuk 6 kategori)
- Create: `src/app/api/upload/route.ts`
- Modify: `src/types/index.ts`
- Modify: `src/db/schema.ts`
- Modify: `src/lib/data-store.ts`
- Modify: `src/components/admin/articles/ArticleFormModal.tsx`
- Modify: `src/app/articles/[slug]/page.tsx`
- Modify: `src/components/articles/ArticleHeader.tsx`

**Interfaces:**
- In `types/index.ts`: Tambahkan `coverImage?: string;` pada `Article`.
- Endpoint `POST /api/upload`: menerima FormData dengan file gambar (PNG, JPG, WebP), menyimpan ke `public/images/articles/`, mengembalikan `{ url: string }`.

- [x] **Step 1: Siapkan aset gambar kurasi untuk 6 kategori artikel**
  - Tambahkan file WebP berkualitas tinggi di `public/images/articles/`:
    - `mental-health.webp` (Kesehatan Mental Islami)
    - `overthinking.webp` (Manajemen Emosi & Overthinking)
    - `relationships.webp` (Hubungan, Pertemanan & Pasangan)
    - `academic.webp` (Akademik, Karier & Produktivitas)
    - `self-growth.webp` (Quarter-Life Crisis & Self Growth)
    - `counseling.webp` (Cyber Counseling & Edukasi Sebaya)
  - Hubungkan sebagai default `coverImage` pada artikel-artikel yang ada di `data/db.json` dan `fallbackArticles`.

- [x] **Step 2: Buat route handler `/api/upload`**
  - Terima upload file dengan validasi tipe mime (image/*) dan ukuran maks 4MB.
  - Simpan dengan nama unik di `public/images/articles/`.
  - Kembalikan path URL statis publik.

- [x] **Step 3: Tambahkan input foto sampul di `ArticleFormModal.tsx` (Admin)**
  - Tambahkan state `coverImage`.
  - Buat 3 opsi pemilihan yang nyaman:
    1. **Drag & Drop Upload Area**: Kotak drop responsif dengan indikator hover, progress, dan tombol pilih file.
    2. **Pilih dari Galeri Kurasi**: Grid thumbnail gambar bawaan untuk 6 tema konseling yang dapat dipilih dengan 1 klik.
    3. **Input URL**: Memasukkan link gambar eksternal jika diperlukan.
  - Thumbnail preview gambar aktif dengan tombol "Ganti" dan "Hapus Foto".

- [x] **Step 4: Render foto sampul di halaman detail artikel (`/articles/[slug]`)**
  - Render banner hero gambar di atas atau di bawah `ArticleHeader`:
    ```tsx
    {article.coverImage && (
      <div className="relative aspect-video sm:aspect-21/9 w-full rounded-2xl overflow-hidden mb-8 border border-[var(--color-paper-border)] shadow-xs">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 860px"
        />
      </div>
    )}
    ```
  - **PENTING (Aturan Mutlak Pengguna)**: Pastikan foto sampul TIDAK dirender pada kartu listing `/articles` ([ArticleListItem.tsx](file:///d:/Hajaturrachman/amelia-portofolio/src/components/articles/ArticleListItem.tsx)) maupun kartu beranda ([ArticlesPreviewSection.tsx](file:///d:/Hajaturrachman/amelia-portofolio/src/components/home/ArticlesPreviewSection.tsx)).

---

### Task 7: Eliminasi Kedipan Foto Profil Amel di Halaman Artikel

**Files:**
- Modify: `src/components/articles/ArticleHeader.tsx:20-32`
- Modify: `src/components/articles/ArticleSidebar.tsx:14-25`
- Modify: `src/app/articles/[slug]/page.tsx`

- [x] **Step 1: Pasang `unoptimized` dan background solid pada avatar Amel**
  - Di `ArticleHeader.tsx`:
    Tambahkan `unoptimized` pada `<Image src="/amelia.webp" ... unoptimized />`.
    Karena `/amelia.webp` adalah aset statis lokal yang sudah teroptimasi (< 30KB), bypass Next optimizer mencegah fetch sekunder yang menyebabkan kedip sesaat.
  - Di `ArticleSidebar.tsx`:
    Terapkan hal yang sama dengan `unoptimized` dan background wrapper `bg-[var(--color-surface)]`.

- [x] **Step 2: Pasang preloading link avatar**
  - Pastikan browser memprioritaskan pemuatan awal aset `/amelia.webp`.

---

### Task 8: Verifikasi Menyeluruh (End-to-End Build & Testing)

**Files:**
- All files touched in Tasks 1–7.

- [x] **Step 1: Jalankan Typecheck & Build Project**
  - Jalankan `pnpm build` untuk memvalidasi bahwa seluruh 41 rute sukses terkompilasi tanpa error TypeScript maupun bundling.
- [x] **Step 2: Verifikasi Alur Fungsional**
  - Verifikasi alur kirim email Resend saat reservasi dan curhat.
  - Verifikasi tab title berubah santun saat user keluar tab.
  - Verifikasi mobile topic explorer di viewport mobile pada artikel.
  - Verifikasi view counter bertambah dan tidak spam.
  - Verifikasi gambar artikel tampil di detail dan TIDAK tampil di direktori `/articles`.
  - Verifikasi foto profil Amel mulus tanpa kedip.
