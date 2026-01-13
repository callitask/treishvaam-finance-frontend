import { BASE_URL } from '../apiConfig';

/**
 * AI-CONTEXT:
 * Purpose: Centralizes image URL generation. 
 * Change Intent: Fixed critical bug where 'news-' prefix was stripped from legacy images. 
 * Now preserves full filename structure to ensure 404s are eliminated.
 * Critical Dependencies:
 * - Backend: Expects backend to generate 'filename-480.webp' for optimization.
 * - DB: Expects 'filename' to be passed exactly as stored in DB (e.g. 'news-uuid.jpg').
 * Non-Negotiables:
 * - Must preserve original filename prefix (e.g., 'news-', 'user-').
 * - Must return valid src (fallback) and srcset (optimized).
 */

// AI-NOTE: Matches backend ImageService.java resizing logic
const RESIZE_VARIANTS = [480, 800, 1200];

/**
 * Generates optimized src and srcset for a given image filename.
 * @param {string} inputString - The full filename from DB (e.g. "news-1234.jpg" or "abcd-1234.webp")
 * @returns {object} { src, srcset }
 */
export const getOptimizedImageIds = (inputString) => {
    // 1. Safety Checks
    if (!inputString || typeof inputString !== 'string') {
        return {
            src: '/placeholder-news.jpg',
            srcset: ''
        };
    }

    // 2. Handle External URLs
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

    // 4. Base Name Extraction (PRESERVE PREFIXES)
    // Old Logic (Broken): match(/[a-f0-9-]{36}/) -> Stripped 'news-'
    // New Logic (Fixed): Simply strip the extension.

    let baseName = inputString;
    let originalExtension = '';

    const extIndex = inputString.lastIndexOf('.');
    if (extIndex !== -1) {
        baseName = inputString.substring(0, extIndex);
        originalExtension = inputString.substring(extIndex);
    } else {
        // If no extension, assume the whole string is the base
        originalExtension = '.webp'; // Default assumption for backend 
    }

    // 5. Construct URLs
    const baseUrl = `${BASE_URL}/api/uploads`;

    // Master Image (Fallback)
    // Uses the EXACT filename from DB + Extension. 
    // This guarantees we find the file if it exists.
    const src = `${baseUrl}/${inputString}`;

    // Resized Variants
    // Backend Logic: baseName + "-" + width + ".webp"
    // Example: "news-1234-480.webp"
    const srcsetParts = RESIZE_VARIANTS.map(width => {
        return `${baseUrl}/${baseName}-${width}.webp ${width}w`;
    });

    // Add Master to srcset
    srcsetParts.push(`${src} 1920w`);

    return {
        src, // The safe, original file
        srcset: srcsetParts.join(', ') // The optimized variants
    };
};