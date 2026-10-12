# Target Architecture & Technical Blueprint
**Project:** Amelia Portfolio & Islamic Counseling Platform (`amelia-portofolio`)  
**Lead Evaluator:** Principal Software Architect & Systems Engineering Lead  
**Date:** 2026-10-08  

---

## 1. Target Architecture Overview

The target architecture elevates the codebase from an incrementally developed application to a hardened, modular, production-grade platform.

```mermaid
flowchart LR
    subgraph ClientLayer [Client & Device Layer]
        Browser[Modern Browser / Mobile PWA]
        SW[Serwist 9.5 Worker]
    end

    subgraph EdgeLayer [Next.js 16 Edge Layer]
        Proxy[Universal Proxy (src/proxy.ts)]
        RateLimiter[Upstash Redis Sliding Window]
        EdgeAuth[Web Crypto HMAC Verifier]
    end

    subgraph AppLayer [Serverless Application Layer]
        RSC[React Server Components]
        API[Hardened Route Handlers]
        AuthService[Admin Auth Service]
        EmailService[Resend Modular Templating]
        PushService[RFC 8291 Web Push Dispatcher]
    end

    subgraph StorageLayer [Persistence & Cloud Storage]
        Drizzle[Drizzle ORM Connection Pooler]
        Postgres[(PostgreSQL Database)]
        InsForgeStorage[InsForge Object Storage]
    end

    Browser <--> SW
    Browser --> Proxy
    Proxy --> RateLimiter
    Proxy --> EdgeAuth
    Proxy --> RSC
    Proxy --> API

    API --> AuthService
    API --> EmailService
    API --> PushService
    API --> Drizzle
    API --> InsForgeStorage

    Drizzle --> Postgres
```

---

## 2. Layer-by-Layer Architectural Specifications

### 2.1 Edge & Security Architecture (`src/proxy.ts`)
- **Universal Matcher:** Intercepts `/admin/:path*` and `/api/:path*`.
- **Request Tracing:** Automatically stamps every incoming request with `X-Request-Id: ${crypto.randomUUID()}`.
- **Fail-Safe Authorization:** If any route under `/api/admin/*` is accessed without a valid HMAC session token, `proxy.ts` rejects immediately at the Edge (HTTP 401) without spinning up a serverless Node lambda.
- **Edge Rate Limiting:** Enforces sliding-window rate limits before expensive database or storage operations.

### 2.2 Component & Design System Architecture
- **Elimination of Duplication:**
  - Deprecate `ArticleDeleteModal`, `BookingDeleteModal`, and `CounselingDeleteModal`.
  - Standardize all destructive actions through `<ConfirmDecisionModal variant="danger">`.
- **Modular Article Editor Architecture:**
  - Decompose `ArticleFormModal.tsx` (1,662 lines) into:
    1. `src/components/admin/articles/form/ArticleFormModal.tsx` (Container & lifecycle, < 250 lines).
    2. `src/components/admin/articles/form/ArticleEditorToolbar.tsx` (Markdown toolbar formatting buttons).
    3. `src/components/admin/articles/form/ArticleCoverPicker.tsx` (Curated image selector & InsForge upload dropzone).
    4. `src/components/admin/articles/form/ArticleMetaFields.tsx` (Category, title, auto-slug, tag chips, publication switches).
    5. `src/components/admin/articles/form/ArticlePreviewTab.tsx` (Live split preview).

### 2.3 Data & Storage Architecture
- **Strict Decoupling of Reads and Writes:**
  - Remove read-time auto-seeding loops from `src/lib/data-store.ts`.
  - Database initialization is performed explicitly via `pnpm db:seed`.
- **Cloud Storage Security:**
  - Cloud uploads require `process.env.INSFORGE_API_KEY`.
  - In local environments without API key, fall back to local disk storage (`public/images/articles/`).
  - In production without API key, return a clean HTTP 503 rather than attempting unauthenticated requests.

### 2.4 Technical SEO & Discoverability Strategy
- Standardize all page metadata to inherit from `layout.tsx` `%s | Amelia` without hardcoded duplicate brand suffixes.
- Canonical URLs and email links strictly reference `env.SITE_URL`.

### 2.5 Realtime & Push Notification Pipeline
- Integrate standard RFC 8291 Web Push using the `web-push` NPM package with VAPID key pairs.
- Role protection enforced: only authenticated counselors can subscribe with `role: 'admin'`.

---

## 3. Backward Compatibility & Migration Invariants

1. **Zero Database Schema Regression:** Existing tables (`bookings`, `curhat`, `articles`, `push_subscriptions`), enums, and indexes remain 100% compatible.
2. **Zero Route Disruption:** All existing URLs and 301 redirects are strictly preserved.
3. **Zero UI Style Drift:** Visual tokens, fonts, responsive breakpoints, and color palettes remain completely identical.
