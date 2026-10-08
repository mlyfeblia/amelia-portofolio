# Article Form Overhaul, Resend Maturation, Decision Modals & Mobile Refinement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mematangkan sistem notifikasi Resend (sesuai guardrails resmi SDK Resend dengan idempotency & plain-text fallback), menyempurnakan perilaku tab visibility (menghapus emoji pada judul jeda), merapikan tombol direktori dan lencana titik aktif pada penjelajah topik mobile di 320px, mematangkan pemicu penghitung bacaan (*dwell time & scroll*), merombak modal artikel admin (hapus input URL gambar, hapus seluruh ikon sparkles, sembunyikan slug dan jadikan otomatis dalam bahasa Inggris, dropdown select kategori, default galeri kurasi 9 tema, drag & drop prioritas, tanda bintang merah, sistem auto-drafting), mengganti ikon WhatsApp menjadi outline, menyelaraskan seluruh artikel yang ada di database, serta membangun sistem modal konfirmasi (*decision modals*) untuk semua aksi penting di web publik dan admin.

**Architecture:**
1. **Resend Email Maturation:** Menerapkan standar resmi Node.js Resend SDK: idempotency key unik (`booking-confirm/${id}`), tag pelacak, plain-text fallback (`text`), error handling `{ data, error }`, dan parameter camelCase.
2. **Mobile & View Counter Ergonomics:** Menghilangkan emoji dari `TabVisibilityManager` (`Ambil jeda sejenak... | Amelia BKI`). Menata ulang metadata header artikel agar tidak berdesakan di 320px, dan mematangkan logika kenaikan view counter berbasis *dwell time* (pembacaan aktif >= 4 detik atau scroll >= 15%) dengan `sessionStorage` deduplication.
3. **Admin Article Editor Overhaul (`ArticleFormModal.tsx`):** Menghapus tab input URL eksternal, mengganti ikon sparkles dengan ikon palet/galeri (larangan total ikon sparkles), menyembunyikan input slug dengan generator otomatis berbahasa Inggris (*smart semantic slug*), mengganti kategori menjadi dropdown `<select>`, menambahkan 3 galeri kurasi baru (total 9 presets WebP ringan), memprioritaskan upload drag & drop, memberikan indikator bintang merah, auto-calculate waktu baca, dan sistem draf otomatis dengan tombol reset berkonfirmasi.
4. **Universal Decision Modals:** Membangun `ConfirmDecisionModal.tsx` terpadu untuk keputusan penting: konfirmasi/batal status booking di admin, logout sesi admin, perubahan visibilitas artikel/curhat, dan reset draf artikel.
5. **Visual Branding:** Mengganti ikon WhatsApp di baris share artikel dengan versi *outline/stroke* elegan (bukan solid fill).

**Tech Stack:** Next.js 16.3 (App Router), React 19, TypeScript, Resend Node.js SDK, Tailwind CSS v4, Lucide React icons, Serwist PWA, Drizzle ORM.

## Global Constraints

- Sesuai instruksi pengguna: **TIDAK BOLEH ADA IKON SPARKLES DI SELURUH WEBSITE INI**.
- Slug artikel disembunyikan dari antarmuka input dan wajib dibuat otomatis menggunakan bahasa Inggris berdasarkan judul artikel.
- Foto sampul artikel hanya muncul di dalam halaman detail artikel (`/articles/[slug]`), TIDAK muncul di daftar `/articles` atau beranda.
- Judul jeda tab browser: `Ambil jeda sejenak... | Amelia BKI` (tanpa emoji).
- Input kategori artikel wajib menggunakan sistem Select Dropdown.
- Tanda wajib diisi menggunakan bintang merah `*` tanpa teks "wajib" / "opsional".
- Ikon WhatsApp di baris share artikel wajib bertipe *outline* (bukan fill).
- Build Next.js (`pnpm build`) harus sukses bersih dengan 0 error di seluruh rute.

---

### Task 1: Pemurnian Tab Visibility Title & Pematangan SDK Resend

**Files:**
- Modify: `src/components/TabVisibilityManager.tsx`
- Modify: `src/lib/resend.ts`

**Interfaces:**
- Produces: Resend dispatching dengan `idempotencyKey`, `tags`, dan `text` plain text fallback.

- [x] **Step 1: Hapus emoji dari judul tab jeda di `TabVisibilityManager.tsx`**
  - Ubah `const PAUSE_TITLE = '✨ Ambil jeda sejenak... | Amelia BKI';` menjadi:
    `const PAUSE_TITLE = 'Ambil jeda sejenak... | Amelia BKI';`
  - Pastikan judul tab browser berganti bersih tanpa karakter emoji.

