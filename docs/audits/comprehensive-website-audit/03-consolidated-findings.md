# Consolidated Findings Register & Risk Matrix
**Project:** Amelia Portfolio & Islamic Counseling Platform (`amelia-portofolio`)  
**Audit Lead:** Technical Audit Director & Security Architect  
**Classification Standards:** OWASP ASVS v4.0, OWASP Top 10:2021, Core Web Vitals, WCAG 2.2 Level AA  
**Date:** 2026-10-08  

---

## 1. Findings Summary Matrix

| ID | Domain | Title | Classification | Severity | Priority | Status |
|---|---|---|---|---|---|---|
| **SEC-01** | Security / Storage | Hardcoded InsForge Cloud Storage API Key in `/api/upload` | **CONFIRMED** | **P0 (Critical)** | Urgent | Open |
| **SEC-02** | Security / Auth | Hardcoded Default Admin PIN & Session Secret Fallbacks | **CONFIRMED** | **P1 (High)** | High | Open |
| **SEC-03** | Security / API | Information Disclosure of Unpublished Drafts via `GET /api/articles` | **CONFIRMED** | **P1 (High)** | High | Open |
| **SEC-04** | Security / Access | Privilege Escalation to Admin Role & No Rate Limit on Push API | **CONFIRMED** | **P1 (High)** | High | Open |
| **SEC-05** | Security / Network | IP Spoofing Risk via First `X-Forwarded-For` Header in Rate Limiter | **HIGH-CONFIDENCE** | **P2 (Medium)** | Medium | Open |
| **API-01** | Backend / API | Public Unauthenticated Access to Slug Translation Proxy | **CONFIRMED** | **P2 (Medium)** | Medium | Open |
| **DATA-01** | Backend / Push | Incomplete Web Push Notification Dispatch (Stub Implementation) | **CONFIRMED** | **P2 (Medium)** | Medium | Open |
| **SEO-01** | Technical SEO | Double Brand Suffix in HTML Title Tags Across Multiple Routes | **CONFIRMED** | **P2 (Medium)** | High | Open |
| **SEO-02** | Technical SEO | Inconsistent Canonical Site URL Fallback in Resend Module | **CONFIRMED** | **P3 (Low)** | Low | Open |
| **UI-01** | UI / A11y | Semantic Heading Order Violation (H3 before H1 on Homepage) | **CONFIRMED** | **P2 (Medium)** | Medium | Open |
| **ARCH-01**| Frontend / Architecture | Monolithic Architecture in `ArticleFormModal.tsx` (1,662 Lines) | **CONFIRMED** | **P2 (Medium)** | Medium | Open |
| **ARCH-02**| Frontend / Components | Redundant Delete Confirmation Modals Boilerplate | **CONFIRMED** | **P3 (Low)** | Low | Open |
| **ARCH-03**| PWA / Architecture | Dual Manifest File Drift (`public/manifest.json` vs `manifest.ts`) | **CONFIRMED** | **P3 (Low)** | Low | Open |
| **DEVOPS-01**| Supply Chain | Vulnerabilities in Sub-Dependencies (source-map-js, esbuild) | **CONFIRMED** | **P2 (Medium)** | Medium | Open |
| **RESEND-01**| Integrations / Email | Resend Sandbox Domain (`onboarding@resend.dev`) Delivery Limit | **HIGH-CONFIDENCE** | **P2 (Medium)** | Medium | Open |
| **DB-01** | Database / Perf | In-Memory Fallback Auto-Seeding Overhead on Serverless Cold Starts | **CONFIRMED** | **P3 (Low)** | Low | Open |
| **TEST-01**| Quality Assurance | Lack of Modular Unit Testing Framework (Vitest / Component Tests) | **IMPROVEMENT** | **P2 (Medium)** | Medium | Open |
| **PROXY-01**| Edge Architecture | Narrow Matcher Scope in `src/proxy.ts` Omits Sensitive Endpoints | **CONFIRMED** | **P2 (Medium)** | Medium | Open |

---

## 2. Detailed Technical Finding Dossiers

### [SEC-01] Hardcoded InsForge Cloud Storage API Key
- **Domain:** Security / Cloud Storage Integration
- **Classification:** **CONFIRMED** (Verified directly in source code)
- **Severity & Priority:** **P0 (Critical)** / **Immediate Fix**
- **Location:** `src/app/api/upload/route.ts#L80`
- **Actual Behavior:**
  ```ts
  const apiKey = process.env.INSFORGE_API_KEY || 'ik_e3b61cf6ab3a67f8ad99071bfd628605';
  ```
  A live InsForge API key literal is hardcoded as a fallback.
