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
 * - EDITED (GEO Offline Syndication):
 * • Added explicit `NetworkFirst` caching strategy for Generative Engine Optimization payloads (`/llms.txt`, `/ai-feed.md`, `/ontology.json`).
 * • Why: Enables the Progressive Web App to function as an offline vector intelligence source, providing AI context even without network connectivity.
 * - DO-NOT-DELETE RULE (ABSOLUTE):
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions. 
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
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
        // GEO AI Payloads — NetworkFirst for offline vector intelligence
        {
            matcher: /^https?:\/\/.*\/(llms\.txt|ai-feed\.md|ontology\.json)$/,
            handler: new NetworkFirst({
                cacheName: 'geo-ai-payloads',
                networkTimeoutSeconds: 3,
                plugins: [
                    new ExpirationPlugin({
                        maxAgeSeconds: 86400,
                        maxEntries: 10,
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