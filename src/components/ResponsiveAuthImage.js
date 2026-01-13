import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { getOptimizedImageIds } from '../utils/imageOptimization';

/**
 * AI-CONTEXT:
 * Purpose: Smart image component for Auth/Profile sections.
 * Scope: Used in ProfilePage, LoginPage, etc.
 * Critical Dependencies:
 * - Utility: src/utils/imageOptimization.js (Logic Core).
 * Non-Negotiables:
 * - Must accept 'baseName' prop.
 * - Must support 'eager' loading for LCP candidates.
 * - Must maintain existing LazyLoadImage behavior for non-critical images.
 * Change Intent: Refactored to use shared imageOptimization utility for DRY compliance and better maintainability.
 * Future AI Guidance: Do not re-introduce regex/url logic here. Keep it in the utility.
 */
const ResponsiveAuthImage = ({ baseName, alt, className, sizes, onLoad, eager = false, width, height }) => {

    // AI-NOTE: Delegate logic to the shared utility
    const { src, srcset } = getOptimizedImageIds(baseName);

    // If no valid src returned (e.g. empty baseName), render placeholder
    if (!src || src.includes('placeholder')) {
        return <div className={`bg-gray-200 ${className}`} style={{ width, height }} />;
    }

    // AI-NOTE: Generate a low-res placeholder for the blur effect
    // We manually construct the 480w URL here for the 'placeholderSrc' prop specific to this library
    // The utility gives us the full srcset, but LazyLoadImage wants a single string for placeholder.
    // We extract the base path from the result or regen it safely.
    // Since we know the utility logic:
    const placeholderSrc = src.replace(/(\.[\w\d]+)$/, '-480.webp');

    // PERFORMANCE FIX: If 'eager' is true (LCP images), use standard <img> tag
    if (eager) {
        return (
            <img
                alt={alt}
                src={src}
                srcSet={srcset}
                sizes={sizes}
                className={className}
                onLoad={onLoad}
                loading="eager"
                fetchpriority="high"
                width={width}
                height={height}
            />
        );
    }

    return (
        <LazyLoadImage
            alt={alt}
            src={src}
            srcSet={srcset}
            sizes={sizes}
            placeholderSrc={placeholderSrc}
            effect="blur"
            className={className}
            afterLoad={onLoad}
            width={width}
            height={height}
        />
    );
};

export default ResponsiveAuthImage;