- [x] **Step 2: Matangkan implementasi Resend di `src/lib/resend.ts` sesuai pedoman resmi**
  - Pasang `idempotencyKey` pada seluruh fungsi pengiriman email:
    - `booking-confirm/${booking.id}` untuk email konfirmasi konseli.
    - `booking-alert/${booking.id}` untuk email alert admin booking.
    - `curhat-alert/${curhat.id}` untuk email alert admin curhat.
  - Tambahkan parameter `text` (versi teks polos) di samping `html` untuk menjamin deliverability 100% dan lolos filter spam.
  - Tambahkan metadata `tags`:
    - `[{ name: 'category', value: 'booking-confirmation' }, { name: 'booking_code', value: booking.code }]`.
    - `[{ name: 'category', value: 'admin-alert' }, { name: 'type', value: 'booking' }]`.
    - `[{ name: 'category', value: 'admin-alert' }, { name: 'type', value: 'curhat' }]`.
  - Pastikan pattern `{ data, error }` ditangani tanpa anti-pattern `try/catch` redundan pada pemanggilan API SDK.

---

### Task 2: Perapihan Penjelajah Topik Mobile & Pematangan Article View Counter (< 320px)

**Files:**
- Modify: `src/components/articles/ArticleMobileTopicExplorer.tsx`
- Modify: `src/components/articles/ArticleHeader.tsx`
- Modify: `src/components/articles/ArticleViewTracker.tsx`

**Interfaces:**
- Produces: Logika kenaikan view counter berbasis waktu baca aktif (*dwell time >= 4s* atau scroll >= 15%) dan layout metadata artikel yang rapi pada 320px.

- [x] **Step 1: Rapikan tombol direktori dan ganti badge kategori aktif di `ArticleMobileTopicExplorer.tsx`**
  - Pada kategori aktif: Hapus badge bertuliskan `"Sedang Dibaca"`. Gantikan dengan ikon titik status halus:
    ```tsx
    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" aria-hidden="true" />
    ```
    mirip dengan indikator navigasi aktif pada mobile navbar.
  - Pada tombol pintas direktori artikel (baris 62-69):
    Sesuaikan padding, font-size, dan struktur flex agar tidak terhimpit di 320px:
    `py-2.5 px-3 text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-1.5 w-full text-center truncate`
    dengan teks rapi: `"Jelajahi Direktori Artikel"`.

- [x] **Step 2: Tata ulang posisi dan struktur baris Article View Counter di `ArticleHeader.tsx`**
  - Pecah/bungkus metadata row menjadi fleksibel:
    ```tsx
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-[var(--color-ink-muted)]">
      {/* Date & Read Time */}
      <span className="inline-flex items-center gap-2">
        <time dateTime={...}>{article.publishedAt}</time>
        <span className="text-[var(--color-paper-border)]">•</span>
        <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{article.readTime}</span>
      </span>
      <span className="text-[var(--color-paper-border)] hidden min-[340px]:inline">•</span>
      {/* View Counter Badge */}
      <ArticleViewTracker slug={article.slug} initialViews={article.views ?? 0} />
    </div>
    ```
  - Pada viewport < 320px, badge view counter akan turun secara alami ke baris baru yang rapi tanpa menekan tanggal dan estimasi waktu baca.

- [x] **Step 3: Matangkan logika kenaikan View Counter di `ArticleViewTracker.tsx`**
  - Ubah mekanisme agar TIDAK langsung bertambah saat halaman baru dimuat (mencegah klik sesaat/bounce terhitung sebagai pembacaan).
  - Terapkan syarat pembacaan nyata:
    - Pengguna bertahan membaca di halaman selama minimal 4 detik (`setTimeout`), ATAU
    - Pengguna melakukan scroll hingga melewati 15% tinggi artikel.
  - Setelah salah satu syarat terpenuhi dan `sessionStorage.getItem('viewed_art_' + slug)` belum ada, kirim request `POST /api/articles/view` dan tandai session storage.

---

### Task 3: Ikon WhatsApp Outline & Pembersihan Total Ikon Sparkles

**Files:**
- Modify: `src/components/articles/ArticleShareBar.tsx`
- Modify: `src/components/admin/articles/ArticleFormModal.tsx`
- Audit: Seluruh file di `src/`

**Interfaces:**
- Produces: Zero occurrences of `Sparkles` icon across codebase and crisp outline WhatsApp icon in share bar.

