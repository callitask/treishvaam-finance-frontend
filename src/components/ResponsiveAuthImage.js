import React from 'react';
import AuthImage from './AuthImage';
import { API_URL } from '../apiConfig'; // Import the base URL

/**
 * This component constructs the full, responsive image URLs and passes them
 * to the simple AuthImage component for rendering.
 * --- MODIFIED FOR ROBUSTNESS ---
 * It now cleans the incoming `baseName` to handle inconsistent URL formats
 * from the database (e.g., full URLs, paths, or filenames with extensions).
 */
const ResponsiveAuthImage = ({ baseName, alt, className, sizes, onLoad }) => {
    if (!baseName || typeof baseName !== 'string') {
        return <div className={`bg-gray-200 ${className}`} />;
    }

    // --- NEW CLEANING LOGIC ---
    // This regex finds a UUID, which is the core part of our image filenames.
    // It handles cases where baseName might be a full URL, a path, or include extensions.
    const uuidRegex = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/;
    const match = baseName.match(uuidRegex);

    // If no valid UUID is found in the string, we can't construct a URL.
    if (!match) {
        console.warn(`ResponsiveAuthImage: Could not extract a valid image ID from baseName: "${baseName}"`);
        return <div className={`bg-gray-200 ${className}`} />;
    }

    const cleanedBaseName = match[0]; // The captured UUID
    // --- END OF NEW LOGIC ---

    // Construct the FULL URLs for the browser using the cleaned base name.
    const src = `${API_URL}/api/uploads/${cleanedBaseName}-small.webp`;
    const srcSet = `
        ${API_URL}/api/uploads/${cleanedBaseName}-small.webp 300w,
        ${API_URL}/api/uploads/${cleanedBaseName}-medium.webp 600w,
        ${API_URL}/api/uploads/${cleanedBaseName}.webp 1200w
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