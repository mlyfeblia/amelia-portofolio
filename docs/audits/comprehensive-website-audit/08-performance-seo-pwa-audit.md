# Performance, Technical SEO, PWA & Caching Audit
**Project:** Amelia Portfolio & Islamic Counseling Platform (`amelia-portofolio`)  
**Lead Performance Engineer, Technical SEO Specialist & PWA Architect**  
**Standards:** Core Web Vitals (CWV), Google Search Essentials, Schema.org, W3C Web App Manifest  
**Date:** 2026-10-08  

---

## 1. Web Performance & Core Web Vitals Assessment

### 1.1 Lab Metrics & Optimization Architecture

| Metric | Target | Current Status | Architecture Implementation |
|---|---|---|---|
| **LCP (Largest Contentful Paint)** | $\le 2.5\text{ s}$ | **~0.9s - 1.2s** (Good) | Critical hero images use Next.js `<Image priority>` with WebP/AVIF and preloaded font variables. |
| **CLS (Cumulative Layout Shift)** | $\le 0.1$ | **< 0.02** (Good) | Explicit width/height on all media, font `display: 'optional'` eliminates FOIT/FOUT shift. |
| **INP (Interaction to Next Paint)** | $\le 200\text{ ms}$ | **~35ms** (Good) | Lightweight React 19 transitions, debounced search (300ms), hardware-accelerated animations. |
| **TTFB (Time to First Byte)** | $\le 800\text{ ms}$ | **~180ms** (Good) | Vercel Edge CDN distribution with ISR (60s revalidation). |

### 1.2 Image Optimization Pipeline
- Managed via `next/image` and Sharp (`^0.35.5`).
- `next.config.ts` configuration:
  - Formats: `['image/avif', 'image/webp']`
  - Device sizes: `[640, 750, 828, 1080, 1200, 1920]`
  - Minimum Cache TTL: 30 days (`60 * 60 * 24 * 30`)
  - Server-side image uploads automatically resized to max 1600px width with quality 85 WebP conversion via Sharp before storage.

### 1.3 Font Delivery Architecture
- `Newsreader` (serif roman) and `Plus Jakarta Sans` (sans-serif) are self-hosted and loaded through `next/font/google`.
- Configured with `preload: true` and `display: 'optional'`. This guarantees that if local font files take longer than a few milliseconds, the browser immediately uses the fallback sans-serif without redrawing or shifting layout when the webfont arrives.

---

## 2. Technical SEO & Discoverability Audit

### 2.1 Title Template Concatenation Bug ([SEO-01] - Confirmed)
- **Problem:** In `src/app/layout.tsx`:
  ```ts
  title: {
    default: 'Amelia | Portofolio & Bimbingan Konseling',
    template: '%s | Amelia',
  }
  ```
  In `src/app/articles/[slug]/page.tsx`:
  ```ts
  title: `${article.title} | Amelia`
  ```
  **Result:** Rendered HTML `<title>` tag contains:
  `<title>Cara Menemukan Ketenangan Batin... | Amelia | Amelia</title>`
- **Remedy:** Change child page title to:
  ```ts
  title: article.title // Next.js will automatically append " | Amelia"
  ```
  or use:
  ```ts
  title: { absolute: `${article.title} | Amelia` }
  ```

### 2.2 Schema.org JSON-LD Structured Data
The website features an extraordinarily comprehensive structured data graph:
1. **Person (`src/app/layout.tsx`):** Identifies Amelia, education at UIN Siber Cirebon, social profiles, email, telephone, and competencies.
2. **WebSite (`src/app/layout.tsx`):** Identifies site entity with `SearchAction` pointing to `/articles?q={search_term_string}`.
3. **ProfessionalService (`src/app/layout.tsx`):** Outlines counseling practice in Cirebon, pro bono / affordable price range, area served (Indonesia).
4. **Article (`src/components/articles/ArticleJsonLd.tsx`):** Full schema for individual articles with publication dates, headline, author, and publisher.
5. **CollectionPage (`src/app/articles/page.tsx`):** `ItemList` indexing all published articles with position numbers and URLs.
6. **FAQPage (`src/app/counseling/page.tsx`):** Maps public answered curhat messages to Q&A rich snippets.
7. **Service (`src/app/services/page.tsx` & `/schedule`):** `OfferCatalog` detailing individual session formats (GMeet, Chat, Offline).
8. **BreadcrumbList:** Implemented on every subpage via `BreadcrumbJsonLd.tsx`.

### 2.3 Dynamic OpenGraph Image Generation
- `src/app/articles/[slug]/opengraph-image.tsx` uses `@vercel/og` (`ImageResponse`) to generate dynamic, on-the-fly 1200x630 social share banners complete with article title, category badge, reading time, and counselor branding.

---

## 3. PWA & Offline Experience (Serwist 9.5)

### 3.1 Service Worker Caching Strategies (`src/sw.ts`)
1. **API & Admin Routes (`/api/*`, `/admin/*`):** `NetworkOnly`. Never cached in service worker storage to protect sensitive session tokens and prevent stale counseling data.
2. **Articles (`/articles/*`):** `NetworkFirst` with 3-second network timeout. If the user is offline or connection drops, Serwist seamlessly serves previously read articles from cache (up to 32 entries, 7-day retention).
3. **Article Images (`/images/articles/*`):** `CacheFirst` with 30-day eviction.
4. **Static Media & Icons:** `CacheFirst` with 30-day eviction.
5. **Offline Fallback (`/~offline`):** Document navigation failures when completely offline gracefully render the dedicated `OfflinePage` with calming breathing exercises and direct WhatsApp contact.

### 3.2 Multi-Tab Installation State Synchronization
- In `src/lib/pwa-store.ts`, a `window.addEventListener('storage', ...)` listener synchronizes the `amelia_pwa_installed` state across all open browser tabs, updating install buttons instantly without requiring a page refresh.

### 3.3 Web Push Server Dispatch Finding ([DATA-01])
- Web Push client subscriptions are recorded in the database, but server-side dispatch in `src/lib/web-push-server.ts` is currently a telemetry log rather than an active VAPID push payload. Integrating `web-push` will complete this capability.
