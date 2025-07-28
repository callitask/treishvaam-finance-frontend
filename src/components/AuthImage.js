import React from 'react';

/**
 * --- REWRITTEN FOR PERFORMANCE & CORRECTNESS ---
 * This component is now a simple wrapper around the native <img> tag.
 * Since the image routes are public, we don't need complex authenticated fetching.
 * This change allows the browser to handle `src`, `srcSet`, and the `onLoad`
 * event natively, which is more performant and fixes the masonry layout.
 */
const AuthImage = ({ src, srcSet, alt, onLoad, ...props }) => {
    // If there's no src, render a placeholder to avoid broken image icons.
    if (!src) {
        return <div className="w-full h-full bg-gray-200 animate-pulse" {...props}></div>;
    }

    // Render the native img tag with all props passed down.
    return (
        <img
            src={src}
            srcSet={srcSet}
            alt={alt}
            onLoad={onLoad} // This will now fire correctly.
            {...props}
        />
    );
};

export default AuthImage;