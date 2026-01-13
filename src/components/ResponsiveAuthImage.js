import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { getOptimizedImageIds } from '../utils/imageOptimization';

/**
 * AI-CONTEXT:
 * Purpose: Smart image component for Auth/Profile sections.
 * Scope: Used in ProfilePage, LoginPage, etc.
 * Critical Dependencies:
 * - Utility: src/utils/imageOptimization.js.
 * Non-Negotiables:
 * - Must support fallback to Master URL if resized variants (srcset) 404.
 * Change Intent: Added error handling state to support legacy images.
 */
const ResponsiveAuthImage = ({ baseName, alt, className, sizes, onLoad, eager = false, width, height }) => {
    // State to track if optimized version failed
    const [useFallback, setUseFallback] = useState(false);

    // AI-NOTE: Delegate logic to the shared utility
    const { src, srcset } = getOptimizedImageIds(baseName);

    // If no valid src returned, render placeholder
    if (!src || src.includes('placeholder')) {
        return <div className={`bg-gray-200 ${className}`} style={{ width, height }} />;
    }

    // Placeholder for blur effect (derived safely)
    const placeholderSrc = src.replace(/(\.[\w\d]+)$/, '-480.webp');

    const handleError = () => {
        if (!useFallback) {
            console.warn(`ResponsiveAuthImage: Optimization failed for ${baseName}, falling back to master.`);
            setUseFallback(true);
        }
    };

    // If falling back, we remove srcset to force browser to use 'src'
    const finalSrcSet = useFallback ? undefined : srcset;

    // PERFORMANCE FIX: If 'eager' is true (LCP images), use standard <img> tag
    if (eager) {
        return (
            <img
                alt={alt}
                src={src}
                srcSet={finalSrcSet}
                sizes={sizes}
                className={className}
                onLoad={onLoad}
                onError={handleError}
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
            srcSet={finalSrcSet}
            sizes={sizes}
            placeholderSrc={placeholderSrc}
            effect="blur"
            className={className}
            afterLoad={onLoad}
            onError={handleError}
            width={width}
            height={height}
        />
    );
};

export default ResponsiveAuthImage;