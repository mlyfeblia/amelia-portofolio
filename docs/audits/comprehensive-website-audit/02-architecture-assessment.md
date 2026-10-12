# Architectural Assessment: As-Is vs. Target Architecture
**Project:** Amelia Portfolio & Islamic Counseling Platform (`amelia-portofolio`)  
**Lead Evaluator:** Principal Software Architect  
**Evaluation Date:** 2026-10-08  

---

## 1. As-Is Architecture Analysis

The application follows a modern hybrid Next.js 16 App Router architecture combining React Server Components (RSC) for content rendering and Client Components for interactive workflows.

```mermaid
flowchart TD
    User([User / Counselor Browser]) --> EdgeProxy[Next.js 16 Edge Proxy (src/proxy.ts)]
    EdgeProxy -->|Public Pages| RSC[React Server Components (/articles, /about, /services)]
    EdgeProxy -->|Protected UI| AdminPages[Admin UI (/admin/*)]
    EdgeProxy -->|API Requests| RouteHandlers[Next.js Route Handlers (/api/*)]
    
    RSC --> DataStore[Data Store Layer (src/lib/data-store.ts)]
    RouteHandlers --> RateLimiter[Rate Limiter (Upstash / Memory Map)]
    RouteHandlers --> DataStore
    RouteHandlers --> Resend[Resend Email API]
    RouteHandlers --> InsForge[InsForge Cloud Storage]
    
    DataStore -->|Configured| DrizzleORM[Drizzle ORM + postgres-js]
    DataStore -->|Unconfigured / Offline| InMemoryStore[In-Memory Fallback Arrays]
    DrizzleORM --> Postgres[(PostgreSQL Database)]
```

### Key Architectural Strengths

1. **Next.js 16 Standards Compliance**: Uses Next.js 16's official `proxy.ts` convention for Edge interception, async `cookies()` access, and Promise-based `params` / `searchParams`.
2. **Resilient Data Store Layer**: The application features a dual-mode data store (`src/lib/data-store.ts`) that smoothly falls back to rich in-memory sample data if the PostgreSQL connection is unreachable or during isolated static builds.
3. **Serverless Connection Pool Tuning**: Connection management in `src/db/index.ts` automatically detects `process.env.VERCEL`, disables prepared statements (`prepare: false` for PgBouncer/Supabase/Neon compatibility), and caps pool sizes to 1 connection per lambda to avoid exhausting serverless pool limits.
4. **PWA Integration with Serwist**: Utilizes Serwist 9.5 for advanced service worker caching, network-first article reading, cache-first static assets, and an offline fallback page (`/~offline`).
5. **Human Craft UI Philosophy**: Zero AI design clichés; tailored typography with `Newsreader` (roman only, italic headings strictly eliminated) and `Plus Jakarta Sans`, warm paper colors, and responsive down to 280px.

---

## 2. Architectural Weaknesses & Vulnerabilities

### Weakness 1: Fragmented Authorization Enforcement
- **Current State:** Authorization is enforced in two disconnected places:
  1. At the Edge via `src/proxy.ts` (using `isValidAdminSessionTokenEdge` with Web Crypto API).
  2. Inside individual Route Handlers (using `isAuthenticatedAdmin` with Node.js `crypto`).
- **Risk:** The matcher in `src/proxy.ts` only matches 4 specific path patterns. Endpoints like `/api/articles` (POST/PATCH/DELETE), `/api/upload`, and `/api/notifications/subscribe` rely entirely on route-level checks. If a developer creates a new route and forgets the manual check, it becomes exposed without Edge-level protection.
- **Architectural Remedy:** Implement a unified defense-in-depth model where `proxy.ts` automatically guards all `/api/admin/*` and sensitive write operations, while route handlers perform context-aware domain validation.

### Weakness 2: Overgrown Monolithic Components
- **Current State:** `ArticleFormModal.tsx` contains 1,662 lines of mixed state, UI controls, Markdown parsing, image upload handling, and modal triggers.
- **Risk:** High regression risk when adding features (e.g. enhanced tags or image compression), slow IDE language server responsiveness, and untestable business logic.
- **Architectural Remedy:** Split `ArticleFormModal` into 4 cohesive subcomponents coordinated by a custom hook (`useArticleForm`).

