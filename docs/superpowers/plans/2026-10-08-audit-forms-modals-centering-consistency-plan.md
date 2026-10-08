# Implementation Plan: Audit Desain Menyeluruh, Bug Ligatur Input, Penataan Tengah Lacak Status, Standarisasi Decision Modals, & Sistem Form/Pencarian

**Tujuan Proyek:** Menyelesaikan seluruh temuan audit komprehensif dari pengguna:
1. Memperbaiki bug font ligatur pada kolom nomor WhatsApp (`08xxxxxxxxxx`) di mana huruf `x` pertama setelah angka `8` berubah menjadi simbol perkalian matematika (`8×`) akibat fitur OpenType font *Plus Jakarta Sans*.
2. Memperbaiki bug tampilan penataan horizontal pada Lacak Janji Temu di desktop, di mana teks "Tidak ada rekaman [kode] di histori perangkat ini" bergeser ke kiri dan tidak berada tepat di tengah kartu.
3. Menstandarisasikan seluruh tindakan yang bersifat keputusan krusial agar menggunakan dialog konfirmasi modal (`ConfirmDecisionModal`), termasuk:
   - Tombol "Perpanjang" sesi admin di desktop (`AdminLayoutClient.tsx`).
   - Tombol "Kirim Tanggapan" di admin ruang curhat (`CounselingReplyBox.tsx`).
   - Tombol "Terbitkan Artikel" / "Simpan Draf" di form modal artikel admin (`ArticleFormModal.tsx`).
4. Standarisasi dan konsistensi sistem kolom form (input focus, placeholder, padding, disabled state, ligatures).
5. Standarisasi sistem pencarian (icon, clear button, escape shortcut, penataan tengah empty state).
6. Uji verifikasi penuh (TypeScript typecheck, Slug test suite, dan production build Next.js).

**Waktu Rilis:** 8 Oktober 2026  
**Metodologi:** Subagent-Driven Development (Pengerjaan terstruktur, terisolasi, dan terverifikasi berkala).

---

## Ringkasan Masalah & Solusi Arsitektural

| No | Modul / Komponen | Akar Masalah | Solusi Terpilih |
| :--- | :--- | :--- | :--- |
| 1 | **Kolom WhatsApp & Input Form** (`BookingClientInfoStep.tsx` & `globals.css`) | Font *Plus Jakarta Sans* memiliki fitur OpenType *Contextual Alternates* (`calt`) aktif secara bawaan. Kombinasi angka `8` diikuti huruf `x` diterjemahkan sebagai ekspresi pengali (`8×`), sehingga huruf `x` pertama mengecil dan melayang di tengah, sementara `x` berikutnya adalah huruf normal. | Tambahkan `font-variant-ligatures: none; font-feature-settings: "calt" 0;` pada kelas `.form-input`, `.search-input`, dan elemen `input` di `globals.css`. Ubah placeholder WhatsApp menjadi format standar Indonesia `0812xxxxxxxx`. |
| 2 | **Lacak Janji Temu di Desktop** (`BookingTracker.tsx`) | Aturan CSS global `p { max-width: 68ch; }` membatasi lebar blok paragraf tanpa `margin-inline: auto`. Pada kartu pencarian kosong, paragraf judul tidak memiliki `mx-auto`, sehingga kotaknya menempel ke batas kiri kartu dan bergeser ~130px dari titik tengah. | Tambahkan pembungkus `max-w-md mx-auto text-center` dan `w-full text-center mx-auto` pada blok teks pesan kosong agar sejajar simetris dengan ikon pencarian dan tombol di bawahnya. |
| 3 | **Tombol Perpanjang Desktop** (`AdminLayoutClient.tsx`) | Tombol perpanjang sesi 30 menit langsung mengeksekusi mutasi API tanpa dialog konfirmasi, berbeda dengan tombol sesi di sebelahnya yang membuka modal. | Hubungkan tombol "Perpanjang" dengan `<ConfirmDecisionModal>` yang meminta persetujuan sebelum memperbarui masa aktif sesi 30 menit. |
| 4 | **Tombol Kirim Tanggapan Curhat** (`CounselingReplyBox.tsx`) | Tombol "Kirim Tanggapan" langsung menyimpan ke database tanpa tinjauan modal konfirmasi akhir bagi konselor. | Tambahkan dialog `<ConfirmDecisionModal>` konfirmasi kirim tanggapan, lengkap dengan preview ringkasan tanggapan, jumlah karakter, dan status publikasi. |
| 5 | **Tombol Terbitkan / Simpan Artikel** (`ArticleFormModal.tsx`) | Tombol submit form artikel di bagian bawah modal langsung mengeksekusi penyimpanan tanpa dialog konfirmasi keputusan tayang ke publik vs simpan draf. | Tambahkan `<ConfirmDecisionModal>` saat form valid, menanyakan persetujuan penayangan publik atau penyimpanan draf privat beserta ringkasan metadata artikel. |
| 6 | **Sistem Pencarian & Form Terpadu** (Seluruh Halaman) | Beberapa input pencarian belum seragam dalam penanganan tombol clear (`X`), penataan teks kosong (*empty search state*), dan tata bahasa PUEBI. | Standarisasikan input pencarian dan form controls: ikon pencarian, tombol clear, placeholder konsisten, dan penataan tengah seluruh *empty state*. |

