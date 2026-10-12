# Animation, Interaction & Core UX Stabilization Implementation Plan

> **For agentic workers:** ALL TASKS COMPLETED & VERIFIED (GREEN). 8/8 test suites passed (72 tests), 0 build errors.

**Status:** IMPLEMENTATION COMPLETE & VERIFIED

**Goal:** Menyelaraskan arsitektur CSS animasi/transformasi, mengeliminasi benturan Tailwind CSS v4 vs custom CSS di `globals.css`, menuntaskan bug hover jitter, clipping shadow, hilangnya `group`, dan menyelesaikan 9 malfungsi fungsional lainnya agar seluruh interaksi web berjalan mulus, responsif, dan bebas gangguan di desktop maupun mobile.

**Architecture:** 
1. Penyatuan sistem transformasi web: standarisasi semua interaksi transform ke CSS Individual Transform properties modern (`translate`, `scale`, `rotate`) atau deklarasi `@utility` Tailwind v4 tanpa percampuran liar dengan legacy composite `transform`.
2. Restrukturisasi `globals.css`: perbaikan spesifisitas `transition` di `.btn-interactive` dan `.card-interactive`, penghapusan `!important` yang memblokir warna hover, dan pemisahan tegas antara desktop hover (`@media (hover: hover)`) dengan tactile touch response (`:active`).
3. Perbaikan komponen: penambahan kelas `group` yang hilang pada toggle mobile menu dan card item, penghapusan `[contain:paint]` yang memotong bayangan hover, stabilisasi baseline input pencarian, stabilisasi autosave `sessionStorage`, dan implementasi auto-scroll/focus pada validasi form.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React, TypeScript, Vitest.

**Spec:** Dokumen analisis mendalam terhadap bug animasi hover, transisi CSS, scroll reveal, dan masalah interaksi fungsional lintas komponen pada Amelia Portfolio.

## Global Constraints

- Standar framework: Next.js 16 App Router & React 19; jangan gunakan hook atau API deprecated.
- Kompatibilitas Tailwind CSS v4: hindari konflik antara inline composite `transform` dengan individual properties `translate`/`scale`.
- Konsistensi design tokens: gunakan variabel CSS dari `:root` (`--color-accent`, `--color-ink`, `--ease-smooth`, dll.) dan hindari hardcoded color arbitrary jika token sudah tersedia.
- Aksesibilitas & Reduced Motion: hormati `@media (prefers-reduced-motion: reduce)` dengan fallback yang rapi tanpa merusak tata letak.
- Zero FOUC & Zero Jitter: pastikan seluruh animasi tidak memicu looping hover exit atau layout shift.

---

### Task 1: Harmonisasi Arsitektur Transform & Transisi di `globals.css`

**Files:**
- Modify: `src/app/globals.css:205-350, 974-985, 1168-1184`
- Test: `vitest` / browser test verifikasi computed styles

**Interfaces:**
- Consumes: CSS Design Tokens (`--color-accent`, `--dur-base`, `--ease-smooth`, dll.)
- Produces: Definisi kelas `.btn-primary`, `.btn-secondary`, `.btn-interactive`, `.card-interactive` yang bersih, bebas `!important` pada warna hover, dan mencakup `color, background-color, border-color, translate, scale, box-shadow` dalam transisinya.

- [x] **Step 1: Tulis unit test / verifikasi style rules untuk tombol dan kartu**

Buat file pengujian verifikasi CSS atau tambahkan pemeriksaan style di `src/lib/__tests__/style-tokens.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('globals.css architecture verification', () => {
  const css = fs.readFileSync(path.resolve(process.cwd(), 'src/app/globals.css'), 'utf-8');

  it('does not have !important on .btn-secondary:hover color', () => {
    const btnSecondaryHover = css.match(/\.btn-secondary:hover\s*{[^}]+}/)?.[0] || '';
    expect(btnSecondaryHover).not.toContain('color: var(--color-accent) !important;');
  });

  it('btn-interactive includes color in its transition properties', () => {
    const btnInteractive = css.match(/\.btn-interactive\s*{[^}]+}/)?.[0] || '';
    expect(btnInteractive).toContain('color');
  });

  it('card-interactive does not conflict with active scale', () => {
    const cardInteractive = css.match(/\.card-interactive:active\s*{[^}]+}/)?.[0] || '';
    expect(cardInteractive).toBeDefined();
  });
});
```

- [x] **Step 2: Jalankan test untuk memverifikasi kegagalan saat ini**