- **Expected Behavior:** Secrets must never be stored in code. If `process.env.INSFORGE_API_KEY` is undefined, the server should log a configuration warning and fall back cleanly to local filesystem upload (in dev) or return a 503 Service Unavailable (in production serverless).
- **Root Cause:** Hardcoded credential left behind during initial cloud storage setup.
- **Impact:** Anyone with read access to the git repository can use the key to upload, delete, or inspect objects in the InsForge storage bucket, exhausting storage quotas.
- **Recommended Solution:** Remove the hardcoded string literal. Read strictly from `process.env.INSFORGE_API_KEY`.
- **Validation:** Scan codebase with regex `ik_[a-zA-Z0-9]+` ensuring 0 occurrences.

---

### [SEC-02] Hardcoded Default Admin PIN & Session Secret Fallbacks
- **Domain:** Authentication & Authorization
- **Classification:** **CONFIRMED**
- **Severity & Priority:** **P1 (High)** / **High Priority**
- **Location:** `src/lib/env.ts#L27,L35`, `src/lib/edge-admin-auth.ts#L21`
- **Actual Behavior:**
  ```ts
  get ADMIN_PIN(): string {
    return (process.env.ADMIN_PIN || '160523').trim();
  }
  get ADMIN_AUTH_SECRET(): string {
    return secret || 'amel-admin-counseling-secret-key-2026';
  }
  ```
- **Expected Behavior:** In production, weak default PINs and predictable HMAC keys must not be used silently. If `ADMIN_AUTH_SECRET` is unset in production, the app should fail fast or require explicit setup.
- **Root Cause:** Developer convenience during early testing.
- **Impact:** If environment variables fail to bind on deployment, an attacker can access the counselor portal using PIN `160523` or forge valid admin session cookies using the known HMAC secret.
- **Recommended Solution:** Enforce strict validation: in production, require `ADMIN_AUTH_SECRET` (minimum 32 chars) and warn if `ADMIN_PIN` is set to the default.
- **Validation:** Unit test verifying `env.ADMIN_AUTH_SECRET` behavior across environments.

---

### [SEC-03] Information Disclosure of Unpublished Drafts via `GET /api/articles`
- **Domain:** API Authorization & Data Privacy
- **Classification:** **CONFIRMED**
- **Severity & Priority:** **P1 (High)** / **High Priority**
- **Location:** `src/app/api/articles/route.ts#L7-L15` vs `src/lib/data-store.ts#L1352`
- **Actual Behavior:**
  ```ts
  export async function GET() {
    const articles = await getArticles(); // defaults to onlyPublished = false!
    return NextResponse.json({ success: true, data: articles });
  }
  ```
  `getArticles()` defaults to returning ALL articles, including drafts (`isPublished: false`). Unauthenticated public callers can view all unpublished drafts.
- **Expected Behavior:** Unauthenticated callers must only receive published articles. Draft articles must only be returned when the caller is an authenticated admin.
- **Root Cause:** Omission of authentication check in `GET /api/articles`.
- **Impact:** Leakage of confidential, unfinished counselor reflections and private articles to web scrapers or unauthorized users.
- **Recommended Solution:** Check admin authentication:
  ```ts
  const isAuth = await isAuthenticatedAdmin(request);
  const articles = await getArticles(!isAuth); // onlyPublished = true if not auth
  ```
- **Validation:** Automated test ensuring `GET /api/articles` does not include `isPublished: false` without a session cookie.

---

### [SEC-04] Privilege Escalation to Admin Role & No Rate Limit on Push API
- **Domain:** Authorization & Resource Protection
- **Classification:** **CONFIRMED**
- **Severity & Priority:** **P1 (High)** / **High Priority**
- **Location:** `src/app/api/notifications/subscribe/route.ts#L8-L73`
- **Actual Behavior:** Any caller can submit `{ role: 'admin' }` to `POST /api/notifications/subscribe`, and the server assigns `role: 'admin'` in the database without checking admin credentials. There is also no rate limiting.
- **Expected Behavior:** Only authenticated admins should be permitted to register subscriptions with `role: 'admin'`. Public requests must be constrained to `role: 'client'`. Endpoint should be rate-limited to 10 req/min per IP.
- **Root Cause:** Unvalidated trust in client-supplied role parameter.
- **Impact:** An attacker can register their device as an admin subscriber to receive push notifications containing private client booking alerts or curhat submissions.
- **Recommended Solution:** Check `const isAuth = await isAuthenticatedAdmin(request); const assignedRole = (role === 'admin' && isAuth) ? 'admin' : 'client';` and attach `checkDistributedRateLimit`.
- **Validation:** Test that sending `role: 'admin'` without auth cookie stores `role: 'client'`.

