# Full-Stack Audit, Decision Modals, Search & System Maturation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menuntaskan seluruh temuan audit menyeluruh arsitektur, frontend, backend, keamanan, SEO, PWA, dan sistem tata bahasa di website Amelia BKI:
1. **Modal Keputusan Menyeluruh (`ConfirmDecisionModal`)**:
   - Kirim Tanggapan Konselor di Curhat Admin (`CounselingReplyBox.tsx`).
   - Terbitkan / Simpan Artikel di Modal Form Artikel Admin (`ArticleFormModal.tsx`).
   - Perpanjang Sesi Admin di Dialog Status Sesi (`AdminSessionModal.tsx`).
2. **Perbaikan Tampilan Desktop & Input WhatsApp**:
   - Perbaikan perataan tepat di tengah (*perfect horizontal & vertical centering*) pada status kosong pencarian riwayat perangkat desktop (`BookingTracker.tsx`).
   - Standardisasi format placeholder WhatsApp input menjadi `0812-3456-7890` yang rapi dan konsisten (`BookingClientInfoStep.tsx`).
3. **Standarisasi Sistem Pencarian & Filter (Publik & Admin)**:
   - Debouncing pencarian (300ms) dengan sinkronisasi URL `replaceState` bersih tanpa mengotori browser history stack.
   - Shortcut keyboard `Escape` terstandarisasi untuk mengosongkan query pada seluruh filter bar (`ArticlesDirectory.tsx`, `BookingFilters.tsx`, `ArticleFilters.tsx`, `CounselingFilters.tsx`).
   - Empty-state hasil pencarian yang terpusat rapi dengan tombol *"Reset Filter"*.
4. **Sistem Tata Bahasa & Kapitalisasi Otomatis (PUEBI/EYD)**:
   - Integrasi `formatSentenceCase` otomatis pada input textarea pengantar artikel (`ArticleFormModal.tsx`), isi curhat (`CurhatForm.tsx`), dan catatan masalah janji temu (`BookingSessionDetailsStep.tsx`).
5. **Keamanan API & Proteksi Akses (OWASP Top 10)**:
   - Proteksi otentikasi admin wajib (`isAuthenticatedAdmin`) pada endpoint unggah gambar (`src/app/api/upload/route.ts`).
   - Rate limiting terdistribusi (`checkDistributedRateLimit`) pada endpoint translasi slug (`src/app/api/translate/route.ts`) untuk mencegah spam dan pemborosan kuota.
   - Peningkatan konkurensi atomic increment database pada endpoint hitungan view artikel (`src/lib/data-store.ts`).
6. **PWA Multi-Tab State Synchronization**:
   - Sinkronisasi instan status instalasi PWA di seluruh tab browser yang terbuka via `storage` event listener di `src/lib/pwa-store.ts`.
7. **Verifikasi Penuh**:
   - `pnpm test:slug` (16 unit tests).
   - `npx tsc --noEmit` (0 kesalahan tipe).
   - `pnpm build` (43/43 routes produksi).

---

### Task 1: Modal Keputusan Menyeluruh di Panel Admin (Kirim Tanggapan, Terbitkan Artikel, Perpanjang Sesi)

**Files:**
- Modify: `src/components/admin/counseling/CounselingReplyBox.tsx`
- Modify: `src/components/admin/articles/ArticleFormModal.tsx`
- Modify: `src/components/admin/AdminSessionModal.tsx`

- [x] **Step 1: Modal konfirmasi simpan tanggapan di `CounselingReplyBox.tsx`**
  - Tambahkan state `const [showConfirmModal, setShowConfirmModal] = useState(false);`.
  - Pada fungsi `handleSave`: jika valid (`replyText.trim()`), buka modal konfirmasi `setShowConfirmModal(true)`.
  - Buat fungsi `executeSave`: menjalankan penyimpanan asli, membersihkan draft localStorage, dan menutup modal.
  - Render `<ConfirmDecisionModal>`:
    - Judul: *"Kirim Tanggapan untuk Konseli?"*
    - Deskripsi: *"Tanggapan ini akan tersimpan dan langsung dapat dibaca oleh konseli di Dinding Cerita Curhat."*
    - Konfirmasi: *"Ya, Kirim Tanggapan"*
    - Variant: `"primary"`
    - Icon: `<Send className="w-5 h-5 text-[var(--color-accent)]" />`
    - Item detail:
      - Konseli: `{itemAlias || 'Konseli'}`
      - Publikasi: `{replyPublic ? 'Ditampilkan di Dinding Curhat' : 'Hanya Terlihat Konselor'}`
      - Sorotan Beranda: `{replyLanding ? 'Disorot di Halaman Utama' : 'Tidak disorot'}`
      - Panjang Teks: `{replyText.trim().length} karakter`