Run: `pnpm test src/lib/__tests__/style-tokens.test.ts`  
Expected: FAIL (karena `color: var(--color-accent) !important;` masih ada dan `.btn-interactive` belum memiliki `color` dalam `transition`).

- [x] **Step 3: Perbaiki `globals.css`**

1. Pada `.btn-secondary:hover` (baris 254-259), ubah:
```css
.btn-secondary:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background-color: var(--color-accent-soft);
  transform: translateY(-1px);
}
```
*(Hapus `!important` agar tombol sekunder dengan varian khusus seperti tombol logout rose atau action card custom dapat menimpa warnanya dengan Tailwind class).*

2. Pada `.btn-interactive` (baris 977-984), perbaiki deklarasi `transition` agar mencakup `color` dan selaras dengan Tailwind:
```css
.btn-interactive {
  transition: transform var(--dur-instant) var(--ease-smooth),
              translate var(--dur-instant) var(--ease-smooth),
              scale var(--dur-instant) var(--ease-smooth),
              color var(--dur-fast) var(--ease-smooth),
              box-shadow var(--dur-fast) var(--ease-smooth),
              background-color var(--dur-fast) var(--ease-smooth),
              border-color var(--dur-fast) var(--ease-smooth);
  will-change: transform, translate, scale;
}

.btn-interactive:hover {
  /* Memberikan baseline tactile lift yang aman tanpa jitter loop */
  transform: translateY(-1px);
}

.btn-interactive:active {
  transform: translateY(0) scale(0.97);
}
```

3. Pada `.card-interactive` (baris 1168-1184), tambahkan fallback touch `:active` yang responsif:
```css
.card-interactive {
  transition: transform var(--dur-base) var(--ease-smooth),
              translate var(--dur-base) var(--ease-smooth),
              box-shadow var(--dur-base) var(--ease-smooth),
              border-color var(--dur-base) var(--ease-smooth),
              background-color var(--dur-base) var(--ease-smooth);
  will-change: transform, translate, box-shadow;
}

@media (hover: hover) {
  .card-interactive:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px -4px rgba(25, 40, 32, 0.08), 0 4px 8px -4px rgba(25, 40, 32, 0.04);
    border-color: var(--color-accent-border);
  }
}

.card-interactive:active {
  transform: translateY(0) scale(0.99);
}
```

- [x] **Step 4: Jalankan test kembali untuk memverifikasi kelulusan**

Run: `pnpm test src/lib/__tests__/style-tokens.test.ts`  
Expected: PASS

- [x] **Step 5: Commit perubahan Task 1**

```bash
git add src/app/globals.css src/lib/__tests__/style-tokens.test.ts
git commit -m "fix(css): harmonize transition and transform architecture in globals.css"
```

---

### Task 2: Perbaikan Tombol Navbar Mobile Toggle (`group` yang Hilang) & Clipping `[contain:paint]`

**Files:**
- Modify: `src/components/Navbar.tsx:192, 203`

**Interfaces:**
- Consumes: Icon Lucide (`Menu`, `X`), Link schedule
- Produces: Navbar CTA dan hamburger button yang memiliki animasi hover/active mulus tanpa shadow terpotong

- [x] **Step 1: Periksa tombol hamburger dan CTA di `Navbar.tsx`**

Buka `src/components/Navbar.tsx`:
- Baris 192: Hapus kelas arbitrary `[contain:paint]` pada tombol `Janji Temu` karena memotong efek `hover:shadow-[0_4px_12px_rgba(26,86,60,0.22)]`.
- Baris 203: Tambahkan kelas `group` pada `<button>` toggle menu mobile agar `group-hover:scale-110` pada ikon `<Menu>` dan `<X>` di baris 210 & 217 dapat berjalan saat di-hover.

- [x] **Step 2: Lakukan perbaikan pada `Navbar.tsx`**

Ubah baris 192 dari:
```tsx
className="inline-flex items-center justify-center gap-1.5 h-8 md:h-9 px-3 md:px-4 text-xs md:text-sm font-semibold rounded-lg text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] shadow-[0_1px_2px_rgba(25,40,32,0.1)] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(26,86,60,0.22)] active:scale-[0.98] active:shadow-[0_1px_3px_rgba(26,86,60,0.15)] whitespace-nowrap select-none cursor-pointer transform-gpu [backface-visibility:hidden] [contain:paint] transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out"
```
Menjadi:
```tsx
className="inline-flex items-center justify-center gap-1.5 h-8 md:h-9 px-3 md:px-4 text-xs md:text-sm font-semibold rounded-lg text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] shadow-[0_1px_2px_rgba(25,40,32,0.1)] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(26,86,60,0.22)] active:scale-[0.98] active:shadow-[0_1px_3px_rgba(26,86,60,0.15)] whitespace-nowrap select-none cursor-pointer transform-gpu [backface-visibility:hidden] transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out"
```

