# Implementation Plan: Audit Desain Menyeluruh, Konsistensi Tombol, Slider Centering, Bug Riwayat Lacak, & Responsivitas < 320px

**Tujuan Proyek:** Menyelesaikan tuntas seluruh hasil audit komprehensif atas temuan pengguna:
1. Memperbaiki kartu format layanan dan kartu artikel di ukuran `< 320px` agar tidak berdesakan/bertabrakan teks.
2. Memperbaiki proporsi ukuran tombol di seluruh website agar tidak "kegedean" (merampingkan tombol catatan evaluasi, WhatsApp pill, dan tautan aksi ke proporsi ideal berbasis v1.5.0).
3. Mengeliminasi bug mobile curhat yang otomatis scroll ke bawah saat pertama kali dibuka.
4. Memastikan slider kategori selalu memposisikan tab aktif tepat di tengah (`center`), baik di mobile maupun desktop.
5. Memperbaiki bug hapus riwayat lacak status janji temu yang harus di-refresh baru hilang (sinkronisasi state real-time, tombol hapus per kartu, dan pembersihan URL/sessionStorage).
6. Memperbaiki tampilan status autosave, jam, dan jumlah karakter di card ruang curhat admin pada layar `< 320px`.
7. Menyeragamkan ukuran tombol yang bersebelahan (tombol "Kirim Tanggapan" vs "Batal" di curhat admin, serta "Tambah Artikel Baru" vs "Kotak Draf" dan "Segarkan" di header artikel admin).
8. Menghapus tampilan baris URL di card artikel admin.
9. Menstandarisasi tombol "Ubah Tanggapan" / "Beri Tanggapan" di admin curhat sesuai standar tombol web.
10. Memperbaiki konsistensi kategori artikel (`art-4`) dan tata bahasa PUEBI pada judul artikel.

**Waktu Rilis:** 8 Oktober 2026  
**Metodologi:** Subagent-Driven Development (Satu subagent per tugas terisolasi, diverifikasi berkala).

---

## Ringkasan Masalah & Solusi Arsitektural

