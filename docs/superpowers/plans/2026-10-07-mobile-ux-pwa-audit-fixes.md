# Mobile UX, PWA & Admin Audit and Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all 11 mobile UX, PWA, responsive, formatting, and synchronisation issues identified during the comprehensive audit of `amelia-portofolio`.

**Architecture:** 
- Fix double flicker and scroll jumps by eliminating conflicting CSS keyframe transforms (`page-enter` and `animate-fade-in-up`) and preventing `ScrollRevealProvider` from post-mount hiding elements.
- Synchronize format query params between `/services` and `/schedule` (`BookingSection`).
- Provide dedicated PWA install modals (for Android/Browser and iOS) and interactive feedback for already-installed status (`PwaInstalledInfoModal`).
- Elevate typography and formatting: add a full markdown toolbar + cheatsheet modal to `ArticleFormModal`, support underline (`<u>`), and handle natural line breaks (`\n` -> `<br />`) in `ArticleMarkdownRenderer`.
- Fix UI defects: symmetrically center toasts on mobile, add WhatsApp icon to `ArticleShareBar`, remove duplicate time text in `AdminSessionModal`, and make all admin cards and headers fully responsive down to `< 320px`.

**Tech Stack:** Next.js 16.3 (App Router), React 19, Tailwind CSS v4, Lucide React, Serwist PWA (@serwist/next).

**Spec:** User request detailing 11 audit items for mobile experience, PWA capabilities, admin responsiveness, and article formatting.

## Global Constraints
- Framework: Next.js 16 (App Router) with React 19 compliance (no cascading state in effects, maintain SSR compatibility).
- PWA: Keep Serwist configuration and service worker cache clean.
- Accessibility: Maintain WCAG 2.1 AA standards, full keyboard navigability (Esc key, focus management), aria attributes on all interactive elements.
- Design: Calming sage & warm paper palette (`var(--color-paper)`, `var(--color-accent)`), zero AI-slop, clean typography.
- Git & Code Integrity: Preserve all user work, zero-regression.

---

### Task 1: Eliminate Home Page Double Flicker & Assessment Page Scroll Jump

**Files:**
- Modify: `src/components/ScrollRevealProvider.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/assessment/page.tsx`
- Modify: `src/app/schedule/page.tsx`
- Modify: `src/components/ScrollRestorationProvider.tsx`

**Root Cause:**
1. Home page flicker 2x: `<main>` has `.page-enter` (opacity 0 -> 1 over 240ms). Simultaneously, `ScrollRevealProvider` runs `useEffect`, finding sections below the fold and adding `.reveal-pending` (opacity 0), then unobserving and adding `.revealed` (opacity 1). This causes a visible double-fade/blink on mobile refresh.
2. Assessment scroll jump: `app/assessment/page.tsx` nests `.animate-fade-in-up` (`translateY(12px)`) inside `<main className="... page-enter">` (`translateY(8px)`), displacing the viewport by 20px on mount. Furthermore, `ScrollRestorationProvider` passively records any transient layout shift offset into `sessionStorage`.

**Interfaces:**
- Consumes: Native DOM & sessionStorage scroll APIs.
- Produces: Smooth zero-flicker render on refresh and clean top-of-page scroll position.

- [x] **Step 1: Update `ScrollRevealProvider.tsx` to prevent post-mount element hiding**
Ensure that elements already rendered in SSR or near the viewport never get set to `opacity: 0` via `.reveal-pending` if they are in the initial reading area. Increase initial safe viewport threshold to 2.5x window height on initial render.

- [x] **Step 2: Remove redundant nested `animate-fade-in-up` on `assessment/page.tsx` and `schedule/page.tsx`**
Keep the page transition on `<main className="page-enter">` and remove the child container's `animate-fade-in-up` so elements do not suffer compound `translateY` shifts on mobile.

- [x] **Step 3: Update `ScrollRestorationProvider.tsx` to enforce clean scroll reset on page refresh**
On initial mount, ensure `window.scrollTo({ top: 0, behavior: 'instant' })` if no intentional user scroll has occurred, preventing cached layout-shift offsets from displacing the page.

- [x] **Step 4: Verify in browser**
Run `pnpm build` and test refreshing `/` and `/assessment` on mobile viewport to verify zero double-flicker and zero scroll jump.

