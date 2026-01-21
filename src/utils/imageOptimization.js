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
 * 3. FIXED DOUBLE PATH ISSUE (CRITICAL):
 * - Backend now returns full path 'api/v1/uploads/news-mv-...'
 * - Frontend was prepending base url again.
 * - FIX: Normalized input to always extract just the filename before processing.
 * ------------------------------------------------------------------
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED:
 * • Added smart detection for 'news-' (Legacy) vs 'news-mv-' (Enterprise)
 * • Added Path Normalization to strip directory prefixes
 * • Reason: Fix broken images due to double-path construction
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

    // 3. Handle Relative Paths that are NOT API uploads (e.g. static assets)
    // If it starts with / and DOES NOT contain 'api/v1/uploads' or 'api/uploads', treat as static website asset.
    if (inputString.startsWith('/') && !inputString.includes('api/v1/uploads') && !inputString.includes('api/uploads')) {
        return { src: `${BASE_URL}${inputString}`, srcset: '' };
    }

    // 4. NORMALIZE INPUT: Strip directory paths to get raw filename
    // Fixes the "Double Path" issue where backend returns "api/v1/uploads/file.webp"
    let rawFilename = inputString;
    const parts = inputString.split('/');
    if (parts.length > 1) {
        // Take the last segment (the actual filename)
        rawFilename = parts[parts.length - 1];
    }

    // 5. Construct Base Name (remove extension)
    let baseName = rawFilename;
    const extIndex = rawFilename.lastIndexOf('.');
    if (extIndex !== -1) {
        baseName = rawFilename.substring(0, extIndex);
    }

    const baseUrl = `${BASE_URL}/api/v1/uploads`;

    // SAFE FALLBACK: 'src' uses the clean filename
    const src = `${baseUrl}/${rawFilename}`;

    // --- SMART LOGIC ---
    // Rule: Legacy News items (prefix 'news-') do NOT have variants.
    // Rule: Enterprise News items (prefix 'news-mv-') DO have variants.

    // Check if it is a Legacy News item (Starts with 'news-' BUT NOT 'news-mv-')
    const isLegacyNews = rawFilename.startsWith('news-') && !rawFilename.startsWith('news-mv-');

    if (isLegacyNews) {
        // LEGACY MODE: Return only src. Stops 404 console errors.
        return {
            src,
            srcset: ''
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