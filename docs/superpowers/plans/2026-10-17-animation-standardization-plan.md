# Animation & Interaction Design System Standardization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize and harmonize all UI animations across the application, eliminating excessive, jarring, and conflicting hover/transform animations, fixing mobile touchscreen sticky hover bugs, and establishing a calm, dignified, and consistent interaction system for Amelia's Islamic counseling portfolio.

**Architecture:** 
1. Remove un-gated custom hover variants (`@custom-variant hover (&:hover)`) from `globals.css`.
2. Strictly gate desktop hover lift/scale transforms behind `@media (hover: hover) and (pointer: fine)`.
3. Provide dedicated touch/mobile handling (`@media (hover: none), (pointer: coarse)`) with clean `:active` feedback without sticky hover states.
4. Harmonize `.card-interactive`, `.nav-link-interactive`, `.hero-photo-interactive`, `.btn-interactive`, and icon hover behaviors to subtle micro-interactions (max 1.5px lift, max 4% icon scale, no rotating icons).
5. Strip `.card-interactive` from non-clickable / informational components (AppShowcase feature bullets, CV items, Workflow steps, Curhat quotes, Admin data cards).
6. Verify via comprehensive unit tests and build check.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4, TypeScript, Lucide React, Vitest.

**Spec:** Audited findings from current codebase interaction state (commits `c0ea480` and `8434b99`).

## Global Constraints
- Preserve project color tokens (`--color-paper`, `--color-ink`, `--color-accent`, etc.).
- Maintain strict accessibility compliance with `prefers-reduced-motion: reduce`.
- Retain existing unit test pass rate across the full test suite.
- Respect UI/UX guidelines: tone must be tranquil, respectful, professional, and empathetic (no bouncy slop, cartoon scales, or rotating icons).

---

### Task 1: CSS Design Tokens & Media-Gated Hover Standardization in `src/app/globals.css`

**Files:**
- Modify: `src/app/globals.css`
- Test: `src/lib/__tests__/style-tokens.test.ts`
- Test: `src/lib/__tests__/animation-standardization.test.ts`

- [ ] **Step 1: Write failing test in `src/lib/__tests__/animation-standardization.test.ts`**
  - Verify that `@custom-variant hover (&:hover)` is eliminated or properly gated.
  - Verify that `.card-interactive` hover uses calm translation (`translateY(-1.5px)` or `translateY(-2px)`) and does not exceed -2px.
  - Verify that `.card-icon-pop` hover does not exceed `scale(1.05)`.
  - Verify that `.hero-photo-interactive` does not jump 6px.
  - Verify that hover transforms are gated behind `@media (hover: hover) and (pointer: fine)`.

- [ ] **Step 2: Update `src/app/globals.css`**
  - Remove `@custom-variant hover (&:hover);` and `@custom-variant group-hover (:where(.group):hover &);`.
  - Update `.card-interactive`:
    - Base: smooth transition for `box-shadow`, `border-color`, `transform`.
    - Desktop hover (`@media (hover: hover) and (pointer: fine)`): subtle lift `translateY(-1.5px)`, gentle shadow `var(--shadow-sm)`, border `var(--color-accent-border)`.
    - Active: `transform: translateY(0) scale(0.99)`.
    - Touch devices (`@media (hover: none), (pointer: coarse)`): `transform: none`, no sticky hover lift.
  - Update `.card-icon-pop`:
    - Desktop hover: subtle `scale(1.04)`, smooth color & background shift.
  - Update `.nav-link-interactive`:
    - Desktop hover: NO vertical translation (`transform: none` instead of `translateY(-2px)`). Soft background and accent text.
    - Active: `transform: scale(0.98)`.
    - Nav link icon: clean color transition without `scale(1.22)`.
  - Update `.hero-photo-interactive`:
    - Desktop hover: calm frame `transform: none` or subtle `translateY(-1px)`.
    - Image: smooth `scale(1.02)` (down from `scale(1.08)`).
  - Update `.btn-interactive` and button components to ensure consistent 1px lift on desktop hover and `scale(0.98)` on active.

- [ ] **Step 3: Run Vitest to verify CSS tokens test passes**
  - Run `pnpm test`

---

### Task 2: Standardize Home Page Components (`HeroSection`, `ApproachSection`, `TrackRecordSection`, `ServicesSection`, `AppShowcaseSection`, `AssessmentCallout`, `CurhatPreviewSection`)

**Files:**
- Modify: `src/components/home/HeroSection.tsx`
- Modify: `src/components/home/ApproachSection.tsx`
- Modify: `src/components/home/TrackRecordSection.tsx`
- Modify: `src/components/home/ServicesSection.tsx`
- Modify: `src/components/home/AppShowcaseSection.tsx`
- Modify: `src/components/home/AssessmentCallout.tsx`
- Modify: `src/components/home/CurhatPreviewSection.tsx`

- [ ] **Step 1: Refactor `HeroSection.tsx`**
  - Remove competing `hover:shadow-2xl hover:-translate-y-2 group-hover:scale-110` and `card-interactive` on hero portrait. Rely on standardized `.hero-photo-interactive`.
- [ ] **Step 2: Refactor `ApproachSection.tsx`**
  - Remove competing `hover:shadow-xl hover:-translate-y-2` from the 4 cards. Keep `.card-interactive`.
  - Remove `group-hover:scale-125` from icons (`Heart`, `Lock`, `ShieldCheck`, `MessageCircle`). Use gentle color transition.
- [ ] **Step 3: Refactor `TrackRecordSection.tsx`**
  - Remove competing `hover:shadow-xl hover:-translate-y-2` from the 3 cards. Keep `.card-interactive`.
  - Remove `group-hover:scale-125` from icon containers. Rely on standardized `.card-icon-pop`.