---

### Task 2: Synchronize Consultation Format Selection Between Services Page & Booking Form

**Files:**
- Modify: `src/data/services-data.ts`
- Modify: `src/components/services/ServicesFormats.tsx`
- Modify: `src/app/schedule/page.tsx`
- Modify: `src/components/BookingSection.tsx`

**Root Cause:**
In `ServicesFormats.tsx`, all three "Pilih format" buttons statically link to `/schedule` with no query parameters. `SchedulePage` did not accept format params, and `BookingSection` defaulted `form.mode` to `'online_meet'`. As a result, selecting "Chat Terjadwal" or "Tatap Muka di Kampus" always resulted in Google Meet.

**Interfaces:**
- Consumes: `CounselingMode` ('online_meet' | 'online_chat' | 'tatap_muka_cirebon') from `src/types`.
- Produces: URL parameter `?format=online_chat` or `?format=tatap_muka_cirebon` pre-populating `form.mode` in `BookingSection`.

- [x] **Step 1: Add `mode: CounselingMode` to each format in `src/data/services-data.ts`**
```ts
export const formats: (ServiceFormat & { mode: CounselingMode })[] = [
  {
    title: 'Google Meet Virtual',
    mode: 'online_meet',
    dur: '60 Menit · Tatap Muka Daring',
    desc: '...',
  },
  {
    title: 'Chat Terjadwal',
    mode: 'online_chat',
    dur: '60 Menit · Komunikasi Teks',
    desc: '...',
  },
  {
    title: 'Tatap Muka di Kampus',
    mode: 'tatap_muka_cirebon',
    dur: '60 Menit · Wilayah Cirebon',
    desc: '...',
  },
];
```

- [x] **Step 2: Update `ServicesFormats.tsx` to include `?format=${f.mode}` in links**
Update `Link href={`/schedule?format=${f.mode}`}` so clicking "Pilih format" passes the exact mode.

- [x] **Step 3: Update `src/app/schedule/page.tsx` to pass `initialMode` to `BookingSection`**
Extract `params?.format || params?.mode` and pass it down as `initialMode={initialMode as CounselingMode}`.

- [x] **Step 4: Update `BookingSection.tsx` to initialize and synchronize `form.mode`**
Set initial `form.mode` to `initialMode || 'online_meet'`. Also in `useEffect`, check `window.location.search` for `format` or `mode` and update `form.mode` accordingly.

- [x] **Step 5: Verify format selection**
Click each of the 3 formats on `/services` and verify that the booking form on `/schedule` has the corresponding card highlighted.

---

### Task 3: Add WhatsApp Icon to Article Share Bar & Symmetrically Align Toasts on Mobile

**Files:**
- Modify: `src/components/articles/ArticleShareBar.tsx`
- Modify: `src/context/ToastContext.tsx`
- Modify: `src/app/globals.css`

**Root Cause:**
1. `ArticleShareBar.tsx` only had text `<span>WhatsApp</span>` without an icon.
2. `ToastContext.tsx` used `fixed bottom-5 right-5 sm:bottom-6 sm:right-6 ... max-w-sm w-full px-4 sm:px-0`. On mobile, `right-5` without `left` caused the toast to be pulled to the right and overflow horizontally on narrow viewports. Also, `truncate` clipped notification messages.

**Interfaces:**
- Consumes: Lucide icons & ToastContext.
- Produces: Polished WhatsApp button in `ArticleShareBar` and perfectly centered, symmetric toasts on mobile.

- [x] **Step 1: Add WhatsApp SVG icon to `ArticleShareBar.tsx`**
Include an authentic WhatsApp brand icon with official SVG path inside the button:
```tsx
<svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
  <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.476-.15-.677.15-.2.301-.777.98-.952 1.18-.176.201-.351.226-.652.075-.301-.15-1.272-.469-2.424-1.496-.895-.799-1.5-1.786-1.676-2.087-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.151-.175.201-.301.301-.501.1-.201.05-.376-.025-.527-.075-.15-.677-1.63-.928-2.232-.244-.587-.492-.507-.677-.517-.175-.01-.376-.01-.577-.01-.201 0-.527.075-.802.376-.276.301-1.053 1.028-1.053 2.508s1.078 2.909 1.229 3.11c.15.201 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.38.197 1.9.12.58-.087 1.782-.728 2.032-1.43.251-.702.251-1.304.176-1.43-.075-.126-.276-.201-.577-.351zM12.04 2C6.51 2 2.02 6.49 2.02 12.02c0 1.96.57 3.79 1.56 5.33L2 22l4.82-1.54c1.48.91 3.22 1.44 5.22 1.44 5.53 0 10.02-4.49 10.02-10.02C22.06 6.49 17.57 2 12.04 2z" />
</svg>
```