---

## Rincian Rencana Pengerjaan (Task per Task)

### Task 1: Perbaikan Bug Font Ligatur Kolom WhatsApp & Placeholder Standar Indonesia
**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/booking/BookingClientInfoStep.tsx`

**Langkah Pengerjaan:**
- [x] **Step 1: Matikan fitur OpenType ligatur & calt pada form input di `globals.css`**
  - Pada `.form-input`, `.search-input`, dan aturan `input`, tambahkan:
    ```css
    font-variant-ligatures: none;
    font-feature-settings: "calt" 0, "dlig" 0, "liga" 0;
    ```
  - Ini menjamin angka diikuti huruf `x` (seperti `8x`, `2x`) tidak pernah lagi dikonversi menjadi tanda kali matematika `×`.
- [x] **Step 2: Standarisasikan placeholder nomor WhatsApp di `BookingClientInfoStep.tsx`**
  - Ubah placeholder dari `08xxxxxxxxxx` menjadi `0812xxxxxxxx` (atau nomor contoh yang jelas) dengan panduan format yang bersih.

---

### Task 2: Perbaikan Bug Penataan Tengah Status Kosong Lacak Janji Temu di Desktop
**Files:**
- Modify: `src/components/booking/BookingTracker.tsx`

**Langkah Pengerjaan:**
- [x] **Step 1: Berikan `max-w-md mx-auto text-center` pada container pesan kosong di `BookingTracker.tsx`**
  - Pada baris ~514 (`{filteredDeviceRecords.length === 0 ? ...}`):
    ```tsx
    <div className="space-y-1.5 max-w-md mx-auto text-center">
      <p className="text-xs sm:text-sm font-semibold text-[var(--color-ink)] text-center">
        Tidak ada rekaman &ldquo;{searchInput}&rdquo; di histori perangkat ini
      </p>
      <p className="text-xs text-[var(--color-ink-muted)] text-center leading-relaxed">
        {error
          ? 'Tidak ditemukan janji temu dengan kode tersebut baik di perangkat ini maupun di sistem.'
          : 'Kode ini mungkin didaftarkan melalui perangkat lain.'}
      </p>
    </div>
    ```
- [x] **Step 2: Pastikan seluruh flex & grid di dalam kartu kosong terpusat sempurna di layar desktop dan mobile**
  - Ikon search bulat (`mx-auto`), teks judul & deskripsi (`mx-auto text-center`), serta tombol "Lacak ke Server" & "Tampilkan Semua Riwayat" berada pada satu sumbu simetris vertikal di tengah.

---

### Task 3: Standarisasi Sistem Modal Keputusan (Decision Modals)
**Files:**
- Modify: `src/components/admin/AdminLayoutClient.tsx`
- Modify: `src/components/admin/counseling/CounselingReplyBox.tsx`
- Modify: `src/components/admin/articles/ArticleFormModal.tsx`

**Langkah Pengerjaan:**
- [x] **Step 1: Modal konfirmasi tombol perpanjang sesi desktop di `AdminLayoutClient.tsx`**
  - Tambahkan state `const [showExtendSessionConfirm, setShowExtendSessionConfirm] = useState(false);`.
  - Ubah tombol "Perpanjang" agar memanggil `setShowExtendSessionConfirm(true)`.
  - Render `<ConfirmDecisionModal>`:
    - Judul: *"Perpanjang Masa Aktif Sesi?"*
    - Deskripsi: *"Sesi login konselor akan diperpanjang 30 menit ke depan tanpa perlu login ulang."*
    - Konfirmasi: *"Ya, Perpanjang Sesi"*
    - Icon: `<RotateCw className="w-5 h-5 text-[var(--color-accent)]" />`
    - Action: menjalankan `handleRefresh()`.
- [x] **Step 2: Modal konfirmasi tombol kirim tanggapan di `CounselingReplyBox.tsx`**
  - Tambahkan state `const [showSendConfirm, setShowSendConfirm] = useState(false);`.
  - Ubah tombol "Kirim Tanggapan" agar membuka modal konfirmasi jika teks tanggapan valid.
  - Render `<ConfirmDecisionModal>`:
    - Judul: `initialText ? 'Simpan Pembaruan Tanggapan?' : 'Kirim Tanggapan Penguatan?'`
    - Deskripsi: *"Tanggapan konselor akan disimpan dan disinkronkan ke ruang curhat konseli."*
    - Konfirmasi: `initialText ? 'Ya, Simpan Pembaruan' : 'Ya, Kirim Tanggapan'`
    - Action: memanggil `handleSave()`.
    - Item detail: ringkasan cuplikan balasan dan status publik/beranda.
- [x] **Step 3: Modal konfirmasi tombol terbitkan/simpan artikel di `ArticleFormModal.tsx`**
  - Tambahkan state `const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);`.
  - Saat tombol utama simpan di klik: lakukan validasi form; jika valid, buka modal konfirmasi.
  - Render `<ConfirmDecisionModal>`:
    - Judul: `formData.isPublished ? (isEditMode ? 'Simpan dan Terbitkan Artikel?' : 'Terbitkan Artikel Baru?') : (isEditMode ? 'Simpan Draf Artikel?' : 'Simpan sebagai Draf?')`
    - Deskripsi: `formData.isPublished ? 'Artikel akan langsung ditayangkan secara publik dan dapat dibaca oleh seluruh pengunjung website.' : 'Artikel akan disimpan sebagai draf privat dan belum akan ditampilkan ke publik.'`
    - Konfirmasi: `formData.isPublished ? (isEditMode ? 'Ya, Simpan & Terbitkan' : 'Ya, Terbitkan Artikel') : 'Ya, Simpan Draf'`
    - Action: mengeksekusi `executeFormSubmit()`.

---

### Task 4: Standarisasi Sistem Kolom Form, Tata Bahasa & Pencarian Terpadu
**Files:**
- Modify: `src/components/counseling/CurhatForm.tsx`
- Modify: `src/components/BookingSection.tsx`
- Modify: `src/components/articles/ArticlesDirectory.tsx`
- Modify: `src/components/counseling/CurhatWall.tsx`

**Langkah Pengerjaan:**
- [x] **Step 1: Standarisasi tombol clear, placeholder, dan alignment input pencarian**
  - Pastikan semua input pencarian memiliki ikon search di kiri, tombol clear `X` saat ada teks, dan respon keyboard `Escape`.
- [x] **Step 2: Standarisasi tata bahasa dan kapitalisasi otomatis nama/alias**
  - Pastikan format PUEBI pada nama pengguna, alias curhat, dan judul artikel bekerja seragam di seluruh form publik dan admin.
- [x] **Step 3: Pastikan semua state kosong (*empty states*) di pencarian curhat dan artikel terpusat simetris di desktop**

---

### Task 5: Verifikasi Menyeluruh & Uji Produksi (`pnpm build`)
**Files:**
- Seluruh file yang dimodifikasi.

**Langkah Pengerjaan:**
- [x] **Step 1: Uji Slug Generator Suite (`pnpm test:slug`)**
  - Pastikan 16/16 test suites lolos tanpa regresi. (Terverifikasi 16/16 PASS).
- [x] **Step 2: Uji TypeScript Typecheck (`npx tsc --noEmit`)**
  - Pastikan 0 error. (Terverifikasi 0 TS errors).
- [x] **Step 3: Uji Build Produksi Next.js (`pnpm build`)**
  - Pastikan 43/43 rute statis, SSG, dan dinamis terkompilasi 100% sukses. (Terverifikasi compiled in 16.8s, 43/43 static pages generated).
