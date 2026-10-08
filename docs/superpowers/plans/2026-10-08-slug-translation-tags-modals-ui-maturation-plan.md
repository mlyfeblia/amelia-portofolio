# Implementation Plan: Translasi Slug Murni, Tagar Otomatis, Auto-Kapitalisasi, Z-Index Modal, Slider Desktop & Standardisasi Tombol

**Tujuan Proyek:** Menyelesaikan tuntas seluruh audit revisi: perbaikan z-index modal hapus draf yang tertumpuk, modal konfirmasi reset draf, sistem tagar otomatis dinamis per kategori (default 5 tagar fleksibel), otomasi kapitalisasi huruf (Title Case & Sentence Case), pipeline translasi slug murni (Indonesia $\rightarrow$ English $\rightarrow$ `@sindresorhus/slugify`), kebijakan upload WebP pintar, standardisasi pembungkus tombol pill container menyeluruh, kontrol navigasi slider desktop, perbaikan bug autofill PIN admin, dan penyeragaman ukuran tombol admin.

**Waktu Rilis:** 8 Oktober 2026  
**Metodologi:** Subagent-Driven Development (Satu subagent per tugas terisolasi, diverifikasi berkala).

---

## Ringkasan Masalah & Solusi Arsitektural

| No | Modul | Akar Masalah | Solusi Terpilih |
| :--- | :--- | :--- | :--- |
| 1 | **Z-Index Modal Hapus Draf** | `ConfirmDecisionModal` memiliki `z-[9999]`, lebih rendah dari `ArticleDraftsModal` (`z-[10000]`), sehingga dialog konfirmasi render di belakang modal draf. | Tingkatkan z-index `ConfirmDecisionModal` ke `z-[11000]` dengan parameter `zIndex` opsional agar selalu berada di layer teratas. |
| 2 | **Modal Konfirmasi Reset Draf** | "Reset Draf" sebelumnya berupa inline box di dalam form artikel. | Ganti inline box dengan `ConfirmDecisionModal` terpadu dengan varian peringatan bahaya (`danger`). |
| 3 | **Tagar Otomatis per Kategori** | Tagar artikel berupa teks string koma statis, tidak otomatis menyesuaikan kategori dan tidak fleksibel. | Bangun sistem `TagChipsInput` dengan preset 5 tagar default per kategori BKI, chip interaktif yang bisa ditambah/dihapus dengan 1 klik, dan opsi reset ke default kategori. |
| 4 | **Otomasi Kapitalisasi Huruf** | Judul sering diketik huruf kecil semua; setelah tanda baca (. ? !) tidak ada kapitalisasi otomatis. | Bangun `src/lib/text-formatter.ts`: fungsi `formatIndonesianTitleCase` (sesuai EYD/PUEBI, huruf pertama kapital kecuali kata tugas) dan `formatSentenceCase` (kapital setelah titik/tanda tanya/seru). |
| 5 | **Slug Translasi Murni** | Pengguna menginginkan slug berupa terjemahan murni judul Indonesia $\rightarrow$ English tanpa pemangkasan 5–7 kata. | Integrasikan `@sindresorhus/slugify` dengan pipeline translasi multi-provider (Google Cloud/MyMemory Translation API + offline dictionary fallback) via route `/api/translate`. |
| 6 | **Kebijakan Unggah Gambar WebP** | File WebP kecil yang sudah terkompresi tidak perlu di-encode ulang dengan Sharp. | Pada `/api/upload/route.ts`: jika berkas sudah WebP dan $\le 500\text{ KB}$, simpan langsung tanpa re-encoding (0ms CPU, lossless). Jika format lain/besar, optimasi ke WebP. |
| 7 | **Standardisasi Pembungkus Tombol** | Tautan aksi di publik ("Lihat profil lengkap", "Kenali sosok Amel", "Lihat rincian layanan", "Pilih format", "Konsultasikan", "Lihat rekomendasi") masih polos. | Bungkus seluruh tautan aksi menjadi pill container berbingkai (`btn-secondary btn-interactive` atau framed pill dengan border dan shadow halus). |
| 8 | **Slider Horizontal di Desktop** | Desktop memakai mouse tanpa touch gesture; tidak ada tombol panah slider dan scrollbar disembunyikan. | Tambahkan tombol panah navigasi Kiri & Kanan di desktop pada `CurhatWall` dan `ArticlesDirectory`, lengkapi dengan mouse drag scroll dan wheel horizontal. |
| 9 | **Bug Autofill PIN Pengelola** | Browser password manager mengisi PIN otomatis karena `autoComplete="current-password"`. | Ganti dengan `autoComplete="off"`, tambahkan `data-lpignore="true"` dan `name="counselor_auth_pin"`, serta pastikan state PIN di-reset bersih saat logout/timeout. |
| 10 | **Ukuran Tombol Header Admin** | Tombol "Tambah Artikel Baru" memiliki dimensi lebih besar dari tombol "Segarkan" dan "Kotak Draf". | Samakan tinggi, padding horizontal, ukuran font, dan ukuran ikon ketiga tombol menjadi seragam di `ArticleHeader.tsx`. |

