# Frontend, Backend & Database Technical Audit
**Project:** Amelia Portfolio & Islamic Counseling Platform (`amelia-portofolio`)  
**Staff Full-Stack Engineer & Database Architect**  
**Audit Date:** 2026-10-08  

---

## 1. Frontend Engineering Audit

### 1.1 Rendering Strategy & Hydration Health
- **React Server Components (RSC):**
  - Content-heavy pages (`/`, `/about`, `/services`, `/articles`, `/articles/[slug]`) are built as Server Components.
  - Data fetching for published articles and pinned curhat messages happens on the server via `getArticles(true)` and `getCurhatList(true)`.
  - Revalidation is configured uniformly with `export const revalidate = 60;` (ISR - Incremental Static Regeneration).
  - Next.js 16 build verifies 44 routes compiled successfully with clean hydration markers (`suppressHydrationWarning` applied responsibly on `<html>` for browser extensions).

### 1.2 State Management Boundaries
- **Server State vs. Client State:**
  - Public data (articles, counselor bio, services catalog) is managed as pure server state.
  - Client state is localized to interactive boundaries:
    - `CurhatForm.tsx`: Form state + autosave to `sessionStorage`.
    - `BookingSection.tsx`: 3-step booking wizard state + `localStorage` recent tracking records.
    - `AssessmentSection.tsx`: Quiz answers + historical scores stored in `localStorage`.
    - `AdminAuthContext.tsx`: Authenticated session countdown ticker.
  - No bloated global client state library (Redux, Zustand) is needed; React Context (`AdminAuthContext`, `ToastContext`) handles cross-cutting concerns with minimal footprint.

### 1.3 Form Handling, Validation & Text Formatting
- Text inputs employ automated PUEBI/EYD capitalization:
  - `formatPersonName` cleans and capitalizes names automatically on alias inputs.
  - `formatSentenceCase` capitalizes starting sentences and clauses after punctuation (`. `, `? `, `\n`) on `onBlur` for curhat messages, session notes, and article excerpts.
  - WhatsApp phone numbers are formatted cleanly with placeholder `0812-3456-7890`.

### 1.4 Code Splitting & Dynamic Imports
- Heavy admin modals (`AdminSessionModal`, `ArticleDraftsModal`) are imported dynamically with `{ ssr: false }`, preventing bundle bloat on public routes.

---

## 2. Backend & API Architecture Audit

### 2.1 Route Handler Architecture
All endpoints under `src/app/api` follow Next.js 16 App Router standards:
- Explicit HTTP verbs (`GET`, `POST`, `PATCH`, `DELETE`).
- Promise-based dynamic route params: `context: { params: Promise<{ id: string }> }`.
- Proper JSON serialization using `NextResponse.json()`.
- Standardized error envelopes with HTTP status codes (200, 201, 400, 401, 404, 429, 500, 503).

### 2.2 Server-Side Input Validation (`src/lib/validators.ts`)
Input sanitization is centralized and robust:
- Strips HTML tags (`<[^>]*>`) and ASCII control characters to prevent stored XSS.
- Validates email formats using standard RFC 5322 regex.
- Enforces Indonesian mobile phone regex (`/^(\+62|62|0)8[1-9][0-9]{6,11}$/`).
- Enforces strict date formats (`YYYY-MM-DD`) and prevents booking appointments in the past or beyond 60 days.
- Honeypot bot trap fields (`botTrap`, `website`) discard automated spam without erroring.

### 2.3 Resend Transactional Email Engine
- Templating is modular (`src/lib/email-templates/`):
  - `booking-confirmation-template.ts` (modern Islamic cream/sage branding, basmalah, prayer quote).
  - `booking-admin-alert-template.ts` (urgent booking notice for Amelia).
  - `booking-status-updated-template.ts` (dynamic status updates: confirmed, finished, cancelled).
  - `curhat-admin-alert-template.ts` (incoming story alert).
- Email dispatches are **non-blocking**: wrapped in `.catch()` handlers so third-party email failures never break user-facing HTTP responses.

---

## 3. Database Architecture & Drizzle ORM Audit

### 3.1 Schema & Type Definitions (`src/db/schema.ts`)
The database schema utilizes native PostgreSQL enums and indexed columns:

1. **Enums:**
   - `booking_status`: `'menunggu' | 'terkonfirmasi' | 'selesai' | 'dibatalkan'`
   - `counseling_mode`: `'online_meet' | 'online_chat' | 'tatap_muka_cirebon'`
2. **Timestamps:**
   - All datetime columns (`created_at`, `published_at`, `answered_at`) use `timestamp('...', { withTimezone: true, mode: 'string' }).defaultNow()`.
3. **Indexes:**
   - `articles_cat_pub_date_idx` (btree on `category, is_published, published_at`) supports high-speed filtered queries for the article directory.
   - `bookings_status_date_idx` (btree on `status, date`) accelerates admin schedule calendar views.
   - `curhat_public_created_idx` (btree on `is_public, created_at`) optimizes public story wall pagination.
   - `push_sub_endpoint_idx` and `push_sub_code_idx` optimize Web Push subscriber lookups.

### 3.2 Concurrency & Atomic Operations
- Article view counts use atomic SQL increments:
  ```ts
  await db.update(articles)
    .set({ views: sql`${articles.views} + 1` })
    .where(eq(articles.slug, slug));
  ```
  This eliminates read-modify-write race conditions under high concurrent readership.

### 3.3 Connection Pool Management (`src/db/index.ts`)
- Configured specifically for serverless deployments on Vercel:
  ```ts
  const isServerless = !!process.env.VERCEL;
  const maxConnections = process.env.DB_MAX_CONNECTIONS
    ? parseInt(process.env.DB_MAX_CONNECTIONS, 10)
    : (isServerless ? 1 : 10);
  ```
  `prepare: false` is enabled to support external transaction connection poolers (PgBouncer / Supabase port 6543 / Neon pooled).

---

## 4. Key Recommendations

1. **Eliminate Read-Time Auto-Seeding (DB-01):** Remove implicit `insert(fallbackArticles)` loops inside `getBookings` and `getArticles`. Seeding should be managed solely via `pnpm db:seed`.
2. **Modularize Article Form (ARCH-01):** Break down `ArticleFormModal.tsx` into modular subcomponents to isolate form logic from image upload and Markdown rendering.
3. **Consolidate Modals (ARCH-02):** Replace `BookingDeleteModal`, `CounselingDeleteModal`, and `ArticleDeleteModal` with `ConfirmDecisionModal`.
