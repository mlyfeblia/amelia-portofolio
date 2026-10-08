# Mobile < 320px Visual Refinements, Admin Pagination & Unified Smooth Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menuntaskan 5 perbaikan visual layar sempit (< 320px) dari foto audit pengguna, menambahkan pembungkus (*pill container*) pada tombol Web dan Keluar di admin header, menerapkan sistem pagination lengkap di seluruh halaman admin list (`/admin/bookings`, `/admin/counseling`, `/admin/articles`), serta menyeragamkan animasi transisi pagination yang halus (*silky smooth*, tidak kaku) di seluruh web publik dan admin.

**Architecture:** 
1. Mengatasi text collisions dan wrapping breaks pada viewport sempit (< 320px) menggunakan responsive flex direction (`flex-col min-[340px]:flex-row`), `shrink-0 whitespace-nowrap`, dan `truncate` terkendali.
2. Membungkus tombol aksi admin (`Web` dan `Keluar`) dengan surface card/pill berbingkai (`border border-[var(--color-paper-border)] bg-[var(--color-surface)] shadow-2xs rounded-xl`) yang serasi dengan widget timer sesi.
3. Membangun reusable `PaginationBar.tsx` dan keyframe CSS `.pagination-slide-enter` dengan kurva easing `cubic-bezier(0.16, 1, 0.3, 1)` (durasi 320ms) untuk transisi antar halaman yang mengalir mulus tanpa patah/kaku.
4. Menerapkan pagination (6 item per halaman) terintegrasi pada Admin Bookings, Admin Counseling, dan Admin Articles, serta memperbarui web publik (`CurhatWall` dan `ArticlesDirectory`) agar konsisten 100%.

**Tech Stack:** Next.js 16.3 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React icons.

**Spec / Audit Input:**
- Foto 1: Teks hasil tes psikologis bertabrakan dengan label "Hasil:" di `AssessmentDeleteModal.tsx`.
- Foto 2: Tombol `Web` dan `Keluar` di Admin Header tampak melayang tanpa pembungkus bingkai/pill rapi.
- Foto 3 & 5: Kategori panjang dan waktu baca artikel menekan/merusak tata letak baris footer artikel di layar kecil.
- Foto 4: Tanggal curhat ("22 Sep 2026") patah menjadi dua baris ("22 Sep" dan "2026") di layar sempit.
- Fitur Pagination Admin: Seluruh admin list (`/admin/bookings`, `/admin/counseling`, `/admin/articles` — selain Ringkasan) wajib memakai pagination terstruktur.
- Animasi Transisi: Diseragamkan dan dibuat mengalir lembut (*smooth motion*) di publik dan admin.

## Global Constraints

- Standar viewport mobile terkecil: 260px–280px (Samsung Galaxy Z Fold cover screen), 320px (iPhone SE), 360px+ (Android mainstream).
- Tidak boleh ada FOUC, hydration mismatch, atau overflow horizontal (`overflow-x: clip/hidden`).
- Jangan menambahkan pagination pada Ringkasan (`/admin` Overview) sesuai permintaan eksplisit pengguna.
- Wajib mempertahankan keutuhan state filter, search, URL query params, dan sessionStorage pada setiap modul admin.
- Build Next.js (`pnpm build`) harus sukses bersih dengan 0 error.

---

### Task 1: Perbaikan 5 Cacat Visual Layar < 320px (Modal Collision, Card Footer Wrapping, Curhat Date Wrapping)

**Files:**
- Modify: `src/components/assessment/AssessmentDeleteModal.tsx:109-125`
- Modify: `src/components/home/CurhatPreviewSection.tsx:88-102`
- Modify: `src/components/counseling/CurhatWall.tsx:340-355`
- Modify: `src/components/home/ArticlesPreviewSection.tsx:64-78`
- Modify: `src/components/articles/ArticleListItem.tsx:27-44`
- Modify: `src/app/articles/[slug]/page.tsx:243-257`
- Modify: `src/components/admin/bookings/BookingDeleteModal.tsx:122-145`
- Modify: `src/components/booking/BookingDeviceDeleteModal.tsx:110-142`
- Modify: `src/components/admin/counseling/CounselingDeleteModal.tsx:122-145`
- Modify: `src/components/admin/articles/ArticleDeleteModal.tsx:122-145`

**Interfaces:**
- Mempertahankan props dan behavior modal/kartu yang ada tanpa breaking change.

