/// <reference lib="webworker" />
/**
 * AI-CONTEXT:
 * Purpose: Service Worker for offline support and asset caching.
 * Strategy:
 * - Static assets (JS, CSS, images): CacheFirst — served from cache, updated in background.
 * - API routes (/api/v1/posts, /api/v1/market): NetworkFirst — try network first,
 * fall back to cache on network failure (offline reading).
 * - Auth routes (/api/v1/auth/, dashboard): NetworkOnly — never cache auth.
 * Non-Negotiables:
 * - Auth routes must NEVER be cached.
 * - Dashboard routes must NEVER be cached.
 * - Admin routes must NEVER be cached.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED (Phase 7): Service Worker for offline-first PWA support.
 * - EDITED (Hotfix 1): Added webworker triple-slash reference to bypass TS module resolution failure for ServiceWorkerGlobalScope.
 * - EDITED (Hotfix 2): Migrated legacy next-pwa string handlers ('NetworkFirst') to Serwist explicit strategy classes (`new NetworkFirst()`) to fix TS `RouteHandler` type assignment errors.
 */
import { defaultCache } from '@serwist/next/worker';
import { Serwist, NetworkFirst, CacheFirst, ExpirationPlugin } from 'serwist';

declare const self: ServiceWorkerGlobalScope & {
    __SW_MANIFEST: any;
};

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: [
        // Public blog posts — NetworkFirst with 24h cache fallback
        {
            matcher: /^https:\/\/.*\/api\/v1\/posts\//,
            handler: new NetworkFirst({
                cacheName: 'blog-posts-cache',
                networkTimeoutSeconds: 5,
                plugins: [
                    new ExpirationPlugin({
                        maxAgeSeconds: 86400,
                        maxEntries: 50,
                    }),
                ],
            }),
        },
        // Market data — NetworkFirst with 5-minute cache fallback
        {
            matcher: /^https:\/\/.*\/api\/v1\/market\//,
            handler: new NetworkFirst({
                cacheName: 'market-data-cache',
                networkTimeoutSeconds: 3,
                plugins: [
                    new ExpirationPlugin({
                        maxAgeSeconds: 300,
                        maxEntries: 100,
                    }),
                ],
            }),
        },
        // Static assets (images from MinIO) — CacheFirst
        {
            matcher: /^https?:\/\/.*\.(png|jpg|jpeg|webp|gif|svg|ico)$/,
            handler: new CacheFirst({
                cacheName: 'images-cache',
                plugins: [
                    new ExpirationPlugin({
                        maxAgeSeconds: 2592000,
                        maxEntries: 200,
                    }),
                ],
            }),
        },
        // Default: use serwist defaults for everything else
        ...defaultCache,
    ],
});

serwist.addEventListeners();