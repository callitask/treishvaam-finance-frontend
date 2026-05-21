/**
 * AI-CONTEXT:
 * Purpose: Custom Next.js image loader using Cloudflare Image Resizing.
 * Why: next/image optimization requires a Node.js server. Cloudflare Pages runs Edge Workers.
 * Using Cloudflare's built-in image resizing achieves the same result at the Edge.
 * Non-Negotiables:
 * - Only activate on production (treishvaamfinance.com). Dev uses original URLs.
 * - Cloudflare Image Resizing must be enabled in Cloudflare Dashboard → Speed → Optimization.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED (Phase 8): Custom Cloudflare image loader to replace disabled next/image optimization.
 */
interface LoaderParams {
    src: string;
    width: number;
    quality?: number;
}

export default function cloudflareImageLoader({ src, width, quality = 75 }: LoaderParams): string {
    // In development or if src is already an optimized URL, return as-is
    if (process.env.NODE_ENV !== 'production') return src;
    if (src.includes('/cdn-cgi/image/')) return src; // Already processed

    // Cloudflare Image Resizing format: /cdn-cgi/image/<options>/<url>
    const params = [
        `width=${width}`,
        `quality=${quality}`,
        'format=auto',     // Serve WebP/AVIF to supporting browsers
        'fit=scale-down',
    ].join(',');

    return `/cdn-cgi/image/${params}/${src}`;
}