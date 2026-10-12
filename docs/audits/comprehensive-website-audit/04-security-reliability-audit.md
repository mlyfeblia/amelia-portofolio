# Security, Privacy & Reliability Audit
**Project:** Amelia Portfolio & Islamic Counseling Platform (`amelia-portofolio`)  
**Security Architect:** Lead Security & Privacy Auditor  
**Frameworks Evaluated:** OWASP Top 10:2021, OWASP ASVS v4.0, RFC 8291, Web Crypto API  
**Date:** 2026-10-08  

---

## 1. OWASP Top 10 Assessment Matrix

| OWASP Category | Status | Evaluation Summary | Key Findings |
|---|---|---|---|
| **A01: Broken Access Control** | **REQUIRES REMEDIATION** | Admin routes protected via Edge Proxy; however, `GET /api/articles` exposes draft articles publicly, and `POST /api/notifications/subscribe` allows unauthenticated clients to register with `role: 'admin'`. | **SEC-03**, **SEC-04**, **API-01** |
| **A02: Cryptographic Failures** | **REQUIRES REMEDIATION** | HMAC-SHA256 session signatures are strong and timing-safe, but fallback secrets in `env.ts` and `edge-admin-auth.ts` provide predictable static keys if env vars are unset. | **SEC-02** |
| **A03: Injection (SQL / NoSQL / Command)** | **SECURE** | Drizzle ORM uses parameterized queries (`eq`, `and`, `$param`) and prepared statement protection (`prepare: false`). Zero raw SQL concatenation found. | None |
| **A04: Insecure Design** | **ACCEPTABLE** | Counseling workflows implement defense-in-depth: client notes are confidential, phone/email are stripped from public tracking responses. | **DATA-01** |
| **A05: Security Misconfiguration** | **REQUIRES REMEDIATION** | Production security headers in `next.config.ts` are robust (CSP, HSTS, X-Frame-Options SAMEORIGIN, Nosniff), but a hardcoded InsForge API key exists in `/api/upload`. | **SEC-01** |
| **A06: Vulnerable & Outdated Components**| **REQUIRES REMEDIATION** | 5 sub-dependency vulnerabilities identified in `source-map-js` and `esbuild` via `pnpm audit`. | **DEVOPS-01** |
| **A07: Identification & Auth Failures** | **SECURE (with config fix)** | PIN authentication uses timing-safe buffers (`crypto.timingSafeEqual`) and strict 5-attempt / 15-min rate limiting. 30-minute auto-expiry is strictly enforced. | **SEC-02** |
| **A08: Software & Data Integrity Failures**| **SECURE** | CI workflow verifies lockfile integrity (`pnpm install --frozen-lockfile`) and executes type checking before build. | None |
| **A09: Security Logging & Monitoring** | **ACCEPTABLE** | Centralized telemetry module logs structured events to console and optionally to Axiom/Sentry. Sensitive fields are masked. | None |
| **A10: Server-Side Request Forgery (SSRF)**| **SECURE** | External requests are limited to hardcoded Google Cloud, MyMemory, Resend, and InsForge endpoints with strict URL construction. | None |

---

## 2. Deep Dive: Authentication & Session Management

### 2.1 Admin PIN & Timing-Safe Verification
In `src/lib/admin-auth.ts`:
```ts
export function verifyPin(inputPin: string): boolean {
  if (!inputPin) return false;
  const cleanInput = inputPin.trim();
  const cleanTarget = getAdminPin();
  if (cleanInput.length !== cleanTarget.length) return false;
  const inputBuffer = Buffer.from(cleanInput);
  const targetBuffer = Buffer.from(cleanTarget);
  return crypto.timingSafeEqual(inputBuffer, targetBuffer);
}
```
**Audit Finding:** Verification is properly timing-safe against side-channel timing attacks. Length mismatch returns immediately, which is acceptable given that PIN length (6 digits) is fixed.

