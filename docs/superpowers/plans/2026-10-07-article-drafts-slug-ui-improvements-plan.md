# Implementation Plan: Sistem Kumpulan Draf, Pematangan Slug & Editor, UI/UX Slider, Auto-PIN & Optimasi < 320px

**Tujuan Proyek:** Melakukan penyempurnaan menyeluruh pada modal artikel (sistem kumpulan draf, pematangan slug generator, sembunyikan estimasi waktu baca, blok semua teks, font alami website, konfirmasi hapus foto sampul), optimasi title browser gambar tab baru, pembersihan ikon WhatsApp share bar, sistem otomatisasi PIN login admin, perbaikan UI/UX slider horizontal dengan auto-scroll tab aktif, standardisasi pembungkus tombol, pematangan aksi janji temu admin, dan optimasi ultra-narrow (< 320px).

**Waktu Rilis:** 7 Oktober 2026  
**Metodologi:** Subagent-Driven Development (Satu subagent per tugas terisolasi, diuji berkala dengan build produksi).

---

## Ringkasan Masalah & Solusi Arsitektural

| Modul | Masalah yang Ditemukan | Solusi yang Diterapkan |
| :--- | :--- | :--- |
| **Sistem Draf Artikel** | Draft hanya 1 file di localStorage, tidak ada tempat/kumpulan draft terorganisir. | Buat sistem **Kotak Kumpulan Draf** (`draft-store.ts` + `ArticleDraftsModal.tsx`) dengan daftar kartu draft, waktu simpan, muat ke editor, dan hapus draf. |
| **Foto Sampul Modal** | Tombol "Ganti" redundan; tombol "Hapus Foto Sampul" tidak punya modal konfirmasi. | Hapus tombol "Ganti". Sambungkan tombol "Hapus Foto Sampul" dengan `ConfirmDecisionModal` peringatan risiko. |
| **Slug Generator** | Slug generator masih ngaco, campuran kata Indo-Inggris, terlalu panjang dan tidak natural. | Rombak `slug-generator.ts` dengan kamus kata & frasa psikologi/BKI yang kaya, pembersihan stopwords, batas panjang optimal, dan translasi baku. |
| **Waktu Baca & Konten** | Estimasi waktu baca tampak di form; tidak ada fitur blok semua; font teks kaku (`font-mono`). | Sembunyikan input waktu baca (otomatis dari kata/180); tambah tombol "Blok Semua" di toolbar; ganti textarea ke `font-sans` elegan situs. |
| **Buka Foto di Tab Baru** | Title browser tab bertuliskan generic `"image"`. | Gunakan `unoptimized` pada gambar WebP artikel detail sehingga URL langsung ke file WebP bermakna; perbaiki penamaan file upload di `/api/upload`. |
| **Ikon WhatsApp Share** | Di tengah balon obrolan ada garis telepon kecil yang aneh. | Hapus garis gagang telepon di dalam path SVG; jadikan outline balon pesan WhatsApp yang bersih dan proporsional. |
| **PIN Login Admin** | Harus pencet tombol submit manual setelah mengisi 6 digit PIN. | Tambahkan auto-submit instan saat 6 digit PIN terisi (`onlyNums.length === 6`), dengan spinner dan penanganan error yang anggun. |
| **Slider / Horizontal Tabs** | Tab terpotong di tepi saat digeser; tab aktif tidak otomatis terlihat/bergeser ke layar. | Pasang smooth scroll container dengan padding yang rapih; gunakan `scrollIntoView({ inline: 'center', behavior: 'smooth' })` pada tab aktif. |
| **Pembungkus Tombol** | Beberapa tombol/tautan aksi di publik & admin masih berupa teks polos tanpa kontainer. | Standarisasi seluruh tombol dengan pill / framed container (`btn-secondary btn-interactive`, border, background, subtle shadow). |
| **Janji Temu Admin** | Alur konfirmasi, selesai, dan batal perlu lebih matang dan informatif. | Perkaya modal keputusan dengan rincian lengkap konseli, feedback toast sukses, dan aksi lanjutan cepat (WhatsApp konfirmasi). |
| **Layar < 320px (< 280px)** | Beberapa tampilan masih berpotensi overflow atau teks bertumpuk. | Audit dan optimasi seluruh breakpoint mobile ke `280px` (Galaxy Fold) dan `320px` (iPhone SE). |

---

## Rincian Tugas & Rencana Kerja