- [x] **Step 2: Modal konfirmasi terbitkan/simpan artikel di `ArticleFormModal.tsx`**
  - Tambahkan state `const [showPublishConfirmModal, setShowPublishConfirmModal] = useState(false);`.
  - Pada form submit (dan tombol aksi Terbitkan/Simpan): lakukan validasi input, lalu picu `setShowPublishConfirmModal(true)`.
  - Render `<ConfirmDecisionModal>`:
    - Judul: `{mode === 'create' ? (formData.isPublished ? 'Terbitkan Artikel Sekarang?' : 'Simpan Draf Artikel?') : 'Simpan Perubahan Artikel?'}`
    - Deskripsi: *"Pastikan seluruh konten, foto sampul, dan tagar artikel telah sesuai sebelum diperbarui ke publik."*
    - Konfirmasi: `{mode === 'create' ? (formData.isPublished ? 'Ya, Terbitkan Artikel' : 'Ya, Simpan Draf') : 'Ya, Simpan Perubahan'}`
    - Variant: `"primary"`
    - Item detail:
      - Judul: `{formData.title}`
      - Kategori: `{formData.category}`
      - Tautan Slug: `/articles/{formData.slug}`
      - Status Publikasi: `{formData.isPublished ? 'Publik (Tayang di Direktori)' : 'Draf Pribadi'}`
      - Foto Sampul: `{formData.coverImage ? 'Terpasang' : 'Tanpa Sampul'}`

- [x] **Step 3: Modal konfirmasi perpanjang sesi di dialog `AdminSessionModal.tsx`**
  - Tambahkan state `const [showExtendConfirm, setShowExtendConfirm] = useState(false);`.
  - Tombol "Perpanjang Sesi (30 Menit)" memicu `setShowExtendConfirm(true)`.
  - Render `<ConfirmDecisionModal>`:
    - Judul: *"Perpanjang Masa Aktif Sesi?"*
    - Deskripsi: *"Masa aktif login konselor akan diperpanjang 30 menit ke depan tanpa perlu login ulang."*
    - Konfirmasi: *"Ya, Perpanjang Sesi"*
    - Variant: `"primary"`
    - Icon: `<RotateCw className="w-5 h-5 text-[var(--color-accent)]" />`
    - Action: memanggil `handleExtend()`.

- [x] **Step 4: Uji TypeScript typecheck**
  - Jalankan: `npx tsc --noEmit`.

---

### Task 2: Perbaikan Tampilan Desktop & Input WhatsApp

**Files:**
- Modify: `src/components/booking/BookingTracker.tsx`
- Modify: `src/components/booking/BookingClientInfoStep.tsx`

- [x] **Step 1: Perbaiki centering status kosong pencarian riwayat di desktop `BookingTracker.tsx`**
  - Pada container `filteredDeviceRecords.length === 0` (lines ~516-530):
    - Tambahkan styling flex-centering: `flex flex-col items-center justify-center text-center w-full mx-auto`.
    - Pastikan judul paragraf `Tidak ada rekaman "..." di histori perangkat ini` memiliki `w-full text-center mx-auto`.
    - Pastikan baris tombol aksi ("Lacak ke Server" & "Tampilkan Semua Riwayat") memiliki `justify-center w-full`.

- [x] **Step 2: Standardisasi format placeholder nomor WhatsApp di `BookingClientInfoStep.tsx`**
  - Ganti `placeholder="0812xxxxxxxx"` dengan format baku Indonesia yang jelas dan rapi: `placeholder="0812-3456-7890"`.
  - Pastikan event handler `onChange` menyaring karakter non-digit kecuali tanda plus `+` di awal nomor secara bersih.

- [x] **Step 3: Uji TypeScript typecheck**
  - Jalankan: `npx tsc --noEmit`.

---

### Task 3: Standarisasi Sistem Pencarian & Filter di Seluruh Website

