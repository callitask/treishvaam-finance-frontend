import { BASE_URL } from '../apiConfig';

/**
 * AI-CONTEXT:
 * Purpose: Centralizes image URL generation for responsive images (srcset) and SEO.
 * * ------------------------------------------------------------------
 * CRITICAL HISTORY & "WHAT NOT TO DO":
 * 1. REGEX UUID PARSING (FAILED):
 * - Attempted to parse UUIDs using Regex to find filenames.
 * - RESULT: FAILED. Stripped critical prefixes like 'news-' or 'user-' from legacy images.
 * - FIX: Do NOT use Regex to extracting IDs. Use simple string splitting to preserve full filenames.
 * * 2. UNUSED VARIABLES (FAILED):
 * - Left 'originalExtension' variable defined but unused.
 * - RESULT: CI/CD Build FAILED. Cloudflare Pages treats warnings as errors (process.env.CI=true).
 * - FIX: Strictly remove any unused variables. Do not comment them out.
 * * 3. LEGACY IMAGE 404s (FIXED via FALLBACK):
 * - Older images do not have resized variants (-480.webp).
 * - RESULT: 404 errors on mobile.
 * - FIX: This utility generates the URL, but the COMPONENT (NewsCard) handles the fallback.
 * If this utility returns a URL that 404s, the component switches to 'src' (Master).
 * ------------------------------------------------------------------
 * * Critical Dependencies:
 * - Backend: Expects 'filename-480.webp', 'filename-800.webp' convention.
 * - apiConfig: Needs BASE_URL.
 */

// AI-NOTE: Matches backend ImageService.java generation logic (480w, 800w, 1200w)
const RESIZE_VARIANTS = [480, 800, 1200];

/**
 * Generates src and srcset for a given image filename.
 * @param {string} inputString - The filename from the API (e.g., "news-uuid.jpg").
 * @returns {object} { src, srcset } - 'src' is the Master/Fallback, 'srcset' contains resized variants.
 */
export const getOptimizedImageIds = (inputString) => {
    // 1. Handle Null/Undefined
    if (!inputString || typeof inputString !== 'string') {
        return {
            src: '/placeholder-news.jpg',
            srcset: ''
        };
    }

    // 2. Handle External URLs (e.g., social login avatars, external ads)
    if (inputString.startsWith('http') || inputString.startsWith('https')) {
        return {
            src: inputString,
            srcset: ''
        };
    }

    // 3. Handle Relative Paths (static assets)
    if (inputString.startsWith('/')) {
        return {
            src: `${BASE_URL}${inputString}`,
            srcset: ''
        };
    }

    // 4. Construct Backend URLs
    // AI-NOTE: We intentionally use simple string manipulation here to preserve prefixes (like 'news-').
    // Do NOT revert to Regex parsing.

    let baseName = inputString;

    // Check if there is an extension to strip
    const extIndex = inputString.lastIndexOf('.');
    if (extIndex !== -1) {
        baseName = inputString.substring(0, extIndex);
    }
    // If no extension, we treat the whole string as the base name.

    const baseUrl = `${BASE_URL}/api/uploads`;

    // Construct the Master URL (Fallback) - uses original inputString to ensure exact match
    const src = `${baseUrl}/${inputString}`;

    // Construct srcset string
    // Format: "url-480.webp 480w, url-800.webp 800w, url-1200.webp 1200w"
    const srcsetParts = RESIZE_VARIANTS.map(width => {
        return `${baseUrl}/${baseName}-${width}.webp ${width}w`;
    });

    // Append the master image to srcset as the largest option (1920w)
    srcsetParts.push(`${src} 1920w`);

    return {
        src,
        srcset: srcsetParts.join(', ')
    };
};