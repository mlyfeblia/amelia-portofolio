import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import {
  Serwist,
  NetworkOnly,
  CacheFirst,
  NetworkFirst,
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
    // 2. Offline reading for articles: NetworkFirst (fresh on network, available offline from cache)
    {
      matcher: ({ url, request }) =>
        request.destination === 'document' && url.pathname.startsWith('/articles'),
      handler: new NetworkFirst({
        cacheName: 'amelia-articles-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
            maxAgeFrom: 'last-used',
          }),
        ],
        networkTimeoutSeconds: 3,
      }),
    },
    // 3. Static images & favicons (CacheFirst with 30-day eviction)
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
    // 4. Serwist default Next.js App Router caching strategies (RSC, chunks, Google fonts)
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

serwist.addEventListeners();