---

### [SEC-05] IP Spoofing Risk via First `X-Forwarded-For` Header in Rate Limiter
- **Domain:** Security / Network Layer
- **Classification:** **HIGH-CONFIDENCE**
- **Severity & Priority:** **P2 (Medium)** / **Medium Priority**
- **Location:** `src/lib/rate-limiter.ts#L151-L157`
- **Actual Behavior:** `getClientIp()` inspects `forwarded.split(',')[0].trim()`. If an attacker supplies a custom `X-Forwarded-For: 1.2.3.4`, taking the first item may take the forged IP rather than the true remote address.
- **Expected Behavior:** Check trusted proxy headers (`x-real-ip`, `cf-connecting-ip`, or `x-vercel-ip`) before trusting the first item of `x-forwarded-for`.
- **Root Cause:** Standard naive IP extraction pattern.
- **Impact:** Potential bypass of rate limiting on sensitive endpoints by rotating forged IP headers.
- **Recommended Solution:** Reorder header priority to prioritize `x-real-ip` and platform-specific headers.

---

### [API-01] Public Unauthenticated Access to Slug Translation Proxy
- **Domain:** Backend API
- **Classification:** **CONFIRMED**
- **Severity & Priority:** **P2 (Medium)** / **Medium Priority**
- **Location:** `src/app/api/translate/route.ts`
- **Actual Behavior:** Any public client can send text to `/api/translate` to trigger Google Translate or MyMemory API calls.
- **Expected Behavior:** Translation is an internal admin CMS utility. Require `isAuthenticatedAdmin(req)`.
- **Root Cause:** Route handler implemented without authentication middleware.
- **Impact:** Abuse of translation quota and third-party rate limits.
- **Recommended Solution:** Add admin authentication check at top of handler.

---

### [DATA-01] Incomplete Web Push Notification Dispatch (Stub Implementation)
- **Domain:** Backend / Web Push
- **Classification:** **CONFIRMED**
- **Severity & Priority:** **P2 (Medium)** / **Medium Priority**
- **Location:** `src/lib/web-push-server.ts#L35-L44`
- **Actual Behavior:** Function queries `pushSubscriptions`, logs a message, and returns the count without calling `webpush.sendNotification()`.
- **Expected Behavior:** Real Web Push dispatch using `web-push` NPM package and VAPID keys.
- **Root Cause:** Incomplete feature stub.
- **Impact:** Subscribed users do not receive notifications on booking status changes.
- **Recommended Solution:** Integrate `web-push` with VAPID configuration in Phase 5.

---

### [SEO-01] Double Brand Suffix in HTML Title Tags Across Multiple Routes
- **Domain:** Technical SEO
- **Classification:** **CONFIRMED**
- **Severity & Priority:** **P2 (Medium)** / **High Priority**
- **Location:** `src/app/layout.tsx#L41`, `src/app/articles/page.tsx#L15`, `src/app/articles/[slug]/page.tsx#L65`, `src/app/counseling/page.tsx#L23`, `src/app/assessment/page.tsx#L19`, `src/app/schedule/page.tsx#L20`, `src/app/services/page.tsx#L23`
- **Actual Behavior:** Rendered `<title>` tags contain duplicate brand suffix:
  `Cara Menemukan Ketenangan Batin... | Amelia | Amelia`
- **Expected Behavior:** Title should render cleanly as:
  `Cara Menemukan Ketenangan Batin... | Amelia`
- **Root Cause:** Next.js root layout template `%s | Amelia` concatenates with child page titles that already contain `| Amelia`.
- **Impact:** Lower click-through rates from search engines, messy presentation in browser tabs.
- **Recommended Solution:** Remove explicit `| Amelia` from child page title strings or use `title: { absolute: '...' }`.
- **Validation:** Inspect rendered HTML `<title>` tags across all 7 routes ensuring zero duplicate brand suffixes.

