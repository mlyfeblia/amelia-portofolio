# Comprehensive System Audit, Email Automation, View Counter & UI/UX Maturation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menuntaskan seluruh temuan audit mendalam arsitektural dan antarmuka di seluruh website Amelia BKI:
1. Mematangkan **Sistem Notifikasi Email (Resend API)** dengan template desain **Islami Modern** untuk seluruh siklus status booking (`terkonfirmasi`, `selesai`, `dibatalkan`) terintegrasi langsung di endpoint update admin.
2. Mematangkan **Article View Counter & Reader Engagement System**: merestrukturisasi posisi metadata di header artikel menjadi pill badges yang rapi pada resolusi < 320px (280px–320px), mematangkan trigger visibility detection, dan menampilkan view counter di card preview direktori artikel.
3. Menstandarisasikan **Modal Keputusan (`ConfirmDecisionModal`)** pada seluruh aksi krusial pengguna publik: Kirim Janji Temu (`BookingSection.tsx`), Kirim Curhat Anonim (`CurhatForm.tsx`), dan Ulangi Asesmen (`AssessmentResult.tsx`).
4. Membangun sistem **Autosave & Pemulihan Draf Otomatis** pada `CurhatForm.tsx` untuk mencegah kehilangan cerita saat reload/ganti tab, dilengkapi otomatisasi kapitalisasi PUEBI.
5. Menstandarisasikan **Pembungkus Tombol (Pill Containers)** yang belum seragam (seperti tombol eksplorasi di `ArticleSidebar.tsx`) dan mengeliminasi sisa icon emoji di `NotificationPromptModal.tsx` menggantinya dengan Lucide icons berestetika human craft.
6. Mengoptimalkan **Slider Horizontal & Tab Centering** serta **Responsivitas Ekstrem Resolusi Rendah (280px–320px)** di seluruh halaman publik dan admin.
7. Menjalankan verifikasi penuh (`pnpm test:slug`, `npx tsc --noEmit`, `pnpm build`).

**Architecture:**
- Email: Templating modular berbasis HTML/CSS inline kompatibel dengan semua email client (Gmail, Apple Mail, Outlook), dengan styling Islami Modern (warm cream `#FBF9F5`, deep sage `#1A563C`, aksen emerald, kaligrafi teks basmalah, hadits/ayat penyejuk hati). Dispatched non-blocking di `PATCH /api/bookings/[id]`.
- Modals: Reusable `ConfirmDecisionModal` dengan z-index `z-[11000]`, backdrop blur lembut tanpa tint gelap, dan keyboard `Escape` handler.
- UI/UX: Fluid padding (`px-3 min-[340px]:px-4 sm:px-6`), `break-words`, `min-w-0`, zero layout shift.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, Resend SDK, Lucide Icons, Serwist PWA.

## Global Constraints
- STRICT CONSTRAINT: Jangan pernah mengubah atau mengutak-atik tombol "Jadwalkan Konsultasi" di `/about`.
- STRICT CONSTRAINT: Zero icon `Sparkles` di seluruh proyek.
- STRICT CONSTRAINT: Zero AI-slop visual cliches (hindari emoji feature icons mentah, trust gradients dua warna murahan, border kiri warna-warni sembarangan).
- Wajib mendukung layar hingga 280px (Samsung Galaxy Z Fold cover screen) tanpa scroll horizontal liar.
- Semua aksi perubahan data permanen/krusal wajib melalui `<ConfirmDecisionModal>`.

---

### Task 1: Template Email Desain Islami Modern & Integrasi Siklus Status Janji Temu (Resend API)

**Files:**
- Create: `src/lib/email-templates/booking-status-updated-template.ts`
- Modify: `src/lib/resend.ts`
- Modify: `src/app/api/bookings/[id]/route.ts`

**Interfaces:**
- Produces: `generateBookingStatusUpdatedHtml(booking: Booking, newStatus: BookingStatus, previousStatus?: BookingStatus): string`
- Produces: `sendBookingStatusUpdateEmail(booking: Booking, newStatus: BookingStatus): Promise<boolean>`

