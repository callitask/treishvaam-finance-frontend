import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { API_URL } from '../apiConfig';

const ResponsiveAuthImage = ({ baseName, alt, className, sizes, onLoad }) => {
    // Render a simple placeholder if baseName is invalid.
    if (!baseName || typeof baseName !== 'string') {
        return <div className={`bg-gray-200 ${className}`} />;
    }

    const uuidRegex = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/;
    const match = baseName.match(uuidRegex);

    if (!match) {
        console.warn(`ResponsiveAuthImage: Could not extract a valid image ID from baseName: "${baseName}"`);
        return <div className={`bg-gray-200 ${className}`} />;
    }

    const cleanedBaseName = match[0];

    // Construct image URLs
    const src = `${API_URL}/api/uploads/${cleanedBaseName}-small.webp`;
    const placeholderSrc = `${API_URL}/api/uploads/${cleanedBaseName}-tiny.webp`; // New tiny version for the blur effect
    const srcSet = [
        `${API_URL}/api/uploads/${cleanedBaseName}-small.webp 300w`,
        `${API_URL}/api/uploads/${cleanedBaseName}-medium.webp 600w`,
        `${API_URL}/api/uploads/${cleanedBaseName}.webp 1200w`
    ].join(', ');

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
        />
    );
};

export default ResponsiveAuthImage;