- [x] **Step 2: Fix `ToastContext.tsx` viewport positioning for mobile symmetry**
Change viewport to:
```tsx
className="fixed bottom-5 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-[99999] flex flex-col items-center sm:items-end gap-2.5 pointer-events-none select-none"
```
Remove `truncate` from toast message to allow clean multi-line wrapping with `leading-relaxed text-xs sm:text-sm break-words`.

- [x] **Step 3: Verify toast presentation**
Trigger toasts via copy link on article share bar, verify it is horizontally centered with equal 16px margins on mobile screens (320px, 375px, 414px).

---

### Task 4: Remove Redundant Duplicate Time Text in Counselor Session Modal

**Files:**
- Modify: `src/components/admin/AdminSessionModal.tsx`

**Root Cause:**
`AdminSessionModal` displayed large countdown time `29:45`, and directly beneath it rendered `{m > 0 ? `${m} menit ` : ''}{s} detik hingga sesi terkunci otomatis`, creating an unnecessary duplicate time display.

**Interfaces:**
- Consumes: `remainingSeconds` from `AdminSessionModalProps`.
- Produces: Clean, uncluttered session timer widget.

- [x] **Step 1: Simplify countdown subtitle in `AdminSessionModal.tsx`**
Replace lines 146-148:
```tsx
// Before:
<p className="text-xs text-[var(--color-ink-soft)]">
  {m > 0 ? `${m} menit ` : ''}{s} detik hingga sesi terkunci otomatis
</p>

// After:
<p className="text-xs text-[var(--color-ink-soft)]">
  Hingga sesi terkunci otomatis
</p>
```

- [x] **Step 2: Verify in modal dialog**
Open the Admin Session modal by clicking the session timer in the header and verify that the subtitle reads cleanly as "Hingga sesi terkunci otomatis".

---

### Task 5: Enhance Article Editor with Formatting Toolbar, Cheatsheet & Fix Line Break Rendering

**Files:**
- Modify: `src/components/admin/articles/ArticleFormModal.tsx`
- Modify: `src/components/articles/ArticleMarkdownRenderer.tsx`
- Create: `src/components/admin/articles/ArticleMarkdownCheatsheet.tsx`

**Root Cause:**
1. `ArticleFormModal` only had a bare `<textarea>` with zero formatting buttons.
2. `ArticleMarkdownRenderer` did not parse underline (`<u>...</u>`), and dropped single line breaks (`\n`) within paragraphs because HTML collapsed whitespace.
3. The modal's preview used an incomplete 10-line split logic rather than the canonical renderer.

**Interfaces:**
- Consumes: Markdown strings from `ArticleFormModal`.
- Produces: Textarea selection insertion helpers and robust Markdown rendering (including line breaks, bold, italic, underline, lists, quotes, headings).

- [x] **Step 1: Enhance `ArticleMarkdownRenderer.tsx` with underline support & line breaks**
1. Add underline parsing regex in `renderInlineMarkdown`:
   `<u>text</u>` -> `<span className="underline underline-offset-4 decoration-[var(--color-accent)]">{text}</span>`.
2. Support soft line breaks: split paragraph text by `\n` and render with `<React.Fragment key={lineIdx}>{lineIdx > 0 && <br />}{renderInlineMarkdown(line)}</React.Fragment>`.

- [x] **Step 2: Create `ArticleMarkdownCheatsheet.tsx`**
A drawer/collapsible guide modal explaining:
- Bold: `**teks tebal**`
- Italic: `*teks miring*`
- Underline: `<u>teks garis bawah</u>`
- Subjudul: `## Subjudul Tingkat 2`, `### Subjudul Tingkat 3`
- Kutipan: `> Kutipan reflektif`
- Butir Poin: `- Poin 1`
- Penomoran: `1. Langkah pertama`
- Baris Baru: Tekan Enter untuk baris baru