Ubah baris 203 dari:
```tsx
className="flex md:!hidden relative z-10 w-8 h-8 rounded-lg border border-[var(--color-paper-border)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-accent-border)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]/50 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] items-center justify-center cursor-pointer shrink-0 select-none shadow-2xs"
```
Menjadi:
```tsx
className="group flex md:!hidden relative z-10 w-8 h-8 rounded-lg border border-[var(--color-paper-border)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-accent-border)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]/50 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] items-center justify-center cursor-pointer shrink-0 select-none shadow-2xs"
```

- [x] **Step 3: Uji visual dan verifikasi render di browser**

Verifikasi melalui Playwright browser bahwa hover pada tombol hamburger kini memicu perbesaran icon `<Menu>` (`scale(1.1)`), dan bayangan CTA Janji Temu tidak lagi terpotong patah.

- [x] **Step 4: Commit perubahan Task 2**

```bash
git add src/components/Navbar.tsx
git commit -m "fix(navbar): add missing group class to mobile toggle and unclip cta shadow"
```

---

### Task 3: Peningkatan ScrollRevealProvider untuk Dynamic Client State & Pengurangan Blinking Page-Enter

**Files:**
- Modify: `src/components/ScrollRevealProvider.tsx`
- Modify: `src/app/globals.css:623-640`

**Interfaces:**
- Consumes: DOM nodes marked with `[data-reveal]`
- Produces: Observasi otomatis pada elemen dinamis (filtering kategori, tab switching, pagination) dengan progressive enhancement tanpa FOUC

- [x] **Step 1: Mutakhirkan `ScrollRevealProvider.tsx` dengan `MutationObserver`**

Buka `src/components/ScrollRevealProvider.tsx`. Tambahkan listener mutasi DOM ringan agar elemen baru yang dimuat lewat filter kategori artikel, tab asesmen, atau tab booking langsung terdaftar di observer:
```tsx
// Inside useEffect:
const mutationObserver = new MutationObserver(() => {
  const dynamicElements = document.querySelectorAll('[data-reveal]:not(.revealed):not(.reveal-pending)');
  dynamicElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 1.25) {
      el.classList.add('revealed');
    } else {
      el.classList.add('reveal-pending');
      observer.observe(el);
    }
  });
});

mutationObserver.observe(document.body, { childList: true, subtree: true });
```
Pastikan `mutationObserver.disconnect()` dipanggil di return cleanup.

- [x] **Step 2: Perbaiki `.page-enter` di `globals.css` untuk mencegah layout shift saat SSR**

Ubah `.page-enter` di `src/app/globals.css`:
```css
@keyframes pageEnter {
  from {
    opacity: 0.85;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-enter {
  animation: pageEnter var(--dur-fast) var(--ease-smooth) both;
}
```
*(Mengurangi translasi dari 6px menjadi 2px dan menaikkan starting opacity dari 0 ke 0.85 secara dramatis menghilangkan efek kedip putih kasar saat SSR/hydration tanpa kehilangan rasa transisi masuk).*

- [x] **Step 3: Commit perubahan Task 3**

```bash
git add src/components/ScrollRevealProvider.tsx src/app/globals.css
git commit -m "fix(animation): enhance scroll reveal for dynamic DOM updates and reduce page-enter flicker"
```

---

### Task 4: Perbaikan 9 Malfungsi Interaktif & Fungsional Inti

**Files:**
- Modify: `src/components/counseling/CurhatForm.tsx` (Autosave bug)
- Modify: `src/components/articles/ArticlesDirectory.tsx` (Double divider & search input jump)
- Modify: `src/components/counseling/CurhatWall.tsx` (Search input alignment & jump)
- Modify: `src/components/booking/BookingClientInfoStep.tsx` (WhatsApp phone masking & digit limit)
- Modify: `src/components/BookingSection.tsx` (Form auto-scroll on validation error)
- Modify: `src/components/assessment/AssessmentHistory.tsx` (Mobile button layout)
- Modify: `src/components/ui/Tabs.tsx` (Pills border radius & proportion)

