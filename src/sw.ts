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
 * 
 * - EDITED (Phase 4 - Video PWA Crash Fix):
 * • Updated the `/api/v1/posts/` Workbox matcher to explicitly filter `&& request.method === 'GET'`.
 * • Why: Prevents the Service Worker from blindly intercepting `POST`/`PUT` multipart video uploads. Caching massive binary payloads in the background thread exhausted browser memory and crashed the PWA with `no-response`.
 *
 * - EDITED (Phase 5 - Auth Navigation Exclusion Fix):
 * • Added explicit `NetworkOnly` routing matcher for `/login`, `/auth`, `/dashboard`, `silent-check-sso.html`, `/api/v1/auth`, and `/api/v1/admin`.
 * • Why: Eradicates `Uncaught (in promise) no-response` on `/login`. Guarantees live OIDC authentication and admin actions are never intercepted or broken by offline cache strategies.
 *
 * - EDITED (Phase 7 - Service Worker Cross-Origin Bypass - 2026-11-01):
 * • Added `sameOrigin` guard to every `runtimeCaching` matcher so third-party origins
 *   (googletagmanager.com, static.cloudflareinsights.com, fonts.googleapis.com, external news
 *   images) are NEVER intercepted by sw.ts, eliminating CSP `connect-src` / `no-response` errors.
 * • Added `cleanupOutdatedCaches: true` alongside existing `skipWaiting`/`clientsClaim`.
 *
 * - EDITED (Phase 12.1 - Video Stream & Upload NetworkOnly Bypass):
 * • Added NetworkOnly routing matcher for `/api/v1/uploads`, `/api/v1/video`, `/uploads`, and `.(m3u8|ts|mp4|webm|mov)` files.
 * • Why: Completely isolates HLS adaptive streaming and HTTP 206 Partial Content range requests from Service Worker Cache API storage failures.
 * - EDITED (Phase 13.1 - Service Worker defaultCache Same-Origin Fix):
 * • Wrapped `...defaultCache` spread with per-handler matcher guard requiring same-origin (`url.origin === self.location.origin`).
 * • Why: Eliminates cross-origin fetch interception for external news images (bnnbloomberg.ca, livemint.com), resolving CSP `connect-src` / `no-response` errors. External images now load natively via `<img>` under `img-src https:`.
 *
 * - DO-NOT-DELETE RULE (ABSOLUTE): * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions. 
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
import { defaultCache } from '@serwist/next/worker';
import { Serwist, NetworkFirst, CacheFirst, NetworkOnly, ExpirationPlugin } from 'serwist';

declare const self: ServiceWorkerGlobalScope & {
    __SW_MANIFEST: any;
};

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    navigationPreload: true,
    runtimeCaching: [
        // Video Streams, Range Requests & Media Uploads — NetworkOnly (bypasses Cache API to support 206 Partial Content and HLS streams)
        {
            matcher: ({ url }) => {
                const pathname = url.pathname;
                return (
                    pathname.startsWith('/api/v1/uploads') ||
                    pathname.startsWith('/api/v1/video') ||
                    pathname.startsWith('/uploads') ||
                    /\.(m3u8|ts|mp4|webm|mov)(\?.*)?$/i.test(pathname)
                );
            },
            handler: new NetworkOnly(),
        },
        // Auth, Login, and Admin routes — NetworkOnly (never cache)
        {
            matcher: ({ url, sameOrigin }) => {
                if (!sameOrigin) return false;
                const pathname = url.pathname;
                return (
                    pathname.startsWith('/login') ||
                    pathname.startsWith('/auth') ||
                    pathname.startsWith('/dashboard') ||
                    pathname.includes('silent-check-sso.html') ||
                    pathname.startsWith('/api/v1/auth') ||
                    pathname.startsWith('/api/v1/admin')
                );
            },
            handler: new NetworkOnly(),
        },
        // Public blog posts — NetworkFirst with 24h cache fallback (same-origin only)
        {
            matcher: ({ request, url, sameOrigin }) =>
                sameOrigin && !!url.href.match(/^https:\/\/.*\/api\/v1\/posts\//) && request.method === 'GET',
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
        // Market data — NetworkFirst with 5-minute cache fallback (same-origin only)
        {
            matcher: ({ url, sameOrigin }) => sameOrigin && /^https:\/\/.*\/api\/v1\/market\//.test(url.href),
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
        // GEO AI Payloads — NetworkFirst for offline vector intelligence (same-origin only)
        {
            matcher: ({ url, sameOrigin }) => sameOrigin && /^https?:\/\/.*\/(llms\.txt|ai-feed\.md|ontology\.json)$/.test(url.href),
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
        // Static assets (images from MinIO) — CacheFirst (same-origin only)
        {
            matcher: ({ url, sameOrigin }) => sameOrigin && /^https?:\/\/.*\.(png|jpg|jpeg|webp|gif|svg|ico)$/.test(url.href),
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
        // Default: serwist defaults for same-origin ONLY (Phase 13.1 — never intercept cross-origin)
        // Wrap each default handler so cross-origin requests (e.g. bnnbloomberg.ca, livemint.com news images)
        // load natively under img-src without CSP connect-src violations.
        ...defaultCache.map((entry) => ({
            ...entry,
            matcher: (args) => {
                try {
                    const { url, sameOrigin } = args;
                    if (sameOrigin === false) return false;
                    if (url && url.origin !== self.location.origin) return false;
                } catch (e) {}
                const m = entry.matcher;
                if (typeof m === 'function') return m(args);
                return true;
            },
        })),
    ],
});

serwist.addEventListeners();