- [x] **Step 3: Add Markdown Formatting Toolbar in `ArticleFormModal.tsx`**
Add interactive toolbar buttons above the textarea:
- **B** (Bold)
- *I* (Italic)
- <u>U</u> (Underline)
- H2 (Subjudul)
- H3 (Sub-subjudul)
- Quote (Kutipan)
- List (Daftar Poin)
- ListOrdered (Penomoran)
- Link (Tautan)
- Help (Buka Petunjuk Format)
Clicking each button wraps or inserts markdown syntax at current cursor selection in the textarea.

- [x] **Step 4: Use `ArticleMarkdownRenderer` in `ArticleFormModal.tsx` Preview tab**
Replace the primitive preview parser with `<ArticleMarkdownRenderer content={formData.content} />` so the preview is 100% identical to the published article.

- [x] **Step 5: Verify article editing and preview**
Test inserting bold, italic, underline, headings, and typing single line breaks. Verify that the Preview tab and the public page render every format and line break correctly.

---

### Task 6: PWA Installation Overhaul (Universal Guide, Smart Banner & Installed Status Feedback)

**Files:**
- Modify: `src/lib/pwa-store.ts`
- Modify: `src/components/pwa/PwaLifecycle.tsx`
- Modify: `src/components/home/AppShowcaseSection.tsx`
- Create: `src/components/pwa/PwaBrowserGuideModal.tsx`
- Create: `src/components/pwa/PwaInstalledInfoModal.tsx`

**Root Cause:**
1. In `AppShowcaseSection`, the "Terpasang" indicator was a static `<div>` with zero feedback when clicked.
2. In `pwa-store.ts`, clicking "Pasang" when `deferredPrompt` is null on Android or non-iOS browsers silently failed or scrolled without guidance.
3. Banner had an aggressive 35s delay and 14-day lockout on dismissal.

**Interfaces:**
- Consumes: PWA state store (`usePwa()`).
- Produces: `PwaBrowserGuideModal` for Android/Chromium/Firefox/Edge, `PwaInstalledInfoModal` when tapping the installed badge.

- [x] **Step 1: Create `PwaBrowserGuideModal.tsx`**
Create a universal Android / mobile browser install instruction modal with 3 simple visual steps:
1. Ketuk ikon menu titik tiga (⋮) di kanan atas browser
2. Pilih "Tambahkan ke Layar Utama" (atau "Pasang Aplikasi")
3. Ketuk "Tambah" / "Pasang" untuk menyelesaikan

- [x] **Step 2: Create `PwaInstalledInfoModal.tsx`**
Create an interactive modal shown when the user taps "Aplikasi Telah Terpasang di Perangkat Ini":
- Header: Badge aktif "Amelia PWA v1.5.0"
- Info: Akses instan di beranda ponsel, dukungan bacaan offline, memori hemat &lt; 2MB
- Action buttons: "Lihat Catatan Pembaruan" (opens Changelog), "Cek Pembaruan Sistem", "Tutup"
- Toast notification: "Aplikasi Amelia aktif & siap digunakan offline di perangkatmu."

- [x] **Step 3: Update `AppShowcaseSection.tsx`**
Convert the static `showInstalled` div into an interactive button that triggers `openInstalledInfoModal()`.
Ensure the install button triggers `triggerPwaInstall()`, which opens `PwaBrowserGuideModal` if `deferredPrompt` is unavailable on Android/desktop.

- [x] **Step 4: Update `pwa-store.ts` and `PwaLifecycle.tsx`**
Add state and controls for `showBrowserGuideModal` and `showInstalledInfoModal`. Optimize smart banner delay to 6s with clean dismissal handling.

- [x] **Step 5: Verify PWA interactions**
Verify that clicking the installed badge opens the info modal, and clicking install without native prompt opens the browser guide.

---

### Task 7: PWA App Launch Splash Transition (1.5-Second Smooth Brand Intro)

