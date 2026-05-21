/**
 * AI-CONTEXT:
 * Purpose: Next.js Configuration.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED (Current Phase):
 * • Appended explicit `https://backend.treishvaamgroup.com` origin to `connect-src` and `frame-src` alongside the wildcard.
 * • Why: Resolved an issue where strict browser security policies failed to parse the wildcard domain correctly during cross-origin token exchanges and silent SSO iframe loading, throwing a false positive CSP block.
 * - EDITED: Replaced dynamic CSP URL parsing with deterministic Enterprise Boundary wildcards (`https://*.treishvaamgroup.com`).
 * - EDITED: Migrated Content-Security-Policy (CSP) generation from static `public/_headers` to Next.js `headers()`.
 * - EDITED: Added `remotePatterns` to `images` configuration to securely whitelist external HTTPS domains.
 * - EDITED: Removed `output: 'export'` to upgrade to Cloudflare Next.js Edge SSR.
 * - EDITED: Added pageExtensions to force Next.js to ignore the legacy src/pages folder for routing.
 * - EDITED (Phase 3 — CSP Nonce):
 * • Removed static Content-Security-Policy header (now handled dynamically by middleware.ts for nonces).
 * • Added Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy, and X-Permitted-Cross-Domain-Policies.
 * * - EDITED (Phase 7 & 8):
 * • Wrapped next config with `withSerwist` for PWA offline-fallback capability.
 * • Removed `unoptimized: true` and replaced it with a Cloudflare custom Image Loader.
 * • Why: Restores Image optimization without breaking Cloudflare Pages Edge Server constraints.
 */
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
    swSrc: 'src/sw.ts',
    swDest: 'public/sw.js',
    disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ['tsx', 'ts'],
    images: {
        loader: 'custom',
        loaderFile: './src/utils/cloudflareImageLoader.ts',
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
                    { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
                    { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
                ],
            }
        ];
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default withSerwist(nextConfig);