- [x] **Step 1: Buat template email status janji temu berdesain Islami Modern (`booking-status-updated-template.ts`)**
- [x] **Step 2: Tambahkan fungsi pengiriman email status di `src/lib/resend.ts`**
- [x] **Step 3: Hubungkan pengiriman email otomatis di `src/app/api/bookings/[id]/route.ts`**
- [x] **Step 4: Uji TypeScript typecheck**

---

### Task 2: Pematangan Article View Counter & Penataan Metadata Header Resolusi Rendah

**Files:**
- Modify: `src/components/articles/ArticleHeader.tsx`
- Modify: `src/components/articles/ArticleViewTracker.tsx`
- Modify: `src/components/articles/ArticleListItem.tsx`
- Modify: `src/components/home/ArticlesPreviewSection.tsx`

- [x] **Step 1: Restrukturisasi baris metadata artikel di `src/components/articles/ArticleHeader.tsx`**
  - Ganti susunan bullet separator `•` manual dengan **Container Pill Badges** yang rapi dan modular:
    ```tsx
    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
      {article.publishedAt && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-[var(--color-ink-muted)] shadow-2xs shrink-0">
          <time dateTime={getIsoDateString(article.publishedAt)}>{article.publishedAt}</time>
        </span>
      )}
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-[var(--color-ink-soft)] shadow-2xs shrink-0">
        <Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" aria-hidden="true" />
        <span>{article.readTime}</span>
      </span>
      <ArticleViewTracker slug={article.slug} initialViews={article.views ?? 0} />
    </div>
    ```
  - Ini menjamin pada layar 280px–320px, ketiga elemen membungkus secara simetris sebagai pill utuh tanpa tanda titik menggantung di baris atas.

- [x] **Step 2: Matangkan trigger & styling di `src/components/articles/ArticleViewTracker.tsx`**
  - Update komponen agar merender pill container yang serasi:
    ```tsx
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-[var(--color-accent)] font-medium text-xs shadow-2xs shrink-0',
        className
      )}
      title={`${views} kali dibaca`}
    >
      <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{views} pembaca</span>
    </span>
    ```
  - Tambahkan proteksi `document.visibilityState === 'visible'` pada timer dwell time agar hanya menghitung saat tab benar-benar aktif dibaca pengguna.

- [x] **Step 3: Tampilkan view count yang proporsional di daftar artikel**
  - Di `ArticleListItem.tsx`: tambahkan tampilan view count minimalis di sebelah `readTime`:
    ```tsx
    {typeof article.views === 'number' && article.views > 0 && (
      <>
        <span className="text-[var(--color-paper-border)] shrink-0" aria-hidden="true">&bull;</span>
        <span className="inline-flex items-center gap-1 text-[var(--color-ink-muted)] shrink-0">
          <Eye className="w-3 h-3 text-[var(--color-accent)]" />
          <span>{article.views} pembaca</span>
        </span>
      </>
    )}
    ```
  - Di `ArticlesPreviewSection.tsx`: tambahkan tampilan view count serupa dengan safeguards `truncate` dan `shrink-0`.

- [x] **Step 4: Uji TypeScript typecheck**
  - Jalankan: `npx tsc --noEmit`.

---

### Task 3: Standarisasi Modal Keputusan (`ConfirmDecisionModal`) Menyeluruh di Sisi Pengguna Publik

**Files:**
- Modify: `src/components/BookingSection.tsx`
- Modify: `src/components/booking/BookingSessionDetailsStep.tsx`
- Modify: `src/components/counseling/CurhatForm.tsx`
- Modify: `src/components/assessment/AssessmentResult.tsx`

- [x] **Step 1: Modal konfirmasi submit janji temu di `src/components/BookingSection.tsx`**
  - Tambahkan state `const [showBookingConfirmModal, setShowBookingConfirmModal] = useState(false);`.
  - Pada `handleSubmit`, jika seluruh validasi input valid (nama, HP, email, tanggal, sesi), jangan langsung fetch API: buka `setShowBookingConfirmModal(true)`.
  - Render `<ConfirmDecisionModal>`:
    - Judul: *"Kirim Permohonan Jadwal Konseling?"*
    - Deskripsi: *"Pastikan kontak WhatsApp dan email kamu aktif untuk menerima konfirmasi jadwal dan panduan pertemuan bersama Kak Amel."*
    - Konfirmasi: *"Ya, Kirim Permohonan"*
    - Variant: `"primary"`
    - Icon: `<CalendarPlus className="w-5 h-5 text-[var(--color-accent)]" />`
    - Item detail:
      - Konseli: `{form.name} {form.alias ? `(${form.alias})` : ''}`
      - Kontak: `{form.phone} • {form.email}`
      - Jadwal: `{form.date} • {form.timeSlot}`
      - Format: `{selectedModeLabel}`
    - Eksekusi submit: fungsi `executeBookingSubmit()`.