- [x] **Step 1: Perbaiki tabrakan teks di `AssessmentDeleteModal.tsx` (Foto 1)**
  - Pada baris 114-117, ganti `flex items-center justify-between` menjadi `flex flex-col min-[340px]:flex-row min-[340px]:items-center justify-between gap-1 min-[340px]:gap-2`.
  - Berikan `shrink-0` pada label `<span className="text-[var(--color-ink-soft)] shrink-0">Hasil:</span>`.
  - Berikan styling aman pada nilai hasil: `<span className="font-semibold text-[var(--color-accent)] min-[340px]:text-right leading-snug break-words">{activeRecord.level}</span>`.
  - Sesuaikan tombol aksi di bagian bawah agar `min-w-0 px-2 sm:px-4 text-[11px] sm:text-xs` tidak terpotong pada 280px.
  - Lakukan pemeriksaan serupa pada `BookingDeleteModal`, `BookingDeviceDeleteModal`, `CounselingDeleteModal`, dan `ArticleDeleteModal`.

- [x] **Step 2: Perbaiki tanggal terputus 2 baris pada kartu Curhat (Foto 4)**
  - Di `src/components/home/CurhatPreviewSection.tsx:88-102`:
    - Ubah container dari `flex items-center gap-2` menjadi `flex flex-wrap items-center gap-1.5 min-[340px]:gap-2`.
    - Tambahkan `shrink-0 whitespace-nowrap` pada container tanggal:
      ```tsx
      <span className="text-[11px] text-[var(--color-ink-soft)] flex items-center gap-1 shrink-0 whitespace-nowrap">
        <Clock className="w-3 h-3 text-[var(--color-ink-soft)] shrink-0" />
        {formatDate(item.createdAt)}
      </span>
      ```
    - Tambahkan `shrink-0` pada pemisah bullet `&bull;`.
    - Tambahkan `truncate max-w-[200px] min-[340px]:max-w-none` pada kategori agar fleksibel dan tidak tumpang tindih.
  - Terapkan perbaikan identik di `src/components/counseling/CurhatWall.tsx:340-355`.

- [x] **Step 3: Perbaiki baris footer metadata artikel pada layar sempit (Foto 3 & Foto 5)**
  - Di `src/components/home/ArticlesPreviewSection.tsx:64-78`:
    - Ubah footer container menjadi:
      `flex flex-col min-[340px]:flex-row min-[340px]:items-center justify-between gap-2 text-xs sm:text-sm text-[var(--color-ink-soft)]`
    - Bungkus kategori dan waktu baca dengan:
      ```tsx
      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
        <span className="font-medium text-[var(--color-accent)] truncate max-w-[170px] min-[340px]:max-w-none">{art.category}</span>
        <span className="text-[var(--color-paper-border)] shrink-0">•</span>
        <span className="shrink-0">{art.readTime}</span>
      </div>
      ```
    - Buat tombol link "Baca tulisan" memiliki `shrink-0 self-start min-[340px]:self-auto`.
  - Di `src/components/articles/ArticleListItem.tsx:27-44`:
    - Sesuaikan container footer menjadi `flex flex-col min-[340px]:flex-row min-[340px]:items-center justify-between gap-2.5 text-xs text-[var(--color-ink-soft)]` dengan `shrink-0` pada action button.
  - Di `src/app/articles/[slug]/page.tsx:243-257`:
    - Terapkan wrapping identik pada footer kartu artikel terkait di halaman detail.

- [x] **Step 4: Verifikasi visual dan typecheck**
  - Jalankan `pnpm build` untuk memastikan tidak ada kesalahan kompilasi atau JSX syntax.

---

### Task 2: Penambahan Pembungkus (Pill Container) pada Tombol Web & Tombol Keluar di Admin Header

**Files:**
- Modify: `src/components/admin/AdminLayoutClient.tsx:60-69, 126-135`

**Interfaces:**
- Menyamakan estetika tombol `Web` dan `Keluar` dengan pill `AdminSessionModal` timer widget yang sudah memiliki border, background surface, dan subtle shadow.

- [x] **Step 1: Berikan styling pembungkus berbingkai pada tombol "Web"**
  - Ubah tombol link `Web` (baris 60-68):
    ```tsx
    <Link
      href="/"
      className="btn-interactive inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)] px-2.5 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/40 shadow-2xs shrink-0 transition-all"
      title="Kembali ke Web Utama"
    >
      <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
      <span className="hidden min-[320px]:inline sm:hidden">Web</span>
      <span className="hidden sm:inline">Web Utama</span>
    </Link>
    ```