---

### [SEO-02] Inconsistent Canonical Site URL Fallback in Resend Module
- **Domain:** Technical SEO & Email Deliverability
- **Classification:** **CONFIRMED**
- **Severity & Priority:** **P3 (Low)** / **Low Priority**
- **Location:** `src/lib/resend.ts#L43,L90` vs `src/lib/env.ts#L48`
- **Actual Behavior:** `resend.ts` uses fallback `'https://amelia.portofolio.id'`, while `env.ts` uses `'https://mlyfeblia.vercel.app'`.
- **Expected Behavior:** All links must use centralized `env.SITE_URL`.
- **Root Cause:** Hardcoded string drift.
- **Impact:** Dead links in notification emails if `NEXT_PUBLIC_SITE_URL` is omitted.
- **Recommended Solution:** Use `env.SITE_URL`.

---

### [UI-01] Semantic Heading Order Violation (H3 before H1 on Homepage)
- **Domain:** UI / Accessibility (WCAG 2.2 AA)
- **Classification:** **CONFIRMED**
- **Severity & Priority:** **P2 (Medium)** / **Medium Priority**
- **Location:** `src/components/pwa/PwaLifecycle.tsx#L352`
- **Actual Behavior:** An `<h3>` ("Pasang Aplikasi Amelia") in the PWA lifecycle prompt precedes the `<h1>` in `HeroSection.tsx`.
- **Expected Behavior:** In accessible DOM hierarchies, `<h1>` must be the highest and earliest major heading. Modals/banners should use `<h2>` or descriptive text with `aria-labelledby`.
- **Root Cause:** Banner rendered in root tree using fixed `<h3>`.
- **Impact:** Screen reader navigation confusion and accessibility audit score deductions.
- **Recommended Solution:** Refactor PWA prompt heading to `<p className="font-semibold text-sm">` or `<h2>`.

---

### [ARCH-01] Monolithic Architecture in `ArticleFormModal.tsx`
- **Domain:** Frontend Engineering / Maintainability
- **Classification:** **CONFIRMED**
- **Severity & Priority:** **P2 (Medium)** / **Medium Priority**
- **Location:** `src/components/admin/articles/ArticleFormModal.tsx` (1,662 lines, 71 KB)
- **Actual Behavior:** Single file contains full form state, markdown editor, toolbar, file dropzone, image picker, category selector, slug generator, and draft management.
- **Expected Behavior:** Clean modular separation into subcomponents.
- **Root Cause:** Organic feature accretion.
- **Impact:** High maintenance friction, slow IDE responsiveness, high risk of regression during feature edits.
- **Recommended Solution:** Decompose into `ArticleEditorToolbar`, `ArticleCoverPicker`, `ArticleMetaFields`, and `ArticlePreviewTab`.

---

### [ARCH-02] Redundant Delete Confirmation Modals Boilerplate
- **Domain:** Frontend / Design System
- **Classification:** **CONFIRMED**
- **Severity & Priority:** **P3 (Low)** / **Low Priority**
- **Location:** `ArticleDeleteModal.tsx`, `BookingDeleteModal.tsx`, `CounselingDeleteModal.tsx`
- **Actual Behavior:** ~500 lines of duplicated modal portal boilerplate across 3 separate files.
- **Expected Behavior:** Standardize on `ConfirmDecisionModal.tsx` (`variant="danger"`).
- **Root Cause:** Legacy components created before `ConfirmDecisionModal` was standardized.
- **Impact:** Unnecessary bundle weight and maintenance overhead.
- **Recommended Solution:** Refactor callers to invoke `ConfirmDecisionModal` directly.

---

### [ARCH-03] Dual Manifest File Drift
- **Domain:** PWA Architecture
- **Classification:** **CONFIRMED**
- **Severity & Priority:** **P3 (Low)** / **Low Priority**
- **Location:** `public/manifest.json` vs `src/app/manifest.ts`
- **Actual Behavior:** Two manifest definitions exist; `src/app/manifest.ts` contains newer properties (`display_override`) while `public/manifest.json` is static.
- **Expected Behavior:** Single source of truth via `src/app/manifest.ts`.
- **Root Cause:** Incomplete cleanup after migrating to App Router `manifest.ts`.
- **Impact:** Crawler/browser ambiguity.
- **Recommended Solution:** Set up rewrite in `next.config.ts` from `/manifest.json` to `/manifest.webmanifest` and remove or synchronize static file.

