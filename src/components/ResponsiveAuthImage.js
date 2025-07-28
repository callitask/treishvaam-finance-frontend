import React from 'react';
import AuthImage from './AuthImage';
import { API_URL } from '../apiConfig'; // Import the base URL

/**
 * This component constructs the full, responsive image URLs and passes them
 * to the simple AuthImage component for rendering.
 */
const ResponsiveAuthImage = ({ baseName, alt, className, sizes, onLoad }) => {
    if (!baseName) {
        return <div className={`bg-gray-200 ${className}`} />;
    }

    // The 'baseName' prop is now just the unique ID, e.g., "33cced39-..."
    // We no longer need to clean it. We construct the full URLs here.

    // Construct the FULL URLs for the browser, including the API base URL.
    const src = `${API_URL}/api/uploads/${baseName}-small.webp`;
    const srcSet = `
        ${API_URL}/api/uploads/${baseName}-small.webp 300w,
        ${API_URL}/api/uploads/${baseName}-medium.webp 600w,
        ${API_URL}/api/uploads/${baseName}.webp 1200w
    `;

    return (
        <AuthImage
            src={src}
            srcSet={srcSet}
            sizes={sizes}
            alt={alt}
            className={className}
            loading="lazy"
            onLoad={onLoad} // Pass the onLoad handler down to the <img> tag
        />
    );
};

export default ResponsiveAuthImage;