| No | Modul | Akar Masalah | Solusi Terpilih |
| :--- | :--- | :--- | :--- |
| 1 | **Kartu Format Layanan & Artikel (< 320px)** | Pada `ServicesFormats.tsx`, card memiliki padding kaku `p-6` dan baris bawah `justify-between` kaku tanpa wrapping, menyebabkan durasi dan tombol "Pilih Format" bertubrukan pada layar 280px-300px. | Turunkan padding mobile ke `p-4 min-[340px]:p-5 sm:p-6` dan ubah footer menjadi flex wrapping adaptif `flex-col min-[320px]:flex-row min-[320px]:items-center justify-between gap-2`. |
| 2 | **Proporsi Tombol "Kegedean"** | Tombol "Lihat Rekomendasi & Catatan Lengkap", "Konsultasikan", dan beberapa pill aksi publik diberi padding terlalu tebal (`px-3.5 py-2` hingga `px-4 py-2.5`), sehingga tampak mendominasi dan tidak proporsional dibanding desain referensi v1.5.0. | Rampingkan seluruh secondary pill container ke dimensi ideal: `px-3 py-1.5 rounded-xl text-xs font-semibold` (tinggi ~32px), dan tombol accordion evaluasi ke `px-2.5 py-1 text-xs rounded-lg`. |
| 3 | **Mobile Curhat Auto-Scroll ke Bawah** | Pada `CurhatWall.tsx`, `activeTabButtonRef.current.scrollIntoView(...)` berjalan saat halaman pertama kali dibuka. Browser mobile menterjemahkan ini sebagai perintah menggulung seluruh `window` ke bawah ke posisi slider kategori. | Ganti native `scrollIntoView` dengan kalkulasi internal kontainer: `container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' })`. `window` halaman tetap pada `scrollY = 0`. |
| 4 | **Tab Aktif Tepat di Tengah Slider** | Tab aktif pada slider kategori sebelumnya hanya menggunakan `inline: 'center'` native yang tidak presisi di beberapa peramban dan menggeser layar vertikal. | Hitung offset matematis horizontal murni: `targetScrollLeft = button.offsetLeft - (container.clientWidth / 2) + (button.clientWidth / 2)` dan panggil `container.scrollTo` pada `CurhatWall.tsx` dan `ArticlesDirectory.tsx`. |
| 5 | **Bug Hapus Riwayat Lacak Status** | Kartu histori di `BookingTracker.tsx` tidak memiliki tombol hapus individual, dan saat dihapus dari detail modal, `onCodeChange?.('')` tidak dipanggil sehingga URL `?code=...` dan `sessionStorage` memicu pengambilan ulang data otomatis. | Tambahkan tombol hapus individual (`Trash2`) pada setiap kartu riwayat di daftar, bersihkan `searchInput`, `liveBookings`, `onCodeChange('')`, serta sinkronkan `useDeviceBookings` secara instan. |
| 6 | **Autosave Curhat Admin (< 320px)** | Pada `CounselingReplyBox.tsx`, label, waktu tersimpan otomatis, dan jumlah karakter berada dalam 1 baris flex wrap yang patah tidak rapi di layar < 320px. | Ubah menjadi layout 2-baris responsif: baris atas untuk label, baris bawah untuk status autosave + dot separator + jumlah karakter dengan `truncate max-w-[160px]`. |
| 7 | **Ketidakseragaman Tombol Bersebelahan** | Di `CounselingReplyBox.tsx`, tombol "Batal" (`!px-4`) dan "Kirim Tanggapan" (`!px-5`) memiliki padding dan bobot berbeda. Di `ArticleHeader.tsx`, "Tambah Artikel Baru" memiliki teks panjang dan shadow berbeda. | Samakan tinggi (`h-9`), padding (`px-3 sm:px-4`), border-radius (`rounded-xl`), dan font size (`text-xs font-semibold`) kedua tombol. Pada `ArticleHeader.tsx`, buat ketiga tombol berdimensi identik. |
| 8 | **Tampilan URL di Card Artikel Admin** | `ArticleCard.tsx` masih merender baris teks `URL: /articles/{article.slug}` yang sudah usang dan memadati kartu. | Hapus baris teks URL dari `ArticleCard.tsx`. |
| 9 | **Standarisasi Tombol "Ubah Tanggapan"** | Tombol trigger balasan di `CounselingCard.tsx` memiliki styling lama `rounded-lg shadow-xs`. | Standarisasikan menjadi `btn-secondary btn-interactive` berbingkai halus `px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs`. |
| 10 | **Sinkronisasi Data Kategori & Tata Bahasa Artikel** | `art-4` di basis data menggunakan kategori usang `'Pengembangan Diri & Spiritual'`, serta beberapa judul artikel mengandung kata tugas huruf kapital di tengah kalimat (*Tanpa*). | Sinkronkan kategori `art-4` ke `'Akademik, Karier & Produktivitas'` dan sesuaikan kapitalisasi sesuai kaidah EYD/PUEBI. |

---

## Rincian Rencana Pengerjaan (Task per Task)

### Task 1: Perbaikan Layout Kartu Format Layanan & Artikel di Resolusi < 320px
**Files:**
- Modify: `src/components/services/ServicesFormats.tsx`
- Modify: `src/components/home/ArticlesPreviewSection.tsx`
- Modify: `src/components/articles/ArticleListItem.tsx`
- Modify: `data/db.json` & `src/lib/data-store.ts`

**Langkah Pengerjaan:**
- [x] **Step 1: Perbaiki padding dan footer wrapping pada `ServicesFormats.tsx`**
  - Ubah padding card dari `p-6` menjadi `p-4 min-[340px]:p-5 sm:p-6`.
  - Ubah footer baris dari `flex items-center justify-between` menjadi `flex flex-col min-[320px]:flex-row min-[320px]:items-center justify-between gap-2`.
  - Pastikan durasi format `{f.dur}` dan tombol "Pilih Format" tertata rapi tanpa bertabrakan di layar 280px-320px.
