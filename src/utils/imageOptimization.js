import { BASE_URL } from '../apiConfig';

/**
 * AI-CONTEXT:
 * Purpose: Centralizes the generation of responsive image URLs (srcset) for the entire application.
 * Scope: Used by NewsCard, ResponsiveAuthImage, and any future image components.
 * Critical Dependencies:
 * - Backend Naming Convention: Expects backend to generate 'uuid-480.webp', 'uuid-800.webp', etc.
 * - BASE_URL: Must be correctly defined in apiConfig.
 * Non-Negotiables:
 * - Must always return a valid 'src' (fallback).
 * - Must force '.webp' extension for resized variants as per Backend ImageService guarantee.
 * - Must handle external URLs gracefully (return as-is).
 * Change Intent: Created to allow NewsCard and ResponsiveAuthImage to share logic, fixing Mobile LCP and reducing code duplication.
 * Future AI Guidance: If Backend adds new sizes (e.g., -200), add them to RESIZE_VARIANTS here.
 */

// AI-NOTE: These match the Virtual Thread resizing logic in ImageService.java
const RESIZE_VARIANTS = [480, 800, 1200];

/**
 * Generates optimized src and srcset for a given image identifier or filename.
 * @param {string} inputString - The filename (e.g. "uuid.jpg") or base ID.
 * @returns {object} { src, srcset }
 */
export const getOptimizedImageIds = (inputString) => {
    // 1. Safety Checks
    if (!inputString || typeof inputString !== 'string') {
        return {
            src: '/placeholder-news.jpg', // Ensure this asset exists in public/
            srcset: ''
        };
    }

    // 2. Handle External URLs (Ads, Social Avatars)
    if (inputString.startsWith('http') || inputString.startsWith('https')) {
        return {
            src: inputString,
            srcset: ''
        };
    }

    // 3. Handle Static/Relative Paths
    if (inputString.startsWith('/')) {
        return {
            src: `${BASE_URL}${inputString}`,
            srcset: ''
        };
    }

    // 4. Extract UUID/Basename logic
    // We need to support both "uuid.jpg" (from DB) and raw UUID strings
    const uuidRegex = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/;
    const match = inputString.match(uuidRegex);

    let baseName = inputString;
    let originalExtension = '';

    if (match) {
        // If we found a UUID, use it as the base for robust matching
        baseName = match[0];

        // Try to preserve original extension if present in inputString for the fallback 'src'
        const extIndex = inputString.lastIndexOf('.');
        if (extIndex !== -1) {
            originalExtension = inputString.substring(extIndex);
        } else {
            // Default to .webp if no extension provided
            originalExtension = '.webp';
        }
    } else {
        // Fallback for non-standard filenames (though unlikely in this system)
        const extIndex = inputString.lastIndexOf('.');
        if (extIndex !== -1) {
            baseName = inputString.substring(0, extIndex);
            originalExtension = inputString.substring(extIndex);
        } else {
            originalExtension = '.webp';
        }
    }

    // 5. Construct URLs
    const baseUrl = `${BASE_URL}/api/uploads`;

    // Master image (fallback) - keep original extension or default
    const src = `${baseUrl}/${baseName}${originalExtension}`;

    // Resized variants - Backend guarantees these are always WebP
    // Format: "url-480.webp 480w, url-800.webp 800w"
    const srcsetParts = RESIZE_VARIANTS.map(width => {
        return `${baseUrl}/${baseName}-${width}.webp ${width}w`;
    });

    // Add the master image to srcset as the largest option
    srcsetParts.push(`${src} 1920w`);

    return {
        src,
        srcset: srcsetParts.join(', ')
    };
};