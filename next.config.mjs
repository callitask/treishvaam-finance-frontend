/**
 * AI-CONTEXT:
 * Purpose: Next.js Configuration.
 * IMMUTABLE CHANGE HISTORY:
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
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;