- [ ] **Step 4: Refactor `ServicesSection.tsx`**
  - Remove competing `hover:shadow-xl hover:-translate-y-2` from the 3 service format preview cards.
- [ ] **Step 5: Refactor `AppShowcaseSection.tsx`**
  - Remove `card-interactive` from the 4 static feature bullet cards (`Akses Instan`, `Dukungan Offline`, `Super Ringan`, `Ruang Aman`). Keep clean static cards.
- [ ] **Step 6: Refactor `AssessmentCallout.tsx`**
  - Remove `card-interactive` from the full-width section card.
- [ ] **Step 7: Refactor `CurhatPreviewSection.tsx`**
  - Remove `card-interactive` from non-clickable testimonial cards. Use clean static card styling with subtle border.

---

### Task 3: Standardize Navigation & Header (`Navbar.tsx`)

**Files:**
- Modify: `src/components/Navbar.tsx`
- Test: `src/lib/__tests__/navbar-interactive.test.ts`

- [ ] **Step 1: Refactor `Navbar.tsx`**
  - Remove `group-hover:-translate-y-1` and `group-active:translate-y-0 group-active:scale-95` on Amelia brand logo link. Keep graceful color transition.
  - Remove `hover:-translate-y-1 hover:shadow-[0_4px_14px_rgba(26,86,60,0.28)]` on Janji Temu CTA button. Use standardized button hover elevation (`hover:shadow-xs active:scale-[0.98]`).
  - Hamburger menu icon: ensure clean state transitions without unnecessary `scale-110` pop on hover.
- [ ] **Step 2: Verify `navbar-interactive.test.ts` passes**

---

### Task 4: Standardize Assessment & Booking Components (`BookingSection.tsx`, `AssessmentSection.tsx`, `AssessmentResult.tsx`, `AssessmentHistory.tsx`)

**Files:**
- Modify: `src/components/BookingSection.tsx`
- Modify: `src/components/AssessmentSection.tsx`
- Modify: `src/components/assessment/AssessmentResult.tsx`
- Modify: `src/components/assessment/AssessmentHistory.tsx`

- [ ] **Step 1: Refactor `BookingSection.tsx`**
  - Remove rotating icons on tab switches: remove `group-hover:-rotate-3` and `group-hover:rotate-6`, remove `group-hover:scale-110`. Keep calm, clean icons.
- [ ] **Step 2: Refactor `AssessmentSection.tsx`**
  - Remove rotating icons: remove `group-hover:-rotate-3` and `group-hover:rotate-6`, remove `group-hover:scale-110`.
- [ ] **Step 3: Refactor `AssessmentResult.tsx`**
  - Remove `card-interactive` from score dimension items (`cursor-default`).
  - Remove `group-hover:-rotate-3` and `group-hover:scale-110` from CTA action buttons.
- [ ] **Step 4: Refactor `AssessmentHistory.tsx`**
  - Remove `card-interactive` from accordion history containers so clicking expand/copy/delete does not cause container wobble.

---

### Task 5: Standardize About, Services, Articles & Curhat Pages Components

**Files:**
- Modify: `src/components/about/AboutHero.tsx`
- Modify: `src/components/about/AboutEducation.tsx`
- Modify: `src/components/about/AboutWorkExperience.tsx`
- Modify: `src/components/about/AboutSkills.tsx`
- Modify: `src/components/about/AboutCta.tsx`
- Modify: `src/components/services/ServicesFormats.tsx`
- Modify: `src/components/services/ServicesPillars.tsx`
- Modify: `src/components/services/ServicesWorkflow.tsx`
- Modify: `src/components/services/ServicesCta.tsx`
- Modify: `src/components/articles/ArticleCta.tsx`
- Modify: `src/components/counseling/CurhatWall.tsx`

- [ ] **Step 1: Refactor `AboutHero.tsx`**
  - Remove `hover:shadow-2xl hover:-translate-y-2 group-hover:scale-110` on portrait image.
- [ ] **Step 2: Refactor `AboutEducation.tsx`, `AboutWorkExperience.tsx`, `AboutSkills.tsx`**
  - Remove `card-interactive` from static resume/CV milestone cards.
- [ ] **Step 3: Refactor `AboutCta.tsx`, `ServicesCta.tsx`, `ArticleCta.tsx`**
  - Remove `card-interactive` from full-width section callout banners.
- [ ] **Step 4: Refactor `ServicesPillars.tsx`, `ServicesWorkflow.tsx`**
  - Remove `card-interactive` from informational step and pillar cards.
- [ ] **Step 5: Refactor `CurhatWall.tsx`**
  - Remove `card-interactive` from curhat reading quote items.

---

### Task 6: Standardize Admin Dashboard Components (`ArticleCard.tsx`, `BookingCard.tsx`, `CounselingCard.tsx`)

**Files:**
- Modify: `src/components/admin/articles/ArticleCard.tsx`
- Modify: `src/components/admin/bookings/BookingCard.tsx`
- Modify: `src/components/admin/counseling/CounselingCard.tsx`

- [ ] **Step 1: Refactor Admin Cards**
  - Remove `card-interactive` from the outer wrapper of `ArticleCard`, `BookingCard`, and `CounselingCard`.
  - Maintain clean stable card styling with subtle hover border: `bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-paper-border)] shadow-xs`.

---

### Task 7: Comprehensive Verification & Test Suite Execution

**Files:**
- Run: Vitest unit test suite
- Run: Integration test & production build check

- [ ] **Step 1: Run Vitest**
  - Verify all test files pass (including new `animation-standardization.test.ts`).
- [ ] **Step 2: Run `pnpm build`**
  - Verify TypeScript compilation and production build succeed with zero errors.
