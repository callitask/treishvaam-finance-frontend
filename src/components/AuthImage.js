import React, { useState, useEffect } from 'react';
import api from '../apiConfig'; // Adjust if your apiConfig is elsewhere

const AuthImage = ({ src, alt, ...props }) => {
    const [imageSrc, setImageSrc] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        let objectUrl; // Use a local variable to hold the URL

        const fetchImage = async () => {
            if (src) {
                // Reset state for new src
                setImageSrc('');
                setError(false);
                try {
                    const response = await api.get(src, {
                        responseType: 'blob'
                    });
                    const imageBlob = new Blob([response.data]);
                    objectUrl = URL.createObjectURL(imageBlob);
                    setImageSrc(objectUrl);
                } catch (err) {
                    console.error(`Failed to fetch image: ${src}`, err);
                    setError(true);
                }
            }
        };

        fetchImage();

        // The cleanup function now closes over the local 'objectUrl' variable
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [src]); // The effect correctly depends only on 'src'

    if (error) {
        // Render a placeholder if the fetch fails
        return <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center"><span className="text-red-500 text-xs">Error</span></div>;
    }

    if (!imageSrc) {
        // Render a placeholder while loading
        return <div className="w-full h-full bg-gray-200 rounded-full animate-pulse"></div>;
    }

    // Render the image once the source is available
    return <img src={imageSrc} alt={alt} {...props} />;
};

export default AuthImage;