/**
 * AI-CONTEXT:
 * Purpose: Smart image component that requests the correct resolution from the backend based on screen width.
 * Changes:
 * - Fixed srcSet to match Backend ImageService generation (-480, -800, -1200).
 * - Added width/height prop support for CLS prevention.
 * - Removed broken '-tiny' and '-small' references.
 * Non-Negotiables: Must match Backend file naming exactly.
 */
import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { API_URL } from '../apiConfig';

const ResponsiveAuthImage = ({ baseName, alt, className, sizes, onLoad, eager = false, width, height }) => {
    // Render a simple placeholder if baseName is invalid.
    if (!baseName || typeof baseName !== 'string') {
        return <div className={`bg-gray-200 ${className}`} style={{ width, height }} />;
    }

    const uuidRegex = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/;
    const match = baseName.match(uuidRegex);

    if (!match) {
        console.warn(`ResponsiveAuthImage: Could not extract a valid image ID from baseName: "${baseName}"`);
        return <div className={`bg-gray-200 ${className}`} style={{ width, height }} />;
    }

    const cleanedBaseName = match[0];

    // AI-NOTE: Matched to Backend ImageService.java generation logic
    // Available variants: .webp (1920w), -1200.webp, -800.webp, -480.webp
    const src = `${API_URL}/api/uploads/${cleanedBaseName}-800.webp`; // Default safe fallback

    // Backend does not currently generate a 'tiny' blurred placeholder, so we use the smallest available (480)
    // to prevent 404s on the placeholder request.
    const placeholderSrc = `${API_URL}/api/uploads/${cleanedBaseName}-480.webp`;

    const srcSet = [
        `${API_URL}/api/uploads/${cleanedBaseName}-480.webp 480w`,
        `${API_URL}/api/uploads/${cleanedBaseName}-800.webp 800w`,
        `${API_URL}/api/uploads/${cleanedBaseName}-1200.webp 1200w`,
        `${API_URL}/api/uploads/${cleanedBaseName}.webp 1920w`
    ].join(', ');

    // PERFORMANCE FIX: If 'eager' is true (LCP images), use standard <img> tag
    // This avoids JS delays from the lazy-load library and enables browser prioritization
    if (eager) {
        return (
            <img
                alt={alt}
                src={src}
                srcSet={srcSet}
                sizes={sizes}
                className={className}
                onLoad={onLoad}
                loading="eager"
                fetchpriority="high" // Critical for LCP optimization
                width={width}
                height={height}
            />
        );
    }

    return (
        <LazyLoadImage
            alt={alt}
            src={src}
            srcSet={srcSet}
            sizes={sizes}
            placeholderSrc={placeholderSrc}
            effect="blur"
            className={className}
            afterLoad={onLoad} // Use afterLoad for the library's load event
            width={width}
            height={height}
        />
    );
};

export default ResponsiveAuthImage;