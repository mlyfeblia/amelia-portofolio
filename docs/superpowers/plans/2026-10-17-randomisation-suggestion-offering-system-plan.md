# Sistem Randomisation, Dynamic Discovery, Smart Suggestion & Contextual Offering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun arsitektur terpadu untuk pengacakan deterministik (seeded randomization/discovery), penataan prioritas cerdas (triage di admin dan publik), serta sistem rekomendasi artikel dan penawaran konseling kontekstual (suggestion & offering) di seluruh subsistem Asesmen, Curhat, Artikel, dan Panel Admin.

**Architecture:** 
1. Utilitas PRNG deterministik (Mulberry32 + Fisher-Yates) bebas hydration mismatch di SSR/Client (`useSeededDiscovery`).
2. Asesmen: Bank soal 16 pertanyaan (4 dimensi x 4 soal), sampling/urutan acak dengan scoring ID-based, rekomendasi artikel terarah dan penawaran konseling berdasarkan dimensi terendah.
3. Curhat Publik: Curhat terjawab di-shuffle per sesi di semua kategori, curhat belum terjawab diletakkan di akhir; offering pasca-submit.
4. Artikel Publik: Eksplorasi acak per sesi dengan toggle kronologis vs rekomendasi, related articles cerdas dan contextual booking offering di akhir artikel.
5. Panel Admin: Priority sorting triage (curhat belum dijawab paling atas, booking pending paling atas, artikel draft paling atas).

**Tech Stack:** Next.js 16 (App Router, Turbopack/Webpack), React 19, TypeScript, Tailwind CSS, Lucide Icons, Vitest.

---

## Global Constraints

1. Zero hydration mismatch (komponen Next.js Client render initial state identik dengan SSR, lalu menerapkan seeded discovery di client mount).
2. Zero pagination jump (seed acak stabil selama sesi/tab aktif agar perpindahan halaman 1, 2, 3 tidak menduplikasi atau menghilangkan item).
3. Zero en-dashes atau em-dashes di kode baru maupun teks UI.
4. Kompatibel penuh dengan 109 unit test Vitest yang ada.

---

## Task Decomposition & Work Breakdown

### Task 1: Fondasi Utilitas Deterministic Seeded Randomization (`src/lib/seeded-random.ts`)

**Files:**
- Create: `src/lib/seeded-random.ts`
- Create: `src/lib/__tests__/seeded-random.test.ts`

**Interfaces:**
- `createPRNG(seed: string | number): () => number`
- `seededShuffle<T>(array: readonly T[], seed: string | number): T[]`
- `useSeededDiscovery<T>(items: T[], storageKey: string, options?: { enabled?: boolean }): { items: T[], refreshSeed: () => void, isClientReady: boolean }`

- [ ] **Step 1: Tulis unit test untuk PRNG dan seededShuffle di `src/lib/__tests__/seeded-random.test.ts`**
  - Uji determinisme: seed yang sama menghasilkan permutasi yang sama.
  - Uji divergensi: seed berbeda menghasilkan permutasi berbeda.
  - Uji integritas data: panjang array dan elemen tetap lengkap (tidak ada elemen hilang/ganda).
- [ ] **Step 2: Jalankan test dan pastikan gagal (merah)**
- [ ] **Step 3: Implementasikan `src/lib/seeded-random.ts`**
  - Algoritma Mulberry32 32-bit generator.
  - Fisher-Yates shuffle deterministik.
  - Hook React `useSeededDiscovery` yang aman dari SSR hydration mismatch dengan fallback gracefully.
- [ ] **Step 4: Jalankan test vitest dan pastikan lulus (hijau)**

---

### Task 2: Subsistem Asesmen Kesejahteraan Jiwa (Bank Soal, Randomisasi Aman, Smart Suggestion & Offering)

**Files:**
- Modify: `src/data/assessment-data.ts`
- Modify: `src/components/AssessmentSection.tsx`
- Modify: `src/components/assessment/AssessmentResult.tsx`
- Create / Modify: `src/lib/__tests__/assessment-random-scoring.test.ts`

**Interfaces:**
- Bank soal diperluas dari 8 menjadi 16 pertanyaan (4 pikiran, 4 emosi, 4 spiritual, 4 sosial).
- `computeDimensionScoresById(answersById: Record<number, number>, activeQuestions: AssessmentQuestion[]): DimensionScoreResult[]`
- `getAssessmentSuggestions(dimensions: DimensionScoreResult[]): { recommendedTopic: string, relatedArticles: Array<{ title: string, slug: string, category: string }>, offeringMessage: string }`

- [ ] **Step 1: Tulis unit test untuk scoring ID-based dan smart suggestion di `assessment-random-scoring.test.ts`**
- [ ] **Step 2: Jalankan test dan pastikan gagal**
- [ ] **Step 3: Perkaya bank data di `src/data/assessment-data.ts`**
  - Tambahkan 8 pertanyaan reflektif baru (total 16 pertanyaan) yang selaras dengan nilai Islam & konseling sebaya.
  - Tambahkan pemetaan saran dimensi ke artikel terkait dan topik booking konseling.
- [ ] **Step 4: Update `AssessmentSection.tsx`**
  - Menggunakan answer mapping berbasis `questionId` (`Record<number, number>`).
  - Mengacak urutan soal dan pilihan jawaban secara deterministik per sesi tanpa merusak scoring.