- [x] **Step 1: Ganti ikon WhatsApp menjadi versi outline di `ArticleShareBar.tsx`**
  - Ganti path SVG WhatsApp fill dengan SVG outline/stroke modern:
    ```tsx
    <svg
      className="w-3.5 h-3.5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <path d="M9.5 9.5c.3-.5.7-.5 1 0l1 1.8c.2.4.1.8-.2 1.1l-.5.5c.6 1.1 1.5 2 2.6 2.6l.5-.5c.3-.3.7-.4 1.1-.2l1.8 1c.5.3.5.7 0 1-.7.6-1.5.8-2.3.5-2.2-.8-4.2-2.8-5-5-.3-.8-.1-1.6.5-2.3z" />
    </svg>
    ```

- [x] **Step 2: Hapus dan ganti ikon `Sparkles` di seluruh proyek**
  - Di `ArticleFormModal.tsx`: ganti import `Sparkles` dan penggunaannya pada tab galeri dengan ikon `Images` atau `Palette`.
  - Verifikasi dengan pencarian teks bahwa tidak ada lagi simbol/ikon `Sparkles` di seluruh kode.

---

### Task 4: Perombakan Modal Artikel Admin (`ArticleFormModal.tsx`)

**Files:**
- Create: `src/lib/slug-generator.ts` (otomatisasi pembuatan slug bahasa Inggris dari judul)
- Modify: `src/data/curated-article-images.ts` (tambah 3 preset baru = total 9)
- Modify: `public/images/articles/` (tambah aset WebP baru)
- Modify: `src/components/admin/articles/ArticleFormModal.tsx`

**Interfaces:**
- Produces: Editor artikel admin teroptimasi dengan sistem otomatisasi, select kategori, draf, dan auto-slug Inggris.

- [x] **Step 1: Buat modul `src/lib/slug-generator.ts`**
  - Buat fungsi `generateEnglishArticleSlug(indonesianTitle: string): string` yang cerdas menerjemahkan kata kunci psikologi/BKI Indonesia ke bahasa Inggris:
    - *Cara Menemukan* -> *how-to-find*
    - *Ketenangan Batin* -> *inner-peace*
    - *Mengatasi* -> *overcoming*
    - *Kesehatan Mental* -> *mental-health*
    - *Overthinking* -> *overthinking*
    - *Luka Batin / Inner Child* -> *inner-child-healing*
    - *Regulasi Emosi* -> *emotional-regulation*
    - *Komunikasi Orang Tua* -> *family-communication*
    - *Academic Burnout* -> *academic-burnout*
    - Fallback: slugifikasi kata-kata yang bersih dan rapi.

- [x] **Step 2: Tambahkan 3 preset galeri kurasi baru (Total 9) di `curated-article-images.ts`**
  - Tambahkan:
    7. `mindfulness-islamic.webp` — Doa & Tafakur Reflektif (Spiritualitas & Ibadah)
    8. `peer-listening.webp` — Sahabat & Konselor Sebaya (Edukasi Sebaya)
    9. `future-hope.webp` — Harapan & Resolusi Masa Depan (Self Growth & Arah Hidup)
  - Generate/salin file WebP ringan (~22KB) ke `public/images/articles/`.

- [x] **Step 3: Rombak antarmuka `ArticleFormModal.tsx`**
  - **Foto Sampul Artikel**:
    - Sederhanakan judul menjadi `"Foto Sampul Artikel"`.
    - Hapus opsi/tab input tautan URL eksternal.
    - Default tampilan aktif: **Galeri Kurasi** (9 pilihan kartu).
    - Saat kategori artikel dipilih, otomatis pre-select foto kurasi yang paling sesuai.
    - Jika pengguna mengunggah foto sendiri (Drag & Drop / Upload file), foto unggahan diprioritaskan sebagai sampul artikel.
  - **Slug URL**:
    - Sembunyikan field input Slug dari antarmuka visual (jadikan tersembunyi `hidden`).
    - Otomatiskan nilainya di background menggunakan `generateEnglishArticleSlug(title)` saat judul diketik (atau pertahankan slug lama jika dalam mode edit).
  - **Kategori**:
    - Ganti label menjadi `"Kategori"`.
    - Ganti elemen input teks menjadi dropdown `<select className="...">` yang memuat seluruh opsi dari `ARTICLE_CATEGORIES`.
  - **Ringkasan**:
    - Ganti label menjadi `"Ringkasan Singkat (Kutipan)"`.
  - **Tanda Field Wajib**:
    - Beri tanda bintang merah `<span className="text-rose-500 font-bold ml-0.5">*</span>` pada field wajib (Judul, Kategori, Estimasi Waktu Baca, Ringkasan, Konten).
    - Hapus tulisan teks manual "wajib" / "opsional".
  - **Otomatisasi Estimasi Waktu Baca**:
    - Otomatis perbarui estimasi waktu baca (`Math.max(1, Math.ceil(wordCount / 200)) + ' menit baca'`) seiring pengguna mengetik konten markdown.
  - **Sistem Draf Lengkap**:
    - Tombol aksi: `"Simpan sebagai Draf"` (menyimpan dengan `isPublished: false`).
    - Indikator real-time: `"Draf tersimpan otomatis pk HH:mm"`.
    - Tombol `"Reset / Hapus Draf"` yang dilengkapi modal konfirmasi dialog.