---

## Rincian Rencana Pengerjaan (Task per Task)

### Task 1: Perbaikan Z-Index Modal Hapus Draf & Konfirmasi Modal Reset Draf
**Files:**
- Modify: `src/components/ui/ConfirmDecisionModal.tsx`
- Modify: `src/components/admin/articles/ArticleFormModal.tsx`

**Langkah Pengerjaan:**
- [x] **Step 1: Tingkatkan z-index `ConfirmDecisionModal.tsx` ke `z-[11000]`**
  - Ubah class wrapper portal dari `z-[9999]` menjadi `z-[11000]`.
  - Tambahkan prop opsional `zIndex?: string` untuk fleksibilitas susunan stacking layer.
- [x] **Step 2: Ubah inline reset draft di `ArticleFormModal.tsx` menjadi `ConfirmDecisionModal`**
  - Hapus inline red box `isResetConfirmOpen`.
  - Sambungkan tombol "Reset Draf" dengan `ConfirmDecisionModal`:
    - Judul: "Hapus dan Reset Draf Lokal?"
    - Deskripsi: "Semua perubahan teks, kategori, dan foto pada draf ini akan dihapus dan dikembalikan ke kondisi awal."
    - Varian: `danger`.
    - Konfirmasi: "Ya, Reset Draf".

---

### Task 2: Sistem Tagar Otomatis per Kategori (Default 5 Tagar, Fleksibel Tambah/Kurang)
**Files:**
- Create: `src/data/category-tags.ts`
- Create: `src/components/admin/articles/TagChipsInput.tsx`
- Modify: `src/components/admin/articles/ArticleFormModal.tsx`

**Langkah Pengerjaan:**
- [x] **Step 1: Definisikan preset 5 tagar default per kategori di `src/data/category-tags.ts`**
  - 'Kesehatan Mental Islami': `['Thuma\'ninah', 'Tazkiyatun Nafs', 'Kesehatan Mental', 'BKI', 'Ketenangan Batin']`
  - 'Manajemen Emosi & Overthinking': `['Regulasi Emosi', 'Overthinking', 'Manajemen Stres', 'Mindfulness', 'Sabar & Solat']`
  - 'Hubungan, Pertemanan & Pasangan': `['Komunikasi Asertif', 'Empati', 'Relasi Sehat', 'Keluarga', 'Ruang Dengar']`
  - 'Akademik, Karier & Produktivitas': `['Academic Burnout', 'Manajemen Waktu', 'Tips Mahasiswa', 'Fokus Belajar', 'Produktivitas']`
  - 'Quarter-Life Crisis & Self Growth': `['Quarter-Life Crisis', 'Arah Hidup', 'Pencarian Jati Diri', 'Tawakkal', 'Self Growth']`
  - 'Cyber Counseling & Edukasi Sebaya': `['Cyber Counseling', 'Konselor Sebaya', 'Ruang Aman', 'Etika Konseling', 'Edukasi Sebaya']`
- [x] **Step 2: Buat komponen `TagChipsInput.tsx`**
  - Menampilkan daftar tagar dalam pill chip berbingkai (dengan tombol `x` untuk menghapus tag).
  - Input teks inline untuk mengetik tagar baru (tekan Enter atau klik "+ Tambah Tagar").
  - Tombol pintas "Kembalikan 5 Tagar Bawaan Kategori".
