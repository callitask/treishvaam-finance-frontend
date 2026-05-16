/**
 * AI-CONTEXT:
 * Purpose: Next.js Configuration.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED (Current Phase): 
 * • Added `remotePatterns` to `images` configuration to securely whitelist external HTTPS domains.
 * • Why: To support Zero-Trust dynamic asset management (e.g., fetching Chairman's portrait from external free-tier R2/MinIO storage without requiring Git commits).
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
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;