- [ ] **Step 5: Update `AssessmentResult.tsx`**
  - Tampilkan bagian "Rekomendasi Artikel untuk Pemulihan" sesuai dimensi yang paling membutuhkan perhatian.
  - Perkuat tombol CTA "Jadwalkan Konseling" dengan auto-select topik di URL `/schedule?kategori=...`.
- [ ] **Step 6: Jalankan test vitest dan pastikan semua lulus**

---

### Task 3: Subsistem Ruang Curhat Publik (Seeded Discovery, Unanswered at Bottom, Offering Pasca-Submit)

**Files:**
- Modify: `src/components/counseling/CurhatWall.tsx`
- Modify: `src/components/counseling/CurhatForm.tsx`
- Create / Modify: `src/lib/__tests__/curhat-discovery.test.ts`

**Interfaces:**
- Pemisahan curhat publik menjadi 2 kelompok:
  - `answered`: curhat yang sudah dibalas oleh Amel -> diacak per sesi menggunakan `useSeededDiscovery`.
  - `unanswered`: curhat yang belum dibalas -> ditaruh di urutan paling belakang di setiap kategori.
- Tombol "Jelajahi Cerita Baru" (Refresh Discovery) untuk mengacak ulang urutan.
- Pasca-submit di `CurhatForm.tsx`: menawarkan opsi booking privat 1-on-1.

- [ ] **Step 1: Tulis unit test untuk aturan pengurutan curhat publik (answered first with shuffle, unanswered last)**
- [ ] **Step 2: Jalankan test dan pastikan gagal**
- [ ] **Step 3: Perbarui `CurhatWall.tsx` dengan sorting 2-tier dan seeded shuffle**
  - Terapkan di semua kategori (tab 'Semua' maupun kategori individual).
  - Tambahkan tombol kecil "Acak Ulang Cerita" di samping filter kategori.
- [ ] **Step 4: Perbarui `CurhatForm.tsx` dengan contextual offering**
  - Setelah pesan terkirim, tampilkan offering hangat untuk konseling langsung jika butuh respon privat mendalam.
- [ ] **Step 5: Jalankan test vitest dan pastikan lulus**

---

### Task 4: Subsistem Artikel Publik (Dynamic Discovery, Related Content & Consultation Offering)

**Files:**
- Modify: `src/components/articles/ArticlesDirectory.tsx`
- Modify: `src/app/articles/[slug]/page.tsx`
- Create / Modify: `src/lib/__tests__/articles-discovery.test.ts`

**Interfaces:**
- `ArticlesDirectory.tsx`: Mode "Eksplorasi Rekomendasi" (Seeded Shuffle) vs "Terbaru" (Kronologis).
- `/articles/[slug]`: Smart dynamic related articles + Bottom contextual consultation offering card.

- [ ] **Step 1: Tulis unit test untuk mode discovery artikel dan related articles**
- [ ] **Step 2: Jalankan test dan pastikan gagal**
- [ ] **Step 3: Perbarui `ArticlesDirectory.tsx`**
  - Terapkan `useSeededDiscovery` saat tidak ada kata kunci pencarian.
  - Tambahkan tombol/opsi switch: "Rekomendasi Acak" dan "Terbaru".
- [ ] **Step 4: Perkaya halaman baca artikel `/articles/[slug]/page.tsx`**
  - Tautkan offering booking konseling di akhir artikel dengan topik yang sesuai dengan kategori artikel tersebut.
- [ ] **Step 5: Jalankan test vitest dan pastikan lulus**

---

### Task 5: Panel Admin Triage & Priority Sorting (Action-First)

**Files:**
- Modify: `src/components/admin/counseling/AdminCounselingClient.tsx`
- Modify: `src/components/admin/bookings/AdminBookingsClient.tsx`
- Modify: `src/components/admin/articles/AdminArticlesClient.tsx`
- Create / Modify: `src/lib/__tests__/admin-priority-triage.test.ts`

**Interfaces:**
- `/admin/counseling`: Curhat `!isAnswered` (belum dibalas) otomatis berada di paling atas, disusul curhat yang sudah dibalas.
- `/admin/bookings`: Booking `pending` (menunggu konfirmasi) otomatis berada di paling atas, diikuti `confirmed`, `completed`, lalu `cancelled`.
- `/admin/articles`: Artikel `draft` (belum dipublikasikan) berada di paling atas saat filter status "Semua".

- [ ] **Step 1: Tulis unit test untuk pengurutan prioritas triage di ketiga modul admin**
- [ ] **Step 2: Jalankan test dan pastikan gagal**
- [ ] **Step 3: Update sorting di `AdminCounselingClient.tsx`**
- [ ] **Step 4: Update sorting di `AdminBookingsClient.tsx`**
- [ ] **Step 5: Update sorting di `AdminArticlesClient.tsx`**
- [ ] **Step 6: Jalankan test vitest dan pastikan lulus**

---

### Task 6: Verifikasi Sistem End-to-End & Production Build

- [ ] **Step 1: Jalankan semua unit test: `pnpm vitest run`**
- [ ] **Step 2: Jalankan Next.js build: `pnpm build` (memverifikasi SSG 71 rute)**
- [ ] **Step 3: Verifikasi browser pada tampilan desktop dan mobile via Playwright**
- [ ] **Step 4: Audit kepatuhan aturan zero em/en-dashes dan secret exposure**
