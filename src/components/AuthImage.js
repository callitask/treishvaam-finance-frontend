import React, { useState, useEffect } from 'react';
import api from '../apiConfig'; // Ensure this path is correct

const AuthImage = ({ src, alt, ...props }) => {
    const [imageSrc, setImageSrc] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
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
                    const imageUrl = URL.createObjectURL(imageBlob);
                    setImageSrc(imageUrl);
                } catch (err) {
                    console.error(`Failed to fetch image: ${src}`, err);
                    setError(true);
                }
            }
        };

        fetchImage();

        return () => {
            if (imageSrc) {
                URL.revokeObjectURL(imageSrc);
            }
        };
    }, [src]);

    if (error) {
        // Render a broken image placeholder if the fetch fails
        return <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center"><span className="text-red-500 text-xs">Error</span></div>;
    }

    if (!imageSrc) {
        // Render a placeholder while loading
        return <div className="w-full h-full bg-gray-200 rounded-full animate-pulse"></div>;
    }

    return <img src={imageSrc} alt={alt} {...props} />;
};

export default AuthImage;