- [x] **Step 2: Perbaiki wrapping kartu artikel publik (`ArticlesPreviewSection.tsx` & `ArticleListItem.tsx`)**
  - Pastikan kategori, bullet, dan waktu baca membungkus secara fleksibel dengan `flex-wrap` dan `gap-1.5`.
  - Tombol "Baca Tulisan" memiliki posisi yang seimbang (`self-start min-[340px]:self-auto`).
- [x] **Step 3: Sinkronisasi kategori dan tata bahasa artikel**
  - Perbaiki kategori `art-4` dari `'Pengembangan Diri & Spiritual'` menjadi `'Akademik, Karier & Produktivitas'`.
  - Normalisasikan kata tugas di tengah judul `art-3` ("Tanpa" $\rightarrow$ "tanpa").

---

### Task 2: Standardisasi Proporsi Ukuran Tombol (Menghilangkan Tombol "Kegedean")
**Files:**
- Modify: `src/components/assessment/AssessmentHistory.tsx`
- Modify: `src/components/home/TrackRecordSection.tsx`
- Modify: `src/components/home/ApproachSection.tsx`
- Modify: `src/components/home/ServicesSection.tsx`
- Modify: `src/components/home/ArticlesPreviewSection.tsx`
- Modify: `src/components/home/CurhatPreviewSection.tsx`

**Langkah Pengerjaan:**
- [x] **Step 1: Rampingkan tombol toggle dan WhatsApp di `AssessmentHistory.tsx`**
  - Ubah tombol accordion "Lihat Rekomendasi & Catatan Lengkap" / "Sembunyikan Rincian" menjadi compact pill: `btn-secondary btn-interactive px-2.5 py-1 text-[11px] min-[340px]:text-xs font-medium rounded-lg border border-[var(--color-paper-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/50 text-[var(--color-ink)] hover:text-[var(--color-accent)] shadow-2xs`.
  - Ubah tombol "Konsultasikan" WhatsApp menjadi compact green pill: `btn-interactive px-2.5 py-1 text-[11px] min-[340px]:text-xs font-semibold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 shadow-2xs`.
- [x] **Step 2: Rampingkan tombol tautan aksi di beranda**
  - Standarisasikan tombol di `TrackRecordSection.tsx` ("Lihat Profil Lengkap di Tentang"), `ApproachSection.tsx` ("Kenali Lebih Dekat Sosok Amel"), dan `ServicesSection.tsx` ("Lihat Rincian Layanan Lengkap") ke ukuran proporsional: `px-3 py-1.5 rounded-xl text-xs font-semibold`.
  - Standarisasikan tombol di `ArticlesPreviewSection.tsx` ("Kunjungi Direktori Artikel") dan `CurhatPreviewSection.tsx` ("Buka Seluruh Cerita Curhat") ke `px-3 py-1.5 rounded-xl text-xs font-semibold`.

---

### Task 3: Eliminasi Bug Auto-Scroll Mobile & Penempatan Tab Tepat di Tengah Slider
**Files:**
- Modify: `src/components/counseling/CurhatWall.tsx`
- Modify: `src/components/articles/ArticlesDirectory.tsx`

**Langkah Pengerjaan:**
- [x] **Step 1: Hapus `Element.scrollIntoView()` yang menggulung window**
  - Hapus pemanggilan `activeTabButtonRef.current.scrollIntoView(...)` dan `activeCategoryButtonRef.current.scrollIntoView(...)`.
- [x] **Step 2: Terapkan horizontal scroll kontainer murni dengan centering presisi**
  - Buat fungsi centering matematis:
    ```ts
    const container = tabsContainerRef.current;
    const button = activeTabButtonRef.current;
    if (container && button) {
      const targetLeft = button.offsetLeft - (container.clientWidth / 2) + (button.clientWidth / 2);
      container.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
    }
    ```
  - Ini menjamin tab aktif selalu berposisi tepat di tengah slider, baik di mobile maupun desktop, tanpa sedikit pun menggeser scroll vertikal halaman web.

