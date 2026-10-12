# Comprehensive Website Audit — Executive Summary
**Project:** Amelia Portfolio & Islamic Counseling Platform (`amelia-portofolio`)  
**Audit Date:** 2026-10-08  
**Audit Scope:** Full-Stack Codebase, Next.js 16 Architecture, Security & OWASP, Drizzle ORM Database, UI/UX Design System, Serwist PWA, Technical SEO, DevOps & CI/CD  
**Audit Lead:** Principal Software Architect & Technical Audit Director  
**Status:** Audit & Planning Complete — Awaiting Approval for Phase Execution  

---

## 1. Executive Status & Readability Assessment

The Amelia Counseling Portfolio (`amelia-portofolio`) is an ambitious, production-grade Next.js application built specifically for Amelia, S.Sos. (Islamic Guidance & Counseling / Bimbingan Konseling Islam - UIN Siber Syekh Nurjati Cirebon).

### System Health Snapshot

| Dimension | Rating | Current State Summary |
|---|---|---|
| **Compilation & Build** | **A+ (100%)** | Next.js 16.3.8 compiles 44 static and dynamic routes in 8.6s with zero errors. Zero TypeScript compiler errors (`tsc --noEmit`). |
| **Linting & Code Quality** | **A (100%)** | ESLint 9 + Next Core Web Vitals passed with 0 errors and 0 warnings. |
| **E2E Functional Tests** | **A (21/21)** | Full automated integration test suite covers 21/21 end-to-end scenarios (SSR, APIs, Admin session, CRUD). |
| **Responsive & Viewport Stability** | **A+ (Zero Overflow)** | Meticulously tested from 280px (Galaxy Z Fold cover screen), 320px, 390px, 768px, to 1920px. Zero horizontal scroll overflow. |
| **Visual Design & Human Craft** | **A** | Elegant warm cream palette (`#FBF9F5`), deep sage accent (`#1A563C`), disciplined typography (`Newsreader` serif + `Plus Jakarta Sans`). Strictly free of AI-slop cliches (no emoji feature icons, no default indigo, no sparkles). |
| **Security & Privacy Posture** | **B+ (Action Required)** | Solid HMAC cookie session auth and timing-safe PIN checks, but contains **one critical credential exposure** (`ik_...` hardcoded API key in `/api/upload`), **fallback admin secrets in env**, and **authorization gaps in `/api/articles` and `/api/notifications/subscribe`**. |
| **Technical SEO & Metadata** | **B+ (Minor Fix Needed)** | Rich JSON-LD schemas, dynamic OpenGraph image generation, clean sitemap; but suffers from a **double-brand title tag bug** (`... | Amelia | Amelia`) due to layout template concatenation. |
| **PWA & Offline Resilience** | **A-** | Serwist 9.5 service worker, offline fallback page, multi-tab sync; Web Push notifications server dispatch is currently a telemetry stub lacking VAPID delivery. |
| **Maintainability & Modularity** | **B** | Core components like `ArticleFormModal.tsx` (1,662 lines, 71 KB) and duplicate delete modals create technical debt. |

---

## 2. Top Critical & High-Priority Findings at a Glance

1. **[CRITICAL - SEC-01] Hardcoded InsForge Cloud Storage API Key in `/api/upload`**:
   `src/app/api/upload/route.ts#L80` contains a hardcoded fallback API key (`'ik_e3b61cf6ab3a67f8ad99071bfd628605'`). Must be excised immediately to prevent credential leakage.
2. **[HIGH - SEC-02] Hardcoded Fallback Admin PIN (`160523`) & Session Secret**:
   `src/lib/env.ts` and `src/lib/edge-admin-auth.ts` provide static default fallbacks. In production environments where env vars are misconfigured, unauthorized access or session forgery is possible.
3. **[HIGH - SEC-03] Information Disclosure of Unpublished Drafts via `GET /api/articles`**:
   `src/app/api/articles/route.ts` calls `getArticles()` without enforcing `onlyPublished = true` for unauthenticated callers, leaking unpublished drafts to the public.
4. **[HIGH - SEC-04] Push Notification Privilege Escalation & Missing Rate Limiting**:
   `src/app/api/notifications/subscribe/route.ts` allows any client to register with `role: 'admin'` without verifying admin credentials, and lacks rate limiting.
5. **[MEDIUM - SEO-01] Double Branding in HTML Title Tags**:
   `layout.tsx` specifies `template: '%s | Amelia'`, causing child pages specifying `'... | Amelia'` to render duplicate branding (`... | Amelia | Amelia`).
6. **[MEDIUM - DATA-01] Web Push Notification Dispatch is a Stub**:
   `src/lib/web-push-server.ts` logs telemetry but does not dispatch RFC 8291 Web Push payloads via VAPID keys.
7. **[MEDIUM - ARCH-01] Monolithic Architecture in `ArticleFormModal.tsx`**:
   At 1,662 lines (71 KB), this component houses multiple disparate concerns and requires modular decomposition.

---

## 3. Strategic Recommendations & Transformation Path

We recommend an **8-Phase Master Implementation Plan** executed systematically via **Specialized Sub-Agents** with strictly gated testing:

1. **Phase 1: Quick Wins & Security Lockdown (P0/P1)** — Eliminate hardcoded secrets, enforce strict authentication on `/api/articles` drafts, lock down `/api/notifications/subscribe` admin roles, fix double-brand title tags.
2. **Phase 2: Technical SEO & Metadata Standardization** — Harmonize title templates, resolve canonical URL drift in email templates, standardize robots matching.
3. **Phase 3: Component Architecture & Modularity Refactoring** — Decompose `ArticleFormModal.tsx` into 4 focused subcomponents; consolidate duplicate delete modals (`ArticleDeleteModal`, `BookingDeleteModal`, `CounselingDeleteModal`) into `ConfirmDecisionModal`.
4. **Phase 4: Next.js 16 Edge Proxy & Route Protection Expansion** — Broaden `src/proxy.ts` matcher to cover all `/api/*` endpoints; harden IP extraction against spoofing.
5. **Phase 5: Web Push (VAPID) & Realtime Synchronization** — Complete standard RFC 8291 Web Push delivery with VAPID key support.
6. **Phase 6: Supply Chain & Dependency Hygiene** — Resolve 5 sub-dependency vulnerabilities (`source-map-js`, `esbuild`) via clean pnpm overrides; introduce Vitest unit test suite.
7. **Phase 7: Semantic HTML & Accessibility Elevation** — Resolve PWA heading level order (`<h3>` before `<h1>`), verify keyboard accessibility across complex modals.
8. **Phase 8: Production Release Readiness & Quality Gates** — End-to-end verification, smoke testing, and zero-regression deployment sign-off.

---

## 4. Operational Boundaries

- **Audit & Planning ONLY**: No source code, database tables, or configurations have been altered during this audit.
- **Implementation Order**: Work will begin ONLY upon explicit user approval of this master plan.
