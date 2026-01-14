import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { getOptimizedImageIds } from '../utils/imageOptimization';

/**
 * AI-CONTEXT:
 * Purpose: Smart image component for Auth/Profile.
 * Change Intent: Integrated corrected prefix-aware URL utility.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED:
 * • Fixed Placeholder Generation Regex to prevent domain corruption
 * • Reason: prevented "...group.com" from becoming "...group-480.webp"
 */
const ResponsiveAuthImage = ({ baseName, alt, className, sizes, onLoad, eager = false, width, height }) => {
    const [useFallback, setUseFallback] = useState(false);

    // AI-NOTE: Use the FIXED utility
    const { src, srcset } = getOptimizedImageIds(baseName);

    if (!src || src.includes('placeholder')) {
        return <div className={`bg-gray-200 ${className}`} style={{ width, height }} />;
    }

    // Fallback logic
    const handleError = () => {
        if (!useFallback) {
            setUseFallback(true);
        }
    };

    const finalSrcSet = useFallback ? undefined : srcset;

    // FIX: Safer Placeholder Generation
    // 1. Check if src has an extension at the end (after the last slash)
    // 2. If yes, replace it. If no, append the suffix.
    // 3. This prevents replacing ".com" in the domain name.
    let placeholderSrc;
    if (src.match(/\.[^/.]+$/)) {
        // Has extension (e.g. .jpg, .webp) -> Replace it
        placeholderSrc = src.replace(/(\.[^/.]+)$/, '-480.webp');
    } else {
        // No extension (e.g. UUID only) -> Append suffix
        placeholderSrc = src + '-480.webp';
    }

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