### Task 1: Pembuatan Sistem Kotak Kumpulan Draf Artikel (`draft-store.ts` & `ArticleDraftsModal.tsx`)
**Files:**
- Create: `src/lib/draft-store.ts`
- Create: `src/components/admin/articles/ArticleDraftsModal.tsx`
- Modify: `src/components/admin/articles/ArticleFormModal.tsx`
- Modify: `src/components/admin/articles/ArticleHeader.tsx`

**Langkah Pengerjaan:**
- [x] **Step 1: Buat modul `src/lib/draft-store.ts`**
  - Tipe `ArticleDraftItem`:
    ```ts
    export interface ArticleDraftItem {
      id: string; // 'draft-' + timestamp
      title: string;
      category: string;
      readTime: string;
      excerpt: string;
      content: string;
      tags: string;
      coverImage?: string;
      showOnLandingPage: boolean;
      updatedAt: string; // ISO string
    }
    ```
  - Fungsi: `getSavedDrafts()`, `saveDraft(item)`, `deleteDraft(id)`, `getDraftById(id)`.
- [x] **Step 2: Buat komponen `ArticleDraftsModal.tsx`**
  - Modal berbingkai halus dengan backdrop blur (menggunakan `useModalAnimation`).
  - Menampilkan daftar kartu draf tersimpan: Judul draf, Kategori & Gambar Thumbnail, Tanggal update draf, Jumlah kata/waktu baca, dan Cuplikan kutipan.
  - Aksi per draf: "Lanjutkan Tulis / Muat" (memuat draf ke editor) dan "Hapus" (dengan konfirmasi).
  - Opsi "Tulis Draf Baru" dari awal.
- [x] **Step 3: Integrasikan ke `ArticleFormModal.tsx` dan `ArticleHeader.tsx`**
  - Di `ArticleFormModal.tsx`:
    - Tambahkan tombol "Kumpulan Draf" (dengan badge jumlah draf aktif, misal `Kumpulan Draf (2)`).
    - Tombol "Simpan sebagai Draf" menyimpan draf ke penyimpanan lokal sekaligus mengirim sebagai artikel draft ke API jika diinginkan.
    - Tombol "Draf Baru" untuk mereset formulir secara bersih.
  - Di `ArticleHeader.tsx`:
    - Tambahkan tombol "Kotak Draf" di samping tombol "Tambah Artikel Baru".

---

### Task 2: Penyempurnaan Modal Artikel (Foto Sampul, Estimasi Waktu Baca, Blok Semua & Font Alami)
**Files:**
- Modify: `src/components/admin/articles/ArticleFormModal.tsx`

**Langkah Pengerjaan:**
- [x] **Step 1: Bersihkan foto sampul & buat modal konfirmasi hapus**
  - Hapus tombol "Ganti" pada banner preview foto sampul aktif.
  - Tambahkan konfirmasi `ConfirmDecisionModal` saat tombol "Hapus Foto Sampul" diklik:
    - Judul: "Hapus Foto Sampul Artikel?"
    - Deskripsi: "Foto sampul ini akan dihilangkan dari artikel. Anda dapat memilih kembali dari galeri kurasi atau mengunggah foto baru kapan saja."
    - Varian: `danger`.
- [x] **Step 2: Sembunyikan input estimasi waktu baca & efektifkan perhitungan otomatis**
  - Hapus field input visual untuk estimasi waktu baca dari grid formulir.
  - Simpan `readTime` sebagai state otomatis di latar belakang:
    `const words = content.trim().split(/\s+/).filter(Boolean).length;`
    `const calculated = Math.max(1, Math.ceil(words / 180)) + ' menit baca';`
  - Tampilkan indikator baca di samping label konten markdown: `Estimasi: {formData.readTime} ({wordCount} kata)`.
- [x] **Step 3: Tambahkan tombol "Blok Semua" & ganti font textarea**
  - Tambahkan tombol "Blok Semua" pada toolbar formatting dengan memanggil `contentRef.current.select()`.
  - Ubah class textarea dari `font-mono text-xs` menjadi:
    `font-sans text-xs sm:text-sm text-[var(--color-ink)] leading-relaxed`.

---

### Task 3: Pematangan Slug Generator Bahasa Inggris (`slug-generator.ts`)
**Files:**
- Modify: `src/lib/slug-generator.ts`

