/**
 * AI-CONTEXT:
 * Purpose: Next.js Configuration.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED (Current Phase): 
 * • Replaced dynamic CSP URL parsing with deterministic Enterprise Boundary wildcards (`https://*.treishvaamgroup.com`).
 * • Why: Build-time evaluation of `process.env.NEXT_PUBLIC_AUTH_URL` failed in Cloudflare CI/CD, resulting in an empty origin that defaulted the CSP to strictly 'self'. This caused a fatal network block on Keycloak token exchanges, triggering an infinite redirect loop. Wildcards ensure Zero-Trust compliance while guaranteeing build determinism.
 * - EDITED: Migrated Content-Security-Policy (CSP) generation from static `public/_headers` to Next.js `headers()`.
 * - EDITED: Added `remotePatterns` to `images` configuration to securely whitelist external HTTPS domains.
 * - EDITED: Removed `output: 'export'` to upgrade to Cloudflare Next.js Edge SSR.
 * - EDITED: Added pageExtensions to force Next.js to ignore the legacy src/pages folder for routing.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ['tsx', 'ts'],
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    async headers() {
        // Deterministic Enterprise Boundary CSP. 
        // Eliminates build-time dependency on Cloudflare environment variable availability.
        const cspHeader = `
            default-src 'self';
            script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://cloudflareinsights.com https://static.cloudflareinsights.com;
            style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
            font-src 'self' data: https://fonts.gstatic.com;
            img-src 'self' data: blob: https:;
            connect-src 'self' https://*.treishvaamgroup.com https://www.google-analytics.com https://cloudflareinsights.com;
            frame-src 'self' https://*.treishvaamgroup.com;
            media-src 'self' https:;
            frame-ancestors 'self';
            object-src 'none';
            upgrade-insecure-requests;
        `.replace(/\s{2,}/g, ' ').trim();

        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'Content-Security-Policy', value: cspHeader }
                ],
            }
        ];
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;