# DevOps, CI/CD, Infrastructure & Automation Audit
**Project:** Amelia Portfolio & Islamic Counseling Platform (`amelia-portofolio`)  
**DevOps & SRE Engineer / Quality Engineering Lead**  
**Infrastructure Platforms:** Vercel (Edge & Serverless), GitHub Actions, InsForge BaaS, Resend, Upstash  
**Date:** 2026-10-08  

---

## 1. CI/CD & GitHub Actions Workflow

The continuous integration pipeline is defined in `.github/workflows/ci.yml`.

### 1.1 Pipeline Architecture
- **Triggers:** Push to `main`, Pull Requests targeting `main`.
- **Concurrency:** `cancel-in-progress: true` prevents wasted runner minutes on superseded commits.
- **Node & Package Setup:** Uses `actions/setup-node@v4` with Node 20 and `pnpm/action-setup@v4` for `pnpm@12.4.2`.
- **Quality Gates Executed:**
  1. `pnpm install --frozen-lockfile` (Ensures reproducible dependencies from `pnpm-lock.yaml`).
  2. `pnpm exec tsc --noEmit` (Guarantees zero TypeScript compiler errors).
  3. `pnpm lint` (ESLint 9 + Next.js Core Web Vitals).
  4. `pnpm test:slug` (16 automated unit test cases for the slug generation suite).
  5. `pnpm build` (Full Next.js production build compiling 44 routes).

### 1.2 Identified CI/CD Improvement Opportunities
- **Missing Automated Pre-Commit Hook:** Developers can commit code that fails lint or type checks locally before pushing. Adding Husky with `lint-staged` would catch issues at commit time.
- **E2E Test Execution in CI:** The excellent integration test script (`scripts/e2e-api-integration.mjs`) is run manually but not automated inside GitHub Actions (requires launching `next start` on runner). Adding an ephemeral test job in CI would verify runtime route execution on every PR.

---

## 2. Vercel & Infrastructure Configuration

### 2.1 HTTP Security Headers (`next.config.ts`)
The production headers configuration is exemplary:
- `Content-Security-Policy`: Restricts scripts, workers, frames, and objects (`object-src 'none'`).
- `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload` (2 years HSTS).
- `X-Content-Type-Options`: `nosniff`.
- `X-Frame-Options`: `SAMEORIGIN`.
- `Referrer-Policy`: `strict-origin-when-cross-origin`.
- `Permissions-Policy`: Blocks camera, microphone, geolocation, and payment APIs.
- `Cross-Origin-Opener-Policy`: `same-origin-allow-popups`.
- `Cross-Origin-Resource-Policy`: `same-origin`.

### 2.2 Legacy URL Redirects (`next.config.ts`)
Clean permanent 301 redirects preserve SEO link equity from Indonesian paths to canonical English paths:
- `/tentang` $\to$ `/about`
- `/layanan` $\to$ `/services`
- `/asesmen` $\to$ `/assessment`
- `/curhat` $\to$ `/counseling`
- `/jadwal` $\to$ `/schedule`
- `/artikel` $\to$ `/articles`
- `/artikel/:slug` $\to$ `/articles/:slug`

---

## 3. Dependency & Supply Chain Security

### 3.1 Audit Findings (`pnpm audit`)
Running `pnpm audit` revealed 5 vulnerabilities:
1. `source-map-js` (High, GHSA-68fv-2mgg-jv7q): Indexed source-map offset DoS vulnerability.
2. `esbuild` (Moderate, GHSA-67mh-4wv8-2f99): Request reflection on dev server.

### 3.2 Mitigation Strategy
Add pnpm overrides to `package.json` to force safe versions without breaking Next.js 16 or Tailwind 4:
```json
{
  "pnpm": {
    "overrides": {
      "source-map-js": ">=1.2.2",
      "esbuild": ">=0.25.0"
    }
  }
}
```

---

## 4. InsForge Integration Hygiene

In `src/app/api/upload/route.ts`:
- Cloud Storage: Uses `@insforge/sdk` to upload optimized article cover images to the `'articles'` bucket.
- **Action Required:** Remove hardcoded API key literal (Finding **SEC-01**). Rely strictly on `process.env.INSFORGE_API_KEY`.