**Langkah Pengerjaan:**
- [x] **Step 1: Perkaya kamus kata & frasa psikologi/BKI**
  - Tambahkan ratusan kata kunci: *notifikasi -> notification, riuh -> noise, digital -> digital, rahasia -> privacy, ruang -> space, luka -> wound, batin -> inner, masa kecil -> childhood, orang tua -> parents, asertif -> assertive, friksi -> conflict, antargenerasi -> intergenerational, regulasi -> regulation, didera -> under, tekanan -> pressure, thumaninah -> thumaninah/inner-peace, tazkiyatun-nafs -> purification-of-soul, curhat -> counseling-story, etc.*
- [x] **Step 2: Pembersihan stopwords dan optimasi panjang slug**
  - Hilangkan kata-kata sambung bahasa Indonesia yang tidak bernilai SEO.
  - Batasi panjang maksimal token esensial (5-7 kata kunci padat makna) agar menghasilkan slug bahasa Inggris yang profesional, rapi, dan tidak berantakan.

---

### Task 4: Optimasi Title Browser Tab Gambar & Pembersihan Ikon WhatsApp
**Files:**
- Modify: `src/app/articles/[slug]/page.tsx`
- Modify: `src/app/api/upload/route.ts`
- Modify: `src/components/articles/ArticleShareBar.tsx`

**Langkah Pengerjaan:**
- [x] **Step 1: Atasi title "image" di browser tab baru**
  - Di `src/app/articles/[slug]/page.tsx`:
    - Tambahkan prop `unoptimized` pada `<Image src={article.coverImage} ... unoptimized />`.
    - Ini memastikan elemen `<img>` merujuk langsung ke URL WebP asli (misal `/images/articles/mental-health.webp`). Saat dibuka di tab baru, browser akan menampilkan nama file asli tersebut di judul tab, bukan `"image"` dari route Next.js optimizer.
  - Di `src/app/api/upload/route.ts`:
    - Ubah format nama berkas dari `upload-${timestamp}-${safeId}.webp` menjadi nama asli yang disanitasi: `${cleanBaseName}-${safeId}.webp`.
- [x] **Step 2: Bersihkan ikon WhatsApp di `ArticleShareBar.tsx`**
  - Hapus path telepon di tengah balon obrolan pada SVG.
  - Tampilkan balon percakapan WhatsApp outline yang bersih, elegan, dan proporsional.

---

### Task 5: Sistem Otomatisasi PIN Login Admin (`AdminAuthContext.tsx`)
**Files:**
- Modify: `src/context/AdminAuthContext.tsx`

**Langkah Pengerjaan:**
- [x] **Step 1: Tambahkan auto-login saat 6 digit PIN terisi**
  - Di event `onChange` input PIN:
    - Ketika `onlyNums.length === 6` dan belum `submitting`, otomatis picu `login(onlyNums)`.
  - Tampilkan status loading spinner memverifikasi PIN.
  - Jika PIN salah: picu animasi goyang `animate-shake`, reset nilai PIN, dan tampilkan pesan error yang jelas.

---

### Task 6: UI/UX Slider Horizontal & Auto Scroll Active Tab into View
**Files:**
- Modify: `src/components/counseling/CurhatWall.tsx`
- Modify: `src/components/articles/ArticlesDirectory.tsx`
- Modify: `src/components/admin/AdminLayoutClient.tsx`

**Langkah Pengerjaan:**
- [x] **Step 1: Perbaiki kontainer slider horizontal di `CurhatWall.tsx` & `ArticlesDirectory.tsx`**
  - Berikan padding horizontal yang nyaman (`px-1 sm:px-2`) pada kontainer `overflow-x-auto no-scrollbar` agar tombol tidak terpotong tajam di sisi kiri/kanan.
- [x] **Step 2: Implementasikan Auto Scroll Active Tab into View**
  - Gunakan `useRef` untuk tombol kategori aktif.
  - Saat `activeTab` / `activeCategory` berubah (atau saat pertama kali dimuat dari URL param `?kategori=...`), jalankan:
    ```ts
    activeTabRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
    ```
  - Ini memastikan tab yang dipilih pembaca selalu tampak di layar tanpa terpotong.

---

### Task 7: Standardisasi Pembungkus Tombol (Pill / Framed Containers)
**Files:**
- Modify: `src/components/home/ArticlesPreviewSection.tsx`
- Modify: `src/components/home/CurhatPreviewSection.tsx`
- Modify: `src/components/admin/overview/OverviewHeader.tsx`
- Modify: `src/components/admin/bookings/BookingHeader.tsx`
- Modify: `src/components/admin/counseling/CounselingHeader.tsx`
- Modify: `src/components/admin/articles/ArticleHeader.tsx`