- [x] **Step 2: Berikan styling pembungkus berbingkai pada tombol "Keluar"**
  - Ubah tombol `Keluar` (baris 126-134):
    ```tsx
    <button
      onClick={logout}
      type="button"
      className="btn-interactive inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-ink-muted)] hover:text-rose-600 px-2.5 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-rose-200 hover:bg-rose-50/60 shadow-2xs cursor-pointer shrink-0 transition-all"
      title="Keluar dari sesi admin"
    >
      <LogOut className="w-3.5 h-3.5 shrink-0" />
      <span className="hidden sm:inline">Keluar</span>
    </button>
    ```

- [x] **Step 3: Uji tampilan di mobile dan desktop**
  - Pastikan tombol `Web`, widget sesi 30 menit, dan tombol `Keluar` tersusun rapi, simetris, dan masing-masing memiliki wadah bingkai yang seragam.

---

### Task 3: Pembuatan Komponen Reusable `PaginationBar` & Animasi Transisi Halus (`globals.css`)

**Files:**
- Create: `src/components/ui/PaginationBar.tsx`
- Modify: `src/app/globals.css:1000-1025`

**Interfaces:**
- Produces: `PaginationBarProps` dan komponen `PaginationBar`
  ```tsx
  export interface PaginationBarProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    itemLabel?: string; // misal: "janji temu", "curhatan", "artikel"
    onPageChange: (page: number) => void;
    className?: string;
  }
  ```
- Produces CSS class: `.pagination-slide-enter`

- [x] **Step 1: Definisikan keyframe dan CSS class `.pagination-slide-enter` di `globals.css`**
  - Tambahkan animasi transisi halus dengan kurva perlambatan alami:
    ```css
    /* Unified Silky Smooth Pagination Transition */
    @keyframes paginationSlideEnter {
      0% {
        opacity: 0;
        transform: translateY(10px) scale(0.995);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .pagination-slide-enter {
      animation: paginationSlideEnter 320ms cubic-bezier(0.16, 1, 0.3, 1) both;
      will-change: opacity, transform;
    }

    @media (prefers-reduced-motion: reduce) {
      .pagination-slide-enter {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
    }
    ```

- [x] **Step 2: Bangun komponen `PaginationBar.tsx` di `src/components/ui/PaginationBar.tsx`**
  - Tampilkan informasi jumlah: `Menampilkan {startItem} - {endItem} dari {totalItems} {itemLabel}`.
  - Buat algoritma smart page windowing:
    - Jika `totalPages <= 5`: render semua halaman.
    - Jika `totalPages > 5`: render `1`, ellipsis `...`, halaman sekitar `currentPage`, ellipsis, dan halaman terakhir.
    - Pada layar mobile sempit (< 340px): tampilkan indikator ringkas `{currentPage} / {totalPages}` dengan tombol Prev & Next ergonomis agar tidak pernah meluap horizontal.
  - Desain tombol:
    - Active: `bg-[var(--color-accent)] text-white border-[var(--color-accent)] font-semibold shadow-xs`
    - Inactive: `bg-[var(--color-surface)] border-[var(--color-paper-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-ink)]`
    - Prev / Next: `btn-interactive p-2 rounded-xl border border-[var(--color-paper-border)] bg-[var(--color-surface)]` dengan disable state yang bersih.

---

### Task 4: Penerapan Sistem Pagination pada Admin Bookings (`/admin/bookings`)

**Files:**
- Modify: `src/components/admin/bookings/AdminBookingsClient.tsx`
- Modify: `src/components/admin/bookings/BookingList.tsx`

**Interfaces:**
- Consumes: `PaginationBar` dari Task 3.
- Page size: `6` item per halaman.

