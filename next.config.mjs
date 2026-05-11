/**
 * AI-CONTEXT:
 * Purpose: Next.js Configuration.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Removed `output: 'export'` to upgrade to Cloudflare Next.js Edge SSR.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;