**Langkah Pengerjaan:**
- [x] **Step 1: Bungkus seluruh tombol/link yang masih polos di beranda & publik**
  - "Kunjungi direktori artikel ->" di `ArticlesPreviewSection.tsx` -> framed button container.
  - "Buka seluruh cerita curhat ->" di `CurhatPreviewSection.tsx` -> framed button container.
  - "Baca tulisan ->" di setiap kartu preview artikel -> framed button container (`btn-secondary btn-interactive`).
- [x] **Step 2: Rapikan seluruh tombol aksi di header admin**
  - Pastikan tombol "Segarkan", "Tambah", dan aksi lainnya memiliki kontainer pil berbingkai seragam dengan elevation dan hover state yang rapih.

---

### Task 8: Pematangan Aksi Janji Temu Admin & Feedback Notifikasi
**Files:**
- Modify: `src/components/admin/bookings/BookingCard.tsx`
- Modify: `src/components/admin/bookings/AdminBookingsClient.tsx`

**Langkah Pengerjaan:**
- [x] **Step 1: Tambahkan toast feedback & rincian aksi di `AdminBookingsClient.tsx`**
  - Gunakan `useToast()` untuk menampilkan pesan konfirmasi sukses saat status diubah:
    - Konfirmasi: *"Janji temu konseli {name} berhasil dikonfirmasi."*
    - Selesai: *"Sesi konseling {name} telah ditandai selesai."*
    - Batal: *"Janji temu konseli {name} telah dibatalkan."*
- [x] **Step 2: Lengkapi panduan tindak lanjut pada `BookingCard.tsx`**
  - Pada status `terkonfirmasi`, berikan visual penanda jelas dan tombol cepat untuk menghubungi konseli via WhatsApp konfirmasi resmi.

---

### Task 9: Pengujian & Optimasi Layar < 320px (< 280px) Seluruh Website
**Files:**
- Seluruh komponen terkait di `src/components/`

**Langkah Pengerjaan:**
- [x] **Step 1: Audit kontainer & flex layout di ukuran 280px–320px**
  - Pastikan tidak ada teks overflow, tidak ada padding yang menabrak batas layar, dan tidak ada horizontal scrollbar liar pada halaman publik maupun admin.
- [x] **Step 2: Jalankan `pnpm build` untuk verifikasi produksi tanpa error**
  - Pastikan seluruh 43 rute sukses terkompilasi 100%.

---

## Verifikasi & Kriteria Keberhasilan

1. **Kotak Kumpulan Draf**: Admin dapat menyimpan lebih dari satu draf, melihat daftar draf lengkap dengan tanggal dan ringkasan, serta memuat draf kembali ke editor kapan saja.
2. **Foto Sampul**: Tombol "Ganti" telah dihapus; tombol "Hapus Foto Sampul" menampilkan dialog konfirmasi aman.
3. **Slug Generator**: Judul artikel bahasa Indonesia otomatis diterjemahkan menjadi slug bahasa Inggris yang bersih, akurat, dan ringkas tanpa campuran kata mentah.
4. **Waktu Baca & Konten**: Estimasi waktu baca tidak muncul sebagai input manual, dihitung otomatis; ada tombol "Blok Semua"; font textarea selaras dengan font situs.
5. **Title Gambar**: Foto artikel yang dibuka di tab baru menampilkan nama file WebP yang sebenarnya, bukan generic `"image"`.
6. **Ikon WhatsApp**: Ikon share bar bersih tanpa garis gagang telepon ganjil di tengah.
7. **PIN Otomatis**: Mengetik 6 digit PIN valid otomatis login tanpa harus menekan tombol submit.
8. **Slider Tabs**: Tab kategori tidak terpotong di tepi dan tab yang aktif otomatis bergeser ke tengah layar.
9. **Pembungkus Tombol**: Seluruh tombol aksi berbingkai rapi (pill wrapper) di beranda dan admin.
10. **Aksi Janji Temu**: Konfirmasi, Selesai, dan Batal memiliki dialog matang dan toast feedback.
11. **Responsif < 320px**: Tampilan rapi tanpa overflow pada layar 280px–320px.
12. **Build Produksi**: `pnpm build` exit code 0 tanpa error.