- [x] **Step 1: Perbarui state pagination di `AdminBookingsClient.tsx`**
  - Tambahkan state `currentPage`: `const [currentPage, setCurrentPage] = useState(1);`.
  - Tambahkan konstanta `ITEMS_PER_PAGE = 6;`.
  - Pasang reset `setCurrentPage(1)` di setiap perubahan filter/pencarian (`handleSearchChange`, `handleStatusChange`, `handleCategoryChange`, `handleDateChange`, `handleResetFilters`).
  - Hitung `totalPages = Math.max(1, Math.ceil(filteredBookings.length / ITEMS_PER_PAGE));`.
  - Buat `paginatedBookings = useMemo(() => filteredBookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filteredBookings, currentPage]);`.
  - Teruskan properti pagination ke `<BookingList />`:
    - `bookings={paginatedBookings}`
    - `currentPage={currentPage}`
    - `totalPages={totalPages}`
    - `totalItems={filteredBookings.length}`
    - `itemsPerPage={ITEMS_PER_PAGE}`
    - `onPageChange={setCurrentPage}`

- [x] **Step 2: Perbarui antarmuka dan render di `BookingList.tsx`**
  - Tambahkan properti pagination ke `BookingListProps`.
  - Bungkus daftar kartu dengan `key={currentPage}` dan class `.pagination-slide-enter`:
    ```tsx
    <div key={currentPage} className="space-y-3.5 sm:space-y-4 pagination-slide-enter">
      {bookings.map((item) => (
        <BookingCard key={item.id} ... />
      ))}
    </div>
    ```
  - Tambahkan `<PaginationBar>` di bawah daftar kartu jika `totalPages > 1`.

- [x] **Step 3: Uji fungsi pagination admin bookings**
  - Verifikasi perpindahan halaman, filter status, filter topik, filter tanggal, dan reset filter tetap berfungsi presisi.

---

### Task 5: Penerapan Sistem Pagination pada Admin Counseling (`/admin/counseling`)

**Files:**
- Modify: `src/components/admin/counseling/AdminCounselingClient.tsx`
- Modify: `src/components/admin/counseling/CounselingList.tsx`

**Interfaces:**
- Consumes: `PaginationBar` dari Task 3.
- Page size: `6` item per halaman.

- [x] **Step 1: Perbarui state pagination di `AdminCounselingClient.tsx`**
  - Tambahkan state `currentPage`: `const [currentPage, setCurrentPage] = useState(1);`.
  - Tambahkan konstanta `ITEMS_PER_PAGE = 6;`.
  - Pasang reset `setCurrentPage(1)` di setiap pergantian filter pencarian, status balas, kategori, visibilitas publik, landing page, dan tanggal.
  - Hitung `totalPages = Math.max(1, Math.ceil(filteredMessages.length / ITEMS_PER_PAGE));`.
  - Buat `paginatedMessages = useMemo(() => filteredMessages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filteredMessages, currentPage]);`.
  - Teruskan properti pagination ke `<CounselingList />`:
    - `curhatList={paginatedMessages}`
    - `currentPage={currentPage}`
    - `totalPages={totalPages}`
    - `totalItems={filteredMessages.length}`
    - `itemsPerPage={ITEMS_PER_PAGE}`
    - `onPageChange={setCurrentPage}`

- [x] **Step 2: Perbarui antarmuka dan render di `CounselingList.tsx`**
  - Tambahkan properti pagination ke `CounselingListProps`.
  - Bungkus daftar kartu dengan `key={currentPage}` dan class `.pagination-slide-enter`:
    ```tsx
    <div key={currentPage} className="space-y-3.5 sm:space-y-4 pagination-slide-enter">
      {curhatList.map((item) => (
        <CounselingCard key={item.id} ... />
      ))}
    </div>
    ```
  - Render `<PaginationBar itemLabel="curhatan" ... />` di bawah list jika `totalPages > 1`.

- [x] **Step 3: Uji fungsi pagination admin counseling**
  - Verifikasi aksi balas (reply), toggle publikasi, toggle landing page, dan navigasi halaman bekerja sempurna tanpa konflik re-render.

---

### Task 6: Penerapan Sistem Pagination pada Admin Articles (`/admin/articles`)

**Files:**
- Modify: `src/components/admin/articles/AdminArticlesClient.tsx`
- Modify: `src/components/admin/articles/ArticleList.tsx`

**Interfaces:**
- Consumes: `PaginationBar` dari Task 3.
- Page size: `6` item per halaman.