### 2.2 Session Token Generation & Verification
Session tokens use a signed 4-part HMAC structure:
`admin:${timestamp}:${nonce}:${signature}`
- **Entropy:** Nonce uses `crypto.randomBytes(16).toString('hex')` (128-bit cryptographically secure randomness).
- **Expiration:** Hardcoded 30-minute max age (`ADMIN_SESSION_MAX_AGE_SECONDS = 1800`), verified on every request.
- **Edge Compatibility:** Implements Web Crypto API in `src/lib/edge-admin-auth.ts` (`crypto.subtle.importKey` + `crypto.subtle.verify`) for zero-latency execution in Next.js Edge runtime.
- **Cookie Security:** Cookie is set with `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, and `secure: process.env.NODE_ENV === 'production'`.

---

## 3. Client Confidentiality & Data Privacy

In Islamic counseling (*Bimbingan Konseling Islam*), counselor-client confidentiality (*Amanah Kerahasiaan*) is paramount.

### 3.1 Tracking API Confidentiality (`/api/bookings/track`)
- **Audit:** When a client tracks a booking code via `/api/bookings/track?code=...`:
  - `phone` and `email` are **strictly omitted** from the returned object.
  - The client receives only `code`, `name`, `alias`, `category`, `mode`, `date`, `timeSlot`, `notes`, and `status`.
  - Rate limiting is set to 40 req/min per IP.
  - Codes are structured as `BKI-YYMM-XXXXXX` (24-bit random hexadecimal suffix = 16.7 million combinations), making brute-force enumeration impossible within rate limits.

### 3.2 Curhat Anonim Privacy (`/api/curhat`)
- Public visitors cannot see real sender identity; only `alias` (or default "Hamba Allah") is stored and displayed.
- Unanswered messages remain private (`isAnswered: false`) and are hidden from the public wall.
- Counselor replies require explicit admin toggle (`isPublic: true`) to appear on the story wall.

---

## 4. Rate Limiting & Anti-Abuse Architecture

The rate limiter in `src/lib/rate-limiter.ts` operates in a dual mode:
1. **Distributed Mode:** Connects to Upstash Redis using `@upstash/ratelimit` (sliding window).
2. **In-Memory Mode:** Sliding window in-memory fallback with automated 5-minute cleanup of expired keys.

### Rate Limits by Endpoint

| Endpoint | Window | Limit | Protection Target |
|---|---|---|---|
| `/api/admin/login` | 15 min | 5 req | Brute force PIN guessing |
| `/api/bookings` | 10 min | 10 req | Appointment spam & resource exhaustion |
| `/api/curhat` | 10 min | 10 req | Story wall comment spam |
| `/api/articles/view` | 1 min | 30 req | View counter manipulation |
| `/api/bookings/track` | 1 min | 40 req | Booking code scanning |
| `/api/translate` | 1 min | 20 req | Translation API exhaustion |
| `/api/notifications/subscribe`| **None** | **None** | **Exposed (Finding SEC-04)** |

---

## 5. Security Recommendations & Hardening Steps

1. **Remove Hardcoded Secret Literal (SEC-01):** Excise `'ik_e3b61cf6ab3a67f8ad99071bfd628605'` from `upload/route.ts`.
2. **Harden Production Env Fail-Safe (SEC-02):** In `env.ts`, throw runtime error in production if `ADMIN_AUTH_SECRET` is unset or shorter than 32 characters.
3. **Patch Article Draft Disclosure (SEC-03):** Pass `onlyPublished = !isAuth` in `articles/route.ts`.
4. **Lock Down Push Subscription Roles (SEC-04):** Constrain role to `admin` only when verified via `isAuthenticatedAdmin`.
5. **Reorder IP Resolution (SEC-05):** In `rate-limiter.ts`, prioritize `x-real-ip` and `cf-connecting-ip` ahead of `x-forwarded-for`.