---

### [DEVOPS-01] Supply Chain Vulnerabilities in Sub-Dependencies
- **Domain:** DevOps & Supply Chain
- **Classification:** **CONFIRMED**
- **Severity & Priority:** **P2 (Medium)** / **Medium Priority**
- **Location:** `pnpm audit` (4 High, 1 Moderate)
- **Actual Behavior:** `source-map-js` (<1.2.2) and `esbuild` (<=0.24.2) flagged by GitHub Security Advisories (GHSA-68fv-2mgg-jv7q, GHSA-67mh-4wv8-2f99).
- **Expected Behavior:** Zero known vulnerabilities in production build dependencies.
- **Root Cause:** Transitive dependencies pulled by `postcss` and `drizzle-kit`.
- **Impact:** Potential event-loop DoS during build processing.
- **Recommended Solution:** Add pnpm overrides for `source-map-js` (`>=1.2.2`) in `package.json`.

---

### [RESEND-01] Resend Sandbox Domain Delivery Limitation
- **Domain:** Third-Party Integrations
- **Classification:** **HIGH-CONFIDENCE**
- **Severity & Priority:** **P2 (Medium)** / **Medium Priority**
- **Location:** `src/lib/resend.ts#L12`
- **Actual Behavior:** Default `fromEmail` is `'Amelia BKI <onboarding@resend.dev>'`. Resend blocks dispatch to unverified external emails when using `onboarding@resend.dev`.
- **Expected Behavior:** Production deployments must use a verified custom domain.
- **Root Cause:** Development default used as production fallback.
- **Impact:** Client booking confirmation emails will fail to deliver in production unless `RESEND_FROM_EMAIL` is set with a verified domain.
- **Recommended Solution:** Add runtime configuration check and admin guidance in documentation.

---

### [DB-01] In-Memory Fallback Auto-Seeding Overhead on Cold Starts
- **Domain:** Database Architecture
- **Classification:** **CONFIRMED**
- **Severity & Priority:** **P3 (Low)** / **Low Priority**
- **Location:** `src/lib/data-store.ts#L808-L840, L1120-L1155, L1365-L1395`
- **Actual Behavior:** On every read query where table row count is 0, the server tries to insert sample records via loop.
- **Expected Behavior:** Seeding should be an explicit deployment step (`pnpm db:seed`), not a side effect of read queries.
- **Root Cause:** Defensive scaffolding.
- **Impact:** Unnecessary write operations and cold-start latency.
- **Recommended Solution:** Remove implicit auto-seeding loops from `data-store.ts`.

---

### [TEST-01] Lack of Modular Unit Testing Framework
- **Domain:** Quality Assurance & Developer Experience
- **Classification:** **IMPROVEMENT OPPORTUNITY**
- **Severity & Priority:** **P2 (Medium)** / **Medium Priority**
- **Location:** `package.json`
- **Actual Behavior:** Only ad-hoc scripts exist (`scripts/test-slug-generator.ts`, `scripts/e2e-api-integration.mjs`). No Vitest runner installed.
- **Expected Behavior:** Automated unit testing for validators, text formatters, and utility functions.
- **Root Cause:** Incremental test script development.
- **Impact:** Higher regression risk when editing business logic.
- **Recommended Solution:** Install Vitest and add unit tests for validators, auth, and formatters in Phase 6.

---

### [PROXY-01] Narrow Matcher Scope in `src/proxy.ts`
- **Domain:** Edge Architecture & Security
- **Classification:** **CONFIRMED**
- **Severity & Priority:** **P2 (Medium)** / **Medium Priority**
- **Location:** `src/proxy.ts#L114-L121`
- **Actual Behavior:** Matcher only includes `/admin/:path*`, `/api/admin/:path*`, `/api/bookings`, and `/api/curhat`. It ignores `/api/articles`, `/api/upload`, `/api/translate`, etc.
- **Expected Behavior:** Matcher should cover all `/api/:path*` to guarantee universal `X-Request-Id` tracing and baseline rate limiting.
- **Root Cause:** Initial targeted proxy matcher configuration.
- **Impact:** Inconsistent request tracing and missing edge rate limits on newly added endpoints.
- **Recommended Solution:** Broaden matcher to `/api/:path*`.