---

### Task 4: Perbaikan Sistem Hapus Riwayat Lacak Status (Instant Sync & Per-Item Delete)
**Files:**
- Modify: `src/components/booking/BookingTracker.tsx`
- Modify: `src/lib/booking-storage.ts`

**Langkah Pengerjaan:**
- [x] **Step 1: Tambahkan tombol hapus individual (`Trash2`) pada setiap kartu riwayat**
  - Pada daftar riwayat di `BookingTracker.tsx`, tambahkan tombol ikon hapus kecil berbingkai di samping status badge, yang membuka konfirmasi modal hapus item tersebut.
- [x] **Step 2: Pastikan state terhapus seketika tanpa perlu me-refresh halaman**
  - Saat item dihapus:
    - Panggil `removeDeviceBooking(code)`.
    - Jika item yang dihapus sedang dibuka di `activeBooking`, panggil `setActiveBooking(null)`.
    - Jika input pencarian berisi kode yang dihapus, bersihkan `setSearchInput('')`.
    - Panggil `onCodeChange?.('')` agar URL query `?code=...` dan `sessionStorage` tidak menyimpan kode lama.
    - Hapus data live booking dari state lokal `setLiveBookings((prev) => { const next = { ...prev }; delete next[code]; return next; })`.
  - Pada `booking-storage.ts`, pastikan pembersihan cache `cachedRaw = null` dan `cachedRecords = []` memicu re-render instan pada seluruh komponen pelanggan.

---

### Task 5: Perapihan Card Ruang Curhat Admin & Penyeragaman Tombol
**Files:**
- Modify: `src/components/admin/counseling/CounselingReplyBox.tsx`
- Modify: `src/components/admin/counseling/CounselingCard.tsx`
- Modify: `src/components/admin/articles/ArticleHeader.tsx`
- Modify: `src/components/admin/articles/ArticleCard.tsx`

**Langkah Pengerjaan:**
- [x] **Step 1: Rapikan tampilan status autosave, jam, dan jumlah karakter di `CounselingReplyBox.tsx` (< 320px)**
  - Pecah header textarea menjadi 2 baris fleksibel: baris 1 untuk label penerima tanggapan, baris 2 untuk status autosave + separator + jumlah karakter dengan pembatasan lebar teks agar tidak meluap.
- [x] **Step 2: Samakan ukuran dan padding tombol "Kirim Tanggapan" dan "Batal" di `CounselingReplyBox.tsx`**
  - Buat kedua tombol berukuran seragam: `h-9 px-3.5 sm:px-4 text-xs font-semibold rounded-xl inline-flex items-center justify-center`.
- [x] **Step 3: Standarisasikan tombol "Ubah Tanggapan" / "Beri Tanggapan" di `CounselingCard.tsx`**
  - Gunakan styling `btn-secondary btn-interactive px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs`.
- [x] **Step 4: Seragamkan tombol "Tambah Artikel Baru" dengan "Kotak Draf" dan "Segarkan" di `ArticleHeader.tsx`**
  - Samakan tinggi (`h-9`), padding (`px-2.5 min-[340px]:px-3 py-2`), radius (`rounded-xl`), dan shadow (`shadow-2xs`).
- [x] **Step 5: Hapus tampilan teks URL pada `ArticleCard.tsx`**
  - Hapus blok `URL: /articles/{article.slug}` dari card artikel admin.

---

### Task 6: Verifikasi Menyeluruh & Uji Produksi (`pnpm build`)
**Files:**
- Seluruh file yang dimodifikasi.

**Langkah Pengerjaan:**
- [x] **Step 1: Uji Slug Generator Suite (`pnpm test:slug`)**
  - Pastikan 16/16 test suites passing.
- [x] **Step 2: Uji TypeScript Typecheck (`npx tsc --noEmit`)**
  - Pastikan 0 errors.
- [x] **Step 3: Uji Build Produksi (`pnpm build`)**
  - Pastikan 44/44 rute statis, SSG, dan dinamis terkompilasi 100% sukses.