- [x] **Step 2: Modal konfirmasi kirim cerita di `src/components/counseling/CurhatForm.tsx`**
  - Tambahkan state `const [showCurhatConfirmModal, setShowCurhatConfirmModal] = useState(false);`.
  - Pada form submit: jika `message.trim().length >= 10`, buka modal konfirmasi `setShowCurhatConfirmModal(true)`.
  - Render `<ConfirmDecisionModal>`:
    - Judul: *"Kirim Cerita ke Ruang Curhat?"*
    - Deskripsi: *"Pesanmu akan dikirimkan secara aman dan anonim tanpa menampilkan identitas asli. Kak Amel akan membaca dan memberikan tanggapan penguatan di Dinding Cerita."*
    - Konfirmasi: *"Ya, Kirim Cerita"*
    - Variant: `"primary"`
    - Icon: `<Send className="w-5 h-5 text-[var(--color-accent)]" />`
    - Item detail:
      - Nama Samaran: `{alias.trim() || 'Hamba Allah'}`
      - Kategori: `{category}`
      - Panjang Cerita: `{message.trim().length} karakter`
    - Eksekusi submit: fungsi `executeCurhatSubmit()`.

- [x] **Step 3: Modal konfirmasi ulangi asesmen di `src/components/assessment/AssessmentResult.tsx`**
  - Di `AssessmentResult.tsx`, tambahkan state `const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);`.
  - Ubah tombol "Ulangi Asesmen" agar memicu `setShowResetConfirmModal(true)`.
  - Render `<ConfirmDecisionModal>`:
    - Judul: *"Ulangi Asesmen dari Awal?"*
    - Deskripsi: *"Jawaban saat ini akan dikosongkan untuk memulai evaluasi baru. Hasil evaluasi yang telah tuntas tetap tersimpan aman di tab Riwayat perangkat ini."*
    - Konfirmasi: *"Ya, Ulangi Asesmen"*
    - Variant: `"neutral"`
    - Icon: `<RotateCcw className="w-5 h-5 text-[var(--color-ink-muted)]" />`
    - Action: menjalankan `onReset()`.

- [x] **Step 4: Uji TypeScript typecheck**
  - Jalankan: `npx tsc --noEmit`.

---

### Task 4: Sistem Autosave & Pemulihan Draf Otomatis di CurhatForm

**Files:**
- Modify: `src/components/counseling/CurhatForm.tsx`

- [x] **Step 1: Implementasikan penyimpanan draf lokal di `CurhatForm.tsx`**
  - Simpan draf ke `sessionStorage` dengan key `curhat_draft_v1` setiap kali `message`, `alias`, atau `category` berubah (debounced 300ms).
  - Pada saat mount, jika `sessionStorage` memiliki draf tersimpan, pulihkan state `alias`, `category`, dan `message`.
  - Tampilkan indikator status draf halus di bawah textarea:
    `{isDraftSaved && <span className="text-[10px] text-emerald-700 font-medium inline-flex items-center gap-1"><Check className="w-3 h-3 text-emerald-600" /> Draf tersimpan otomatis</span>}`
  - Saat pesan berhasil terkirim (`setSent(true)`), bersihkan `curhat_draft_v1` dari `sessionStorage`.

- [x] **Step 2: Otomatisasi kapitalisasi nama samaran (PUEBI)**
  - Terapkan `formatPersonName` dari `@/lib/text-formatter` pada input alias saat `onChange` agar awalan kata selalu kapital rapi secara otomatis.

- [x] **Step 3: Uji TypeScript typecheck**
  - Jalankan: `npx tsc --noEmit`.