- [x] **Step 1: Perbarui state pagination di `AdminArticlesClient.tsx`**
  - Tambahkan state `currentPage`: `const [currentPage, setCurrentPage] = useState(1);`.
  - Tambahkan konstanta `ITEMS_PER_PAGE = 6;`.
  - Pasang reset `setCurrentPage(1)` saat filter status publikasi, topik kategori, landing page, tanggal rilis, atau pencarian berubah.
  - Hitung `totalPages = Math.max(1, Math.ceil(filteredArticles.length / ITEMS_PER_PAGE));`.
  - Buat `paginatedArticles = useMemo(() => filteredArticles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filteredArticles, currentPage]);`.
  - Teruskan properti pagination ke `<ArticleList />`:
    - `articles={paginatedArticles}`
    - `currentPage={currentPage}`
    - `totalPages={totalPages}`
    - `totalItems={filteredArticles.length}`
    - `itemsPerPage={ITEMS_PER_PAGE}`
    - `onPageChange={setCurrentPage}`

- [x] **Step 2: Perbarui antarmuka dan render di `ArticleList.tsx`**
  - Tambahkan properti pagination ke `ArticleListProps`.
  - Bungkus grid kartu artikel dengan `key={currentPage}` dan class `.pagination-slide-enter`:
    ```tsx
    <div key={currentPage} className="grid grid-cols-1 gap-3.5 sm:gap-4 pagination-slide-enter">
      {articles.map((art) => (
        <ArticleCard key={art.id} ... />
      ))}
    </div>
    ```
  - Render `<PaginationBar itemLabel="artikel" ... />` di bawah grid jika `totalPages > 1`.

- [x] **Step 3: Uji fungsi pagination admin articles**
  - Verifikasi aksi toggle publikasi, toggle beranda, ubah artikel, dan hapus artikel beroperasi normal dengan pagination.

---

### Task 7: Penyeragaman Animasi Halus pada Pagination Publik (`/articles` & `/counseling`)

**Files:**
- Modify: `src/components/counseling/CurhatWall.tsx:294-415`
- Modify: `src/components/articles/ArticlesDirectory.tsx:270-335`

**Interfaces:**
- Consumes: `PaginationBar` dari Task 3 dan `.pagination-slide-enter` dari `globals.css`.

- [x] **Step 1: Perbarui `CurhatWall.tsx` dengan transisi halus dan `PaginationBar`**
  - Ganti container list dari `.tab-content-enter` ke `.pagination-slide-enter`:
    `<div key={`${activeTab}-${safePage}`} className="space-y-4 pagination-slide-enter">`
  - Ganti markup pagination manual (baris 360-415) dengan:
    ```tsx
    {!loading && totalPages > 1 && (
      <PaginationBar
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={ITEMS_PER_PAGE}
        itemLabel="curhatan"
        onPageChange={handlePageChange}
      />
    )}
    ```

- [x] **Step 2: Perbarui `ArticlesDirectory.tsx` dengan transisi halus dan `PaginationBar`**
  - Ganti container list dari `.tab-content-enter` ke `.pagination-slide-enter`:
    `<div key={`${activeCategory}-${safePage}`} className="divide-y divide-[var(--color-paper-border)] border-y border-[var(--color-paper-border)] pagination-slide-enter" data-reveal>`
  - Ganti markup pagination manual (baris 280-335) dengan:
    ```tsx
    {totalPages > 1 && (
      <PaginationBar
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={ITEMS_PER_PAGE}
        itemLabel="artikel"
        onPageChange={handlePageChange}
      />
    )}
    ```

---

### Task 8: Verifikasi Menyeluruh (End-to-End Build & Responsive Layout Check)

**Files:**
- All modified files across Tasks 1–7.

- [x] **Step 1: Jalankan Typecheck & Build Project**
  - Jalankan `pnpm build` untuk memvalidasi bahwa seluruh 41 rute sukses terkompilasi tanpa error TypeScript maupun bundling.
- [x] **Step 2: Verifikasi responsivitas pada viewport ekstrem (< 320px)**
  - Uji tata letak pada lebar 280px (Galaxy Z Fold) dan 320px (iPhone SE):
    - Tidak ada teks yang tumpang tindih pada `AssessmentDeleteModal`.
    - Tanggal pada Curhat preview dan Curhat wall tidak pernah terpotong 2 baris.
    - Footer kartu artikel terbungkus rapi tanpa teks yang terhimpit.
    - Tombol Web dan Keluar di admin header memiliki wadah pill pembungkus yang proporsional.
    - Kontrol pagination admin dan publik mengalir lembut dengan animasi transisi baru tanpa kesan kaku.