- [x] **Step 3: Integrasikan ke `ArticleFormModal.tsx`**
  - Saat kategori dipilih (dan tagar belum diubah secara khusus), otomatis pasang 5 tagar default kategori tersebut.

---

### Task 3: Sistem Otomatisasi Huruf Kapital (Title Case & Sentence Auto-Correction)
**Files:**
- Create: `src/lib/text-formatter.ts`
- Modify: `src/components/admin/articles/ArticleFormModal.tsx`
- Modify: `src/components/BookingSection.tsx`
- Modify: `src/components/counseling/CurhatForm.tsx`

**Langkah Pengerjaan:**
- [x] **Step 1: Buat modul `src/lib/text-formatter.ts`**
  - `formatIndonesianTitleCase(text: string): string`:
    - Mengubah huruf pertama setiap kata menjadi kapital.
    - Kata tugas / konjungsi (*dan, di, ke, dari, pada, dalam, untuk, dengan, atau, yang, etc.*) tetap huruf kecil kecuali di awal kalimat atau setelah tanda baca titik dua `:`, strip `-`, atau tanda kutip.
    - Menjaga akronim psikologi/akademik (*CBT, BKI, UIN, etc.*).
  - `formatSentenceCase(text: string): string`:
    - Huruf pertama setelah tanda titik `. `, tanda tanya `? `, atau tanda seru `! ` otomatis diubah menjadi huruf kapital.
  - `formatPersonName(name: string): string`:
    - Mengubah setiap kata nama orang menjadi huruf kapital diawali huruf besar (*ahmad fauzi $\rightarrow$ Ahmad Fauzi*).
- [x] **Step 2: Pasang pada form input di seluruh website**
  - Pada input Judul Artikel (`ArticleFormModal.tsx`): otomatis format ke Title Case saat diketik atau onBlur.
  - Pada textarea Ringkasan & Konten: otomatis kapitalisasi huruf pertama setelah titik.
  - Pada form Booking & Curhat: otomatis Title Case pada nama konseli / alias.

---

### Task 4: Sistem Slug Translasi Murni (Indonesia $\rightarrow$ English $\rightarrow$ `@sindresorhus/slugify`)
**Files:**
- Create: `src/app/api/translate/route.ts`
- Modify: `src/lib/slug-generator.ts`
- Modify: `src/components/admin/articles/ArticleFormModal.tsx`

**Langkah Pengerjaan:**
- [x] **Step 1: Buat route `/api/translate/route.ts`**
  - Endpoint POST menerima `{ text: string }`.
  - Menerjemahkan kalimat bahasa Indonesia ke bahasa Inggris murni secara akurat menggunakan API translasi (MyMemory / LibreTranslate) dengan fallback kamus offline.
  - Mengubah hasil terjemahan bahasa Inggris menjadi slug URL menggunakan `@sindresorhus/slugify`.
  - Mengembalikan `{ success: true, translatedText: string, slug: string }`.
- [x] **Step 2: Sinkronkan generator slug di `src/lib/slug-generator.ts`**
  - Menggunakan `@sindresorhus/slugify` untuk slugifikasi baku.
  - Menyediakan fungsi async `generateTranslatedArticleSlug(title: string): Promise<string>`.
- [x] **Step 3: Hubungkan ke `ArticleFormModal.tsx`**
  - Saat judul artikel diketik (dengan debounce 500ms), otomatis panggil `/api/translate` untuk memperbarui slug bahasa Inggris murni secara real-time.

---

### Task 5: Kebijakan Unggah Gambar WebP Pintar (Preserve Small WebP)
**Files:**
- Modify: `src/app/api/upload/route.ts`

**Langkah Pengerjaan:**
- [x] **Step 1: Cek format dan ukuran sebelum re-encoding**
  - Jika `file.type === 'image/webp'` dan `file.size <= 500 * 1024` (500 KB):
    - Simpan langsung buffer WebP asli ke disk dengan nama bersih sanitasi tanpa melalui kompresi ulang Sharp.
  - Jika format selain WebP atau ukuran $> 500\text{ KB}$:
    - Jalankan Sharp resize & WebP converter.