**Files:**
- Modify: `src/components/articles/ArticlesDirectory.tsx`
- Modify: `src/components/admin/articles/ArticleFilters.tsx`
- Modify: `src/components/admin/bookings/BookingFilters.tsx`
- Modify: `src/components/admin/counseling/CounselingFilters.tsx`

- [x] **Step 1: Sinkronisasi URL search ter-debounce dan shortcut Escape**
  - Di `ArticlesDirectory.tsx`: pastikan input search memiliki debounced sync (300ms) ke URL parameter `q`, tombol `X` dengan feedback transisi, dan keyboard handler `Escape` untuk mengosongkan query.
  - Di `BookingFilters.tsx`, `ArticleFilters.tsx`, dan `CounselingFilters.tsx`:
    - Tambahkan badge hitungan hasil pencarian yang seragam.
    - Pastikan tombol reset/bersihkan pencarian beranimasi halus dan merespons `Escape`.

- [x] **Step 2: Uji TypeScript typecheck**
  - Jalankan: `npx tsc --noEmit`.

---

### Task 4: Sistem Tata Bahasa & Kapitalisasi Otomatis (PUEBI/EYD)

**Files:**
- Modify: `src/components/counseling/CurhatForm.tsx`
- Modify: `src/components/booking/BookingSessionDetailsStep.tsx`

- [x] **Step 1: Terapkan format kalimat otomatis pada isi curhat `CurhatForm.tsx`**
  - Pada `onBlur` dari textarea `message`, format teks dengan `formatSentenceCase` dari `@/lib/text-formatter` agar huruf pertama di awal kalimat dan setelah titik (`. `), tanda tanya (`? `), atau baris baru (`\n`) otomatis kapital.

- [x] **Step 2: Terapkan format kalimat otomatis pada gambaran masalah `BookingSessionDetailsStep.tsx`**
  - Pada `onBlur` textarea `notes`, jalankan `formatSentenceCase(form.notes)` secara lembut.

- [x] **Step 3: Uji TypeScript typecheck**
  - Jalankan: `npx tsc --noEmit`.

---

### Task 5: Keamanan Backend & Proteksi Endpoint API (OWASP Top 10)

**Files:**
- Modify: `src/app/api/upload/route.ts`
- Modify: `src/app/api/translate/route.ts`
- Modify: `src/lib/data-store.ts`

- [x] **Step 1: Wajibkan otentikasi admin pada `POST /api/upload`**
  - Di `src/app/api/upload/route.ts`, impor `isAuthenticatedAdmin` dari `@/lib/admin-auth`.
  - Periksa `const isAuth = await isAuthenticatedAdmin(req);` di awal handler. Jika `!isAuth`, kembalikan respons 401 Unauthorized.

- [x] **Step 2: Pasang distributed rate limiting pada `POST /api/translate`**
  - Di `src/app/api/translate/route.ts`, pasang `checkDistributedRateLimit(translate:${ip}, 20, 60)` untuk membatasi maksimal 20 permintaan translasi per menit per IP.

- [x] **Step 3: Atomic database view increment di `src/lib/data-store.ts`**
  - Di fungsi `incrementArticleViews(slug)`, gunakan SQL atomic increment `sql`${articles.views} + 1`` melalui Drizzle ORM untuk mencegah race condition.

- [x] **Step 4: Uji TypeScript typecheck**
  - Jalankan: `npx tsc --noEmit`.

---

### Task 6: PWA Install State Synchronization Across Tabs

**Files:**
- Modify: `src/lib/pwa-store.ts`

- [x] **Step 1: Tambahkan event listener sinkronisasi antar-tab**
  - Dengarkan `window.addEventListener('storage', ...)` untuk `amelia_pwa_installed` agar saat aplikasi dipasang di satu tab, seluruh tab aktif lainnya langsung memperbarui state tanpa perlu refresh.

- [x] **Step 2: Uji TypeScript typecheck**
  - Jalankan: `npx tsc --noEmit`.

---

### Task 7: Verifikasi Menyeluruh & Uji Produksi (`pnpm build`)

**Files:**
- Seluruh file yang dimodifikasi.

- [x] **Step 1: Jalankan Uji Slug Suite**
  - Jalankan: `pnpm test:slug` (16 unit tests).

- [x] **Step 2: Jalankan TypeScript Compiler Check**
  - Jalankan: `npx tsc --noEmit` (0 error tipe).

- [x] **Step 3: Jalankan Build Produksi Next.js**
  - Jalankan: `pnpm build` (43/43 rute terkompilasi sukses).