**Files:**
- Modify: `src/components/pwa/PwaSplashScreen.tsx`
- Modify: `src/app/globals.css`

**Root Cause:**
User noted: "pas awal masuk aplikasi itu malah gak ada design yang rapihnya, harusnya kasih waktu lah misal 1,5 detik atau berapa gitu biar bagus." Currently `PwaSplashScreen` only activated when in standalone mode and did not trigger on initial web visit or hydration.

**Interfaces:**
- Consumes: `sessionStorage` session check.
- Produces: 1.5-second serene brand welcome screen that dissolves smoothly into the app.

- [x] **Step 1: Enhance `PwaSplashScreen.tsx`**
Allow the splash screen to run on initial application entry for ~1500ms (1.1s active display with progress bar, then 400ms smooth dissolve fade-out) for standalone PWA users and first-time session launches.

- [x] **Step 2: Add smooth progress animation in CSS**
Include an elegant, hardware-accelerated progress loading line and soft glow transition that completes right as the fade-out begins.

- [x] **Step 3: Verify splash screen**
Load the app in PWA standalone or simulated standalone mode; verify that the splash displays gracefully for 1.5 seconds and dissolves smoothly into the main UI.

---

### Task 8: Ultra-Narrow Screen Optimization (< 320px / Galaxy Fold / iPhone SE) Across Admin & Public Pages

**Files:**
- Modify: `src/components/admin/AdminLayoutClient.tsx`
- Modify: `src/components/admin/overview/OverviewMetrics.tsx`
- Modify: `src/components/admin/bookings/BookingCard.tsx`
- Modify: `src/components/admin/articles/ArticleCard.tsx`
- Modify: `src/components/admin/counseling/CounselingCard.tsx`
- Modify: `src/components/admin/articles/ArticleFormModal.tsx`
- Modify: `src/app/globals.css`

**Root Cause:**
On screens with width < 320px (e.g. 280px on Galaxy Fold outer screen), horizontal padding `px-5`, inflexible `grid-cols-2` or `grid-cols-3` action rows, and `whitespace-nowrap` cause text stacking, horizontal blowout, and overlapping labels.

**Interfaces:**
- Consumes: Responsive utility classes.
- Produces: Flawless layout and zero overflow down to 260px screen width.

- [x] **Step 1: Optimize `AdminLayoutClient.tsx` for `< 320px`**
- Adjust header padding: `px-3 sm:px-6 lg:px-8`.
- For session countdown button: on screens `< 340px`, display only `29:45` (omit the word "Sesi: ") with clock icon.
- For "Web" link: on `< 320px`, render only `<ArrowLeft />` icon to preserve horizontal room.

- [x] **Step 2: Optimize `OverviewMetrics.tsx` for `< 320px`**
Change grid to `grid-cols-1 min-[340px]:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4` so cards stack cleanly on ultra-narrow viewports without overlapping numbers and titles.

- [x] **Step 3: Optimize `BookingCard.tsx`, `ArticleCard.tsx`, `CounselingCard.tsx` for `< 320px`**
- Allow action button containers to wrap cleanly: `flex flex-wrap items-center gap-1.5`.
- Change `grid-cols-3` in `ArticleCard.tsx` to `flex flex-wrap sm:flex-nowrap gap-1.5`.
- In `BookingCard.tsx`, wrap "Ubah Status:" nicely without forcing rigid widths.
- Ensure card padding is `p-3.5 sm:p-6` to maximize usable screen real estate.

- [x] **Step 4: Verify ultra-narrow layout**
Test in developer tools responsive mode at 280px, 320px, and 360px widths to confirm zero horizontal scroll, zero clipped text, and zero overlapping elements.

---

### Task 9: Full End-to-End Build & Visual Regression Verification

**Files:**
- Run: `pnpm build`
- Run: `pnpm lint`
- Test: Integration and verification checks

- [x] **Step 1: Execute `pnpm build`**
Verify zero TypeScript errors, zero Serwist PWA build errors, and successful webpack output.

- [x] **Step 2: Execute `pnpm lint`**
Verify all lint rules pass cleanly with zero warnings or errors.

- [x] **Step 3: Verification Review Gate**
Review each of the 11 user issues against the changes to confirm 100% coverage and zero regression.
