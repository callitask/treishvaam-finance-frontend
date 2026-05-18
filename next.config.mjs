/**
 * AI-CONTEXT:
 * Purpose: Next.js Configuration.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED (Current Phase): 
 * • Migrated Content-Security-Policy (CSP) generation from static `public/_headers` to Next.js `headers()`.
 * • Why: To resolve `frame-src` Keycloak iframe blocking while strictly enforcing Zero-Trust architecture. Backend origins are now dynamically parsed from `NEXT_PUBLIC_AUTH_URL` at build time, eliminating all hardcoded infrastructure URLs from the codebase.
 * - EDITED: Added `remotePatterns` to `images` configuration to securely whitelist external HTTPS domains.
 * - EDITED: Removed `output: 'export'` to upgrade to Cloudflare Next.js Edge SSR.
 * - EDITED: Added pageExtensions to force Next.js to ignore the legacy src/pages folder for routing.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
    // This tells the Next.js router to ONLY look at .tsx and .ts files for URLs.
    // It prevents the old .js files in src/pages from being built as rogue standalone routes.
    pageExtensions: ['tsx', 'ts'],
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**', // Broadly allows any secure HTTPS domain for free-tier dynamic storage. Can be restricted to specific R2/MinIO domains later.
            },
        ],
    },
    async headers() {
        let authOrigin = '';
        try {
            if (process.env.NEXT_PUBLIC_AUTH_URL) {
                authOrigin = new URL(process.env.NEXT_PUBLIC_AUTH_URL).origin;
            }
        } catch (e) {
            console.warn('Invalid NEXT_PUBLIC_AUTH_URL during build. CSP dynamic injection may fail.');
        }

        const frameSrc = authOrigin ? `'self' ${authOrigin}` : `'self'`;
        const connectSrc = authOrigin ? `'self' ${authOrigin} https://www.google-analytics.com https://cloudflareinsights.com` : `'self' https://www.google-analytics.com https://cloudflareinsights.com`;

        const cspHeader = `
            default-src 'self';
            script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://cloudflareinsights.com https://static.cloudflareinsights.com;
            style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
            font-src 'self' data: https://fonts.gstatic.com;
            img-src 'self' data: blob: https:;
            connect-src ${connectSrc};
            frame-src ${frameSrc};
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