---

### Task 5: Standardisasi Pembungkus Tombol & Pembersihan Anti-Slop Icons

**Files:**
- Modify: `src/components/articles/ArticleSidebar.tsx`
- Modify: `src/components/pwa/NotificationPromptModal.tsx`

- [x] **Step 1: Standardisasikan link pembungkus tombol di `src/components/articles/ArticleSidebar.tsx`**
  - Ubah link "Jelajahi kategori lain &rarr;" (lines 70-75) dari raw text menjadi framed pill button standar:
    ```tsx
    <Link
      href="/articles"
      className="btn-secondary btn-interactive inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/50 shadow-2xs transition-all"
    >
      <span>Jelajahi Kategori Lain</span>
      <ArrowRight className="w-3.5 h-3.5 text-[var(--color-ink-muted)] shrink-0" aria-hidden="true" />
    </Link>
    ```

- [x] **Step 2: Bersihkan raw emoji di `src/components/pwa/NotificationPromptModal.tsx`**
  - Ganti emoji `⏰`, `💌`, `📖` pada list manfaat notifikasi (lines 140-154) dengan ikon Lucide profesional berwadah rounded:
    - `<Clock className="w-4 h-4 text-[var(--color-accent)]" />` di wadah `w-7 h-7 rounded-lg bg-[var(--color-accent-soft)]`
    - `<HeartHandshake className="w-4 h-4 text-[var(--color-accent)]" />` di wadah `w-7 h-7 rounded-lg bg-[var(--color-accent-soft)]`
    - `<BookOpen className="w-4 h-4 text-[var(--color-accent)]" />` di wadah `w-7 h-7 rounded-lg bg-[var(--color-accent-soft)]`
  - Selaras dengan prinsip human craft skill `anti-ai-slop`.

- [x] **Step 3: Uji TypeScript typecheck**
  - Jalankan: `npx tsc --noEmit`.

---

### Task 6: Audit & Pengoptimalan Responsivitas Ekstrem Resolusi Rendah (280px–320px)

**Files:**
- Modify: `src/components/home/HeroSection.tsx`
- Modify: `src/components/home/AppShowcaseSection.tsx`
- Modify: `src/components/about/AboutCta.tsx`
- Modify: `src/components/services/ServicesCta.tsx`

- [x] **Step 1: Audit dan sesuaikan tombol aksi di HeroSection dan CTA**
  - Pada `HeroSection.tsx`, ubah pembungkus tombol aksi agar di bawah 360px (seperti 280px) menggunakan `w-full min-[360px]:w-auto justify-center`:
    `className="btn-primary btn-interactive min-h-[44px] px-5 sm:px-6 text-sm sm:text-[15px] inline-flex items-center justify-center gap-2 w-full min-[360px]:w-auto"`
  - Pada `AboutCta.tsx` dan `ServicesCta.tsx`: terapkan `w-full min-[360px]:w-auto justify-center` pada tombol aksi agar tidak menabrak batas layar sempit.

- [x] **Step 2: Audit AppShowcaseSection pada layar < 320px**
  - Di `AppShowcaseSection.tsx`, pastikan container tombol "Pasang Aplikasi Sekarang" dan "Panduan Pasang iPhone" membungkus rapi dengan `w-full min-[360px]:w-auto`.

- [x] **Step 3: Uji TypeScript typecheck**
  - Jalankan: `npx tsc --noEmit`.

---

### Task 7: Verifikasi Menyeluruh & Uji Produksi (`pnpm build`)

**Files:**
- Seluruh file yang dimodifikasi.

- [x] **Step 1: Jalankan Uji Slug Suite**
  - Jalankan: `pnpm test:slug`
  - Harapan: Seluruh 16 unit test lulus tanpa regresi.

- [x] **Step 2: Jalankan TypeScript Compiler Check**
  - Jalankan: `npx tsc --noEmit`
  - Harapan: 0 error tipe.

- [x] **Step 3: Jalankan Build Produksi Next.js**
  - Jalankan: `pnpm build`
  - Harapan: Exit code 0, 43/43 rute terkompilasi sukses, bundling Serwist service worker berhasil.