### Weakness 3: Redundant Component Primitives
- **Current State:** Three specialized delete modals (`ArticleDeleteModal`, `BookingDeleteModal`, `CounselingDeleteModal`) duplicate ~160 lines of portal boilerplate each, despite the existence of `ConfirmDecisionModal.tsx`.
- **Risk:** Inconsistent modal behavior, redundant code maintenance.
- **Architectural Remedy:** Deprecate redundant modals and standardize all destructive decision confirmations through `ConfirmDecisionModal(variant="danger")`.

### Weakness 4: Web Push Notification Dispatch Gap
- **Current State:** The client prompts for Web Push (`NotificationPromptModal`, `PwaLifecycle`) and saves endpoints to the database, but `src/lib/web-push-server.ts` is a mock that only logs telemetry rather than dispatching standard RFC 8291 Web Push payloads.
- **Risk:** False user expectation that notifications will arrive when booking status changes.
- **Architectural Remedy:** Complete the VAPID push dispatch pipeline using the standard `web-push` library.

---

## 3. Target (To-Be) Architecture Blueprint

```mermaid
flowchart TD
    subgraph Client [Client Runtime (Browser / PWA)]
        UI[UI Components & Modals]
        SW[Serwist Service Worker (sw.js)]
        LocalCache[(Local State / IndexedDB)]
    end

    subgraph Edge [Next.js 16 Edge Layer]
        Proxy[Harden Edge Proxy (src/proxy.ts)]
        EdgeAuth[Edge Token Verifier (Web Crypto)]
        EdgeLimiter[Distributed Rate Limiter (Upstash)]
    end

    subgraph Server [Serverless Application Layer]
        RSC_Eng[React Server Components Engine]
        API_Routes[Sanitized & Authorized Route Handlers]
        ValidatorLayer[Strict Validator & Sanitizer Layer]
        AuthService[Admin Auth & Session Service]
        PushService[RFC 8291 Web Push (VAPID)]
        EmailService[Resend Modular Templating]
    end

    subgraph Data [Data & Infrastructure Layer]
        DrizzleClient[Drizzle ORM Connection Pooler]
        PostgresDB[(PostgreSQL / InsForge)]
        InsForgeStorage[InsForge Object Storage]
    end

    UI <--> SW
    UI --> Proxy
    Proxy --> EdgeAuth
    Proxy --> EdgeLimiter
    Proxy --> RSC_Eng
    Proxy --> API_Routes
    
    API_Routes --> ValidatorLayer
    ValidatorLayer --> AuthService
    ValidatorLayer --> PushService
    ValidatorLayer --> EmailService
    ValidatorLayer --> DrizzleClient
    
    DrizzleClient --> PostgresDB
    API_Routes --> InsForgeStorage
```

### Core Architectural Decisions (ADRs)

| Decision ID | Context | Decision | Consequence |
|---|---|---|---|
| **ADR-01** | Secret Management | Require `ADMIN_AUTH_SECRET` and `INSFORGE_API_KEY` via environment variables; fail-safe without hardcoded fallbacks. | Zero secret exposure; local dev uses filesystem fallback if cloud key is unset. |
| **ADR-02** | Proxy Matcher Expansion | Extend `src/proxy.ts` matcher to `/api/:path*`. | Global request tracing (`X-Request-Id`) and edge protection on all API endpoints. |
| **ADR-03** | Modal Consolidation | Use `ConfirmDecisionModal` for all confirm/delete actions. | Eliminates ~500 lines of duplicate code; guarantees 100% consistent dialog UX. |
| **ADR-04** | Title Template Strategy | Keep `layout.tsx` `%s | Amelia`; strip duplicate `| Amelia` from child page metadata. | Eliminates double-branding in search snippets and browser tabs. |
| **ADR-05** | Form Modularization | Refactor `ArticleFormModal.tsx` into 4 subcomponents under `src/components/admin/articles/form/`. | Improves testability and maintainability while preserving exact existing UI behavior. |
