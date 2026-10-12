# Open Questions, Assumptions & Operational Limitations
**Project:** Amelia Portfolio & Islamic Counseling Platform (`amelia-portofolio`)  
**Lead Evaluator:** Technical Audit Director & Principal Software Architect  
**Scope:** Knowledge Gaps, Operational Boundaries, and Decisions Requiring Authorization  
**Date:** 2026-10-08  

---

## 1. Audit Coverage Gaps & Unverified Subsystems

While this audit achieved 100% code inspection coverage, full static analysis, and end-to-end local integration testing, certain production external services could not be evaluated live without active external credentials:

| Subsystem / Service | Verification Status | Unverified Aspect | Reason / Limitation |
|---|---|---|---|
| **Production InsForge Postgres Database** | `HIGH-CONFIDENCE` | Direct live latency, connection pooling metrics, storage quota | Production DB credentials require cloud VPC / direct connection; tested via local in-memory fallback store and Drizzle schema analysis. |
| **Resend Production Email Delivery** | `HIGH-CONFIDENCE` | Live SPF/DKIM/DMARC inbox deliverability on custom domain | Requires access to DNS records of the custom domain (`amelia.id` or similar) and live Resend sending domain verification. |
| **Web Push Notification Service (RFC 8291)** | `CONFIRMED GAP` | Push notification delivery to real iOS/Android devices | Currently a telemetry stub (`web-push-server.ts`); web push VAPID keys are unconfigured in environment. |
| **Vercel Analytics & Speed Insights** | `HIGH-CONFIDENCE` | Real-user Core Web Vitals (CrUX dataset) | Requires active production traffic and Vercel team dashboard access. |

---

## 2. Core Architectural & Business Assumptions

During this audit and the formulation of the Target Architecture, the following engineering assumptions were made:

1. **Single-Admin Model:** The platform is dedicated to Amelia as an independent Islamic counselor and educational professional. A single-tenant, single-admin operational model (with high-security admin PIN + session tokens) is sufficient. Multi-tenant RBAC or complex organization hierarchies are intentionally not recommended to prevent overengineering.
2. **In-Memory Fallback Parity:** The built-in in-memory fallback data store (`src/lib/data-store.ts`) is designed for resilient zero-downtime operation during database maintenance or localized PostgreSQL outages. It mirrors the relational Drizzle schemas closely.
3. **PWA Primacy:** The target audience (counseling clients, students, mobile readers) primarily accesses the platform via mobile devices (iOS Safari, Android Chrome). Therefore, mobile performance, offline PWA caching, and touch responsiveness take precedence over desktop-specific animations.
4. **Indonesian Language Context:** Islamic counseling terminology, form copy, and user notifications are primarily authored in Bahasa Indonesia, with English retained for system diagnostics and developer tooling.

---

## 3. Decisions & Actions Requiring Explicit User Authorization

Before initiating execution of the Master Implementation Plan (Phases 1 through 8), the following specific decisions must be reviewed and authorized by the project owner:

### 3.1 Authorization Item 1: Invalidation & Rotation of Leaked InsForge API Key
- **Finding Reference:** [SEC-01] (`src/app/api/upload/route.ts#L80`).
- **Context:** An API key literal was found embedded in source code as a fallback.
- **Decision Needed:** Confirm authorization to remove the hardcoded fallback from the codebase and rotate the corresponding API key in the InsForge project dashboard.

### 3.2 Authorization Item 2: Admin Authentication Hardening
- **Finding Reference:** [SEC-02] (`src/lib/env.ts`, `src/lib/edge-admin-auth.ts`).
- **Context:** Default development PIN `'160523'` and static secret fallback exist.
- **Decision Needed:** 
  - Option A (Recommended): Enforce strict environment variables (`ADMIN_PIN` and `ADMIN_JWT_SECRET`) without fallback in production, hashing the PIN via Argon2id with 5-attempt rate-limiting.
  - Option B: Introduce email-based Magic Link authentication via Resend for passwordless admin login.

### 3.3 Authorization Item 3: API Endpoint Consolidation (`api/counseling` vs `api/bookings`)
- **Finding Reference:** [CONS-01] (`src/app/api/counseling/route.ts` and `src/app/api/bookings/route.ts`).
- **Context:** Two endpoints handle counseling appointment creation with slight validation differences.
- **Decision Needed:** Authorize the deprecation and 301/308 redirect of `/api/counseling` into the unified `/api/bookings` endpoint.

### 3.4 Authorization Item 4: Web Push Notification Scope
- **Finding Reference:** [DATA-01] (`src/lib/web-push-server.ts`).
- **Context:** Web push subscription endpoint is live, but dispatch logic is a telemetry stub.
- **Decision Needed:**
  - Option A: Implement real VAPID Web Push RFC 8291 dispatch using `web-push` library with generated VAPID keys.
  - Option B: Temporarily disable web push subscription UI until push notification content strategy is defined.

### 3.5 Authorization Item 5: Custom Sending Domain for Transactional Email
- **Finding Reference:** [DEVOPS-02] (`src/lib/resend.ts`).
- **Context:** Booking confirmations currently use the default Resend onboarding sender if custom domain is unset.
- **Decision Needed:** Confirm the desired custom sender address (e.g., `halo@amelia.id` or `konseling@amelia.id`) and availability of DNS records for SPF/DKIM validation.

---

## 4. Operational Boundaries & Safety Constraints

During future implementation phases:
1. **Zero Downtime Guarantee:** The application must remain operable throughout all phase transitions. Changes to API contracts must remain backward-compatible with existing client bundles.
2. **Data Preservation:** User bookings, counseling records, and published articles must be preserved with 100% integrity.
3. **No Unsolicited Rewrites:** Existing aesthetic identity (colors `#2E7D32`, `#F4EFEA`, `#1B4D3E`, typography, and components) must be preserved; only structural refactoring, accessibility enhancements, and bug fixes are permitted.
