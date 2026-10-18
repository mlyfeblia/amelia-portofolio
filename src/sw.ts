import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import {
  Serwist,
  NetworkOnly,
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
  ExpirationPlugin,
} from 'serwist';

// TypeScript declarations for Serwist injection point and worker scope
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: false,
  clientsClaim: false,
  navigationPreload: true,
  runtimeCaching: [
    // 1. API & Admin routes should always go to the network (no stale booking/curhat/admin data, protect sensitive sessions)
    {
      matcher: ({ url }) => url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin'),
      handler: new NetworkOnly(),
    },
    // 2. Offline reading for articles & public pages: NetworkFirst (fresh on network, cached for offline access)
    {
      matcher: ({ url, request }) =>
        request.destination === 'document' &&
        !url.pathname.startsWith('/api') &&
        !url.pathname.startsWith('/admin'),
      handler: new NetworkFirst({
        cacheName: 'amelia-pages-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 48,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
            maxAgeFrom: 'last-used',
          }),
        ],
        networkTimeoutSeconds: 3,
      }),
    },
    // 3. Next.js image optimizer (StaleWhileRevalidate with 30-day eviction)
    {
      matcher: ({ url }) => url.pathname.startsWith('/_next/image'),
      handler: new StaleWhileRevalidate({
        cacheName: 'amelia-optimized-images',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            maxAgeFrom: 'last-used',
          }),
        ],
      }),
    },
    // 4. Article cover images & curated assets (CacheFirst with 30-day eviction)
    {
      matcher: ({ url }) => url.pathname.startsWith('/images/articles/'),
      handler: new CacheFirst({
        cacheName: 'amelia-article-images',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 48,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            maxAgeFrom: 'last-used',
          }),
        ],
      }),
    },
    // 5. Static images & favicons (CacheFirst with 30-day eviction)
    {
      matcher: ({ url }) =>
        /\.(?:png|jpg|jpeg|svg|webp|avif|ico)$/i.test(url.pathname) &&
        !url.pathname.startsWith('/_next/image'),
      handler: new CacheFirst({
        cacheName: 'amelia-static-media',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            maxAgeFrom: 'last-used',
          }),
        ],
      }),
    },
    // 5. Serwist default Next.js App Router caching strategies (RSC, chunks, Google fonts)
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: '/~offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

// Listen for custom skip-waiting messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Web Push event listener
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || 'Amelia Konseling';
    const options: NotificationOptions = {
      body: payload.body || 'Ada kabar terbaru dari Kak Amel.',
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-192x192.png',
      data: {
        url: payload.url || '/',
        timestamp: Date.now(),
      },
      tag: payload.tag || 'amelia-counseling-alert',
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    const rawText = event.data.text();
    event.waitUntil(
      self.registration.showNotification('Amelia Konseling', {
        body: rawText,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
      })
    );
  }
});

// Notification click listener: navigates to target URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client && client.url.includes(self.location.origin)) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

serwist.addEventListeners();