---

### Task 5: Penyelarasan Seluruh Data Artikel di Database & Seed

**Files:**
- Modify: `data/db.json`
- Modify: `src/lib/data-store.ts`

**Interfaces:**
- Produces: 11 artikel lengkap di `data/db.json` dan `fallbackArticles` dengan foto sampul dari 9 tema kurasi, view count awal yang valid, dan metadata yang konsisten.

- [x] **Step 1: Sinkronkan seluruh 11 artikel ke `data/db.json`**
  - Pastikan semua 11 artikel memiliki `coverImage` yang sesuai dengan kategorinya, `views` awal realistis, dan slug bahasa Inggris yang bersih.
  - Sinkronkan `fallbackArticles` di `src/lib/data-store.ts` agar 100% identik dengan `data/db.json`.

---

### Task 6: Sistem Modal Konfirmasi Universal (*Decision Modals*)

**Files:**
- Create: `src/components/ui/ConfirmDecisionModal.tsx`
- Modify: `src/components/admin/AdminLayoutClient.tsx`
- Modify: `src/components/admin/bookings/BookingCard.tsx`
- Modify: `src/components/admin/counseling/CounselingCard.tsx`
- Modify: `src/components/admin/articles/ArticleCard.tsx`

**Interfaces:**
- Produces: Komponen reusable `ConfirmDecisionModal` dengan animasi transisi, deskripsi risiko/konsekuensi, dan tombol aksi terarah.

- [x] **Step 1: Buat komponen `ConfirmDecisionModal.tsx`**
  - Menerima props:
    ```ts
    interface ConfirmDecisionModalProps {
      isOpen: boolean;
      onClose: () => void;
      onConfirm: () => void;
      title: string;
      description: string;
      confirmLabel?: string;
      cancelLabel?: string;
      variant?: 'danger' | 'warning' | 'primary';
      itemDetail?: React.ReactNode;
      loading?: boolean;
    }
    ```
  - Desain modal berbingkai halus dengan backdrop blur, ikon status (Peringatan/Konfirmasi), dan animasi mount/unmount yang mulus.

- [x] **Step 2: Terapkan pada Keputusan Penting di Admin**
  - **Logout Admin ([AdminLayoutClient.tsx](file:///d:/Hajaturrachman/amelia-portofolio/src/components/admin/AdminLayoutClient.tsx))**:
    Saat tombol "Keluar" diklik, munculkan modal: *"Keluar dari Sesi Admin? Anda perlu memasukkan PIN konselor kembali untuk mengakses panel pengelola."*
  - **Ubah Status Booking ([BookingCard.tsx](file:///d:/Hajaturrachman/amelia-portofolio/src/components/admin/bookings/BookingCard.tsx))**:
    Saat mengonfirmasi ("Konfirmasi"), menyelesaikan ("Selesai"), atau membatalkan ("Batal") jadwal, buka konfirmasi modal dengan rincian nama konseli, waktu sesi, dan status baru.
  - **Ubah Visibilitas Publik/Landing ([ArticleCard.tsx](file:///d:/Hajaturrachman/amelia-portofolio/src/components/admin/articles/ArticleCard.tsx) & [CounselingCard.tsx](file:///d:/Hajaturrachman/amelia-portofolio/src/components/admin/counseling/CounselingCard.tsx))**:
    Beri konfirmasi cepat saat mengubah artikel menjadi draf atau menyembunyikan cerita dari beranda.

---

### Task 7: Verifikasi Menyeluruh & Uji Produksi

**Files:**
- Seluruh file yang diubah pada Tasks 1–6.

- [x] **Step 1: Jalankan Typecheck & Build Project**
  - Jalankan `pnpm build` untuk memvalidasi bahwa seluruh 43 rute sukses terkompilasi tanpa error TypeScript maupun bundling.
- [x] **Step 2: Uji Tampilan Responsif (280px & 320px)**
  - Uji penjelajah topik mobile dan baris metadata view counter di viewport sempit.
  - Pastikan tombol direktori artikel pas dan tidak terpotong.
- [x] **Step 3: Uji Editor Artikel Admin & Modal Konfirmasi**
  - Buka modal tambah/edit artikel: verifikasi slug tersembunyi & otomatis dalam bahasa Inggris, dropdown select kategori, galeri kurasi 9 gambar bawaan, upload drag & drop, tanda bintang merah, serta tombol simpan draf dan modal konfirmasi.
