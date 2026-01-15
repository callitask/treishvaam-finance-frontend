import { BASE_URL } from '../apiConfig';

/**
 * AI-CONTEXT:
 * Purpose: Centralizes image URL generation for responsive images (srcset) and SEO.
 * * ------------------------------------------------------------------
 * CRITICAL HISTORY:
 * 1. FIXED 404s ON LEGACY NEWS:
 * - Detected 'news-' prefix (Legacy Single File).
 * - Returned empty srcset for these files to prevent 404 errors in console.
 * 2. ENABLED ENTERPRISE NEWS (MULTI-VARIANT):
 * - Detected 'news-mv-' prefix (New Enterprise System).
 * - Returns FULL srcset for these, enabling 480w/800w optimization on mobile.
 * ------------------------------------------------------------------
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED:
 * • Added smart detection for 'news-' (Legacy) vs 'news-mv-' (Enterprise)
 * • Reason: Eliminate 404 errors for old items while enabling performance for new ones.
 */

// AI-NOTE: Matches backend ImageService.java generation logic (480w, 800w, 1200w)
const RESIZE_VARIANTS = [480, 800, 1200];

/**
 * Generates src and srcset for a given image filename.
 * @param {string} inputString - The filename from the API.
 * @returns {object} { src, srcset }
 */
export const getOptimizedImageIds = (inputString) => {
    // 1. Handle Null/Undefined
    if (!inputString || typeof inputString !== 'string') {
        return { src: '/placeholder-news.jpg', srcset: '' };
    }

    // 2. Handle External URLs
    if (inputString.startsWith('http') || inputString.startsWith('https')) {
        return { src: inputString, srcset: '' };
    }

    // 3. Handle Relative Paths
    if (inputString.startsWith('/')) {
        return { src: `${BASE_URL}${inputString}`, srcset: '' };
    }

    // 4. Construct Backend URLs
    let baseName = inputString;
    const extIndex = inputString.lastIndexOf('.');
    if (extIndex !== -1) {
        baseName = inputString.substring(0, extIndex);
    }

    const baseUrl = `${BASE_URL}/api/v1/uploads`;

    // SAFE FALLBACK: 'src' is always the original filename requested
    const src = `${baseUrl}/${inputString}`;

    // --- SMART LOGIC FOR NEWS ITEMS ---
    // Rule: Legacy News items (prefix 'news-') do NOT have variants.
    // Rule: Enterprise News items (prefix 'news-mv-') DO have variants.
    // Rule: Blog/User items (UUID only) DO have variants.

    // Check if it is a Legacy News item (Starts with 'news-' BUT NOT 'news-mv-')
    const isLegacyNews = inputString.startsWith('news-') && !inputString.startsWith('news-mv-');

    if (isLegacyNews) {
        // LEGACY MODE: Return only src. Stops 404 console errors.
        return {
            src,
            srcset: '' // No variants exist for these
        };
    }

    // ENTERPRISE MODE: Generate full srcset
    const srcsetParts = RESIZE_VARIANTS.map(width => {
        return `${baseUrl}/${baseName}-${width}.webp ${width}w`;
    });

    // Append master as 1920w
    srcsetParts.push(`${baseUrl}/${baseName}.webp 1920w`);

    return {
        src,
        srcset: srcsetParts.join(', ')
    };
};