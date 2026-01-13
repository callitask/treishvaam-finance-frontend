import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { getOptimizedImageIds } from '../utils/imageOptimization';

/**
 * AI-CONTEXT:
 * Purpose: Smart image component for Auth/Profile.
 * Change Intent: Integrated corrected prefix-aware URL utility.
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

    // Attempt to generate a placeholder URL for the blur effect
    // We safely replace the extension of the *src* (which we know is correct now)
    const placeholderSrc = src.replace(/(\.[^.]+)$/, '-480.webp');

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