---

### Task 6: Standardisasi Menyeluruh Pembungkus Tombol (Pill Containers)
**Files:**
- Modify: `src/components/home/TrackRecordSection.tsx`
- Modify: `src/components/home/ApproachSection.tsx`
- Modify: `src/components/home/ServicesSection.tsx`
- Modify: `src/components/services/ServicesFormats.tsx`
- Modify: `src/components/assessment/AssessmentHistory.tsx`
- Modify: `src/components/admin/articles/ArticleHeader.tsx`

**Langkah Pengerjaan:**
- [x] **Step 1: Bungkus tombol-tombol spesifik permintaan pengguna**
  - `TrackRecordSection.tsx`: "Lihat profil lengkap di Tentang" $\rightarrow$ framed pill button.
  - `ApproachSection.tsx`: "Kenali lebih dekat sosok Amel" $\rightarrow$ framed pill button.
  - `ServicesSection.tsx`: "Lihat rincian layanan lengkap" $\rightarrow$ framed pill button.
  - `ServicesFormats.tsx`: "Pilih format $\rightarrow$" $\rightarrow$ framed pill button (`btn-secondary btn-interactive`).
  - `AssessmentHistory.tsx`: "Lihat Rekomendasi & Catatan Lengkap" dan "Konsultasikan" $\rightarrow$ framed pill button.
- [x] **Step 2: Seragamkan ukuran tombol di `ArticleHeader.tsx`**
  - Sesuaikan tombol "Tambah Artikel Baru" agar dimensinya identik dan serasi dengan tombol "Segarkan" dan "Kotak Draf" (`px-2.5 min-[340px]:px-3 py-2 text-xs font-semibold`).

---

### Task 7: UI/UX Slider Horizontal di Desktop (Panah Navigasi & Drag/Wheel)
**Files:**
- Modify: `src/components/counseling/CurhatWall.tsx`
- Modify: `src/components/articles/ArticlesDirectory.tsx`

**Langkah Pengerjaan:**
- [x] **Step 1: Tambahkan tombol panah geser Kiri & Kanan di desktop**
  - Tambahkan tombol panah melayang lembut (`ChevronLeft`, `ChevronRight`) yang muncul di tepi kiri & kanan slider pada layar desktop saat konten meluap.
  - Klik panah kiri menggeser -200px, panah kanan menggeser +200px secara halus (`behavior: 'smooth'`).
- [x] **Step 2: Dukungan mouse wheel horizontal & drag cursor**
  - Izinkan scroll wheel vertikal di atas area kategori tabs untuk menggeser secara horizontal (`deltaY $\rightarrow$ scrollLeft`).

---

### Task 8: Perbaikan Bug PIN Terisi Otomatis Pasca Timeout/Ganti Tab
**Files:**
- Modify: `src/context/AdminAuthContext.tsx`

**Langkah Pengerjaan:**
- [x] **Step 1: Bersihkan autofill browser password manager pada input PIN**
  - Ganti `autoComplete="current-password"` menjadi `autoComplete="off"`.
  - Tambahkan atribut `data-lpignore="true"` dan `name="counselor_auth_pin"`.
  - Pastikan state `pin` selalu di-reset ke string kosong `''` setiap kali `isAuthenticated` berubah menjadi `false` atau sesi kedaluwarsa.

---

### Task 9: Verifikasi Menyeluruh & Uji Produksi (`pnpm build`)
**Files:**
- Seluruh file yang dimodifikasi.

**Langkah Pengerjaan:**
- [x] **Step 1: Uji Typecheck & Build Produksi**
  - Jalankan `pnpm build` untuk memverifikasi 43/43 rute sukses terkompilasi tanpa error.
- [x] **Step 2: Verifikasi Fungsional di Browser**
  - Uji modal draf & konfirmasi hapus (tidak saling menumpuk).
  - Uji auto-kapitalisasi judul artikel.
  - Uji pembuatan slug via terjemahan murni `@sindresorhus/slugify`.
  - Uji tombol panah slider desktop dan form PIN login admin.