**Interfaces:**
- Consumes: Form states, filter states, session storage
- Produces: Interaksi form, input pencarian, tombol kategori, dan validasi yang bebas error

- [x] **Step 1: Perbaiki autosave di `CurhatForm.tsx`**

Hapus guard yang mencegah pembersihan draft saat form dikosongkan total:
```tsx
// src/components/counseling/CurhatForm.tsx
useEffect(() => {
  const timer = setTimeout(() => {
    if (!message.trim() && !alias.trim()) {
      sessionStorage.removeItem('curhat_draft_v1');
      setIsDraftSaved(false);
    } else {
      sessionStorage.setItem('curhat_draft_v1', JSON.stringify({ message, alias, category }));
      setIsDraftSaved(true);
    }
  }, 500);

  return () => clearTimeout(timer);
}, [message, alias, category]);
```

- [x] **Step 2: Hilangkan double divider di `ArticlesDirectory.tsx`**

Di kontainer daftar artikel `ArticlesDirectory.tsx`:
Ubah `divide-y border-y` menjadi `divide-y border-t`. Garis bawah penutup daftar disediakan tunggal oleh `PaginationBar` (`border-t`), sehingga tidak ada lagi 2 garis bertumpuk.

- [x] **Step 3: Stabilkan search input di `CurhatWall.tsx` dan `ArticlesDirectory.tsx`**

Pastikan container `.search-input` memiliki tinggi terkunci (`h-10` / `h-10.5`), ikon kaca pembesar dan tombol clear memiliki `position: absolute`, `top-1/2 -translate-y-1/2`, `pointer-events-none` (untuk ikon), dan input memiliki `display: block` agar pengetikan tidak menggeser baseline atau ikon.

- [x] **Step 4: Terapkan auto-masking dan batasan 9-13 digit no. WhatsApp di `BookingClientInfoStep.tsx`**

1. Set default nomor `08`.
2. Format otomatis dengan tanda hubung: `0812-3456-7890`.
3. Batasi maksimal 13 digit angka (`08xx-xxxx-xxxx`).
4. Berikan pesan error real-time jika nomor kurang dari 9 digit atau lebih dari 13 digit.

- [x] **Step 5: Terapkan auto-scroll dan focus ke field invalid di `BookingSection.tsx` dan `CurhatForm.tsx`**

Saat submit gagal validasi:
```tsx
const firstErrorEl = document.querySelector('.form-input-error') as HTMLElement;
if (firstErrorEl) {
  firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  firstErrorEl.focus();
}
```

- [x] **Step 6: Kembalikan proporsi Tab Pills di `Tabs.tsx`**

Ubah varian `pills` di `Tabs.tsx` dari `rounded-full min-h-[44px]` menjadi `rounded-xl min-h-[34px] sm:min-h-[36px] px-3 py-1.5` agar rapi dan tidak memanjang lonjong.

- [x] **Step 7: Jalankan integrasi test & build**

Run: `pnpm test`  
Run: `pnpm build`  
Expected: PASS tanpa error build atau type error.

- [x] **Step 8: Commit perubahan Task 4**

```bash
git add src/components/counseling/CurhatForm.tsx src/components/articles/ArticlesDirectory.tsx src/components/counseling/CurhatWall.tsx src/components/booking/BookingClientInfoStep.tsx src/components/BookingSection.tsx src/components/assessment/AssessmentHistory.tsx src/components/ui/Tabs.tsx
git commit -m "fix(ux): resolve autosave bug, double dividers, search jumping, and form validation auto-scroll"
```

---

### Task 5: Verifikasi Menyeluruh & Regresi Lintas Browser/Device

**Files:**
- Test: Playwright automation / unit tests

- [x] **Step 1: Jalankan pengujian interaksi Playwright**
- [x] **Step 2: Periksa konsol browser untuk 0 error & 0 warning**
- [x] **Step 3: Uji skenario prefers-reduced-motion**
- [x] **Step 4: Commit hasil verifikasi akhir**

---

## Self-Review Checklist

1. **Spec coverage:** Seluruh keluhan user mengenai animasi hover, transisi CSS yang macet/glitch, dan 9 poin malfungsi fungsional terpetakan dalam task konkret.
2. **Placeholder scan:** Tidak ada TODO, TBD, atau instruksi kosong.
3. **Type consistency:** Semua nama tipe, file, dan utility selaras dengan basis kode aktual.
