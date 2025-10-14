import React, { useState, useEffect, useRef } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import { API_URL } from '../apiConfig';
import { decode } from 'blurhash';

const BlurHashCanvas = ({ hash, width, height, punch = 1 }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current && hash && width && height) {
            try {
                const pixels = decode(hash, width, height, punch);
                const ctx = canvasRef.current.getContext("2d");
                if (ctx) {
                    const imageData = ctx.createImageData(width, height);
                    imageData.data.set(pixels);
                    ctx.putImageData(imageData, 0, 0);
                }
            } catch (error) {
                console.error("Failed to decode blurhash", error);
            }
        }
    }, [hash, width, height, punch]);

    if (!hash || !width || !height) return null;

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="absolute inset-0 w-full h-full"
        />
    );
};

const ResponsiveAuthImage = ({ baseName, alt, className, sizes, onLoad, eager = false, width, height, blurHash }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    const handleImageLoad = () => {
        setIsLoaded(true);
        if (onLoad) {
            onLoad();
        }
    };

    if (!baseName || typeof baseName !== 'string') {
        return <div className={`bg-gray-200 ${className}`} style={{ aspectRatio: width && height ? `${width}/${height}` : '1' }} />;
    }

    const uuidRegex = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/;
    const match = baseName.match(uuidRegex);

    if (!match) {
        console.warn(`ResponsiveAuthImage: Could not extract a valid image ID from baseName: "${baseName}"`);
        // Fallback for non-UUID patterns, like cover images that might just be a name.
        const cleanedBaseName = baseName.replace(/\.webp$/, '');
        const src = `${API_URL}/api/uploads/${cleanedBaseName}.webp`;

        if (eager) {
            return (
                <img
                    src={src}
                    className={className}
                    onLoad={handleImageLoad}
                    fetchPriority="high"
                    width={width}
                    height={height}
                    alt={alt}
                />
            );
        }
        return (
            <div className="relative w-full h-full overflow-hidden">
                {!isLoaded && blurHash && <BlurHashCanvas hash={blurHash} width={32} height={32} />}
                <LazyLoadImage
                    alt={alt}
                    src={src}
                    className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
                    width={width}
                    height={height}
                    effect="opacity"
                    afterLoad={handleImageLoad}
                />
            </div>
        );
    }

    const cleanedBaseName = match[0];

    const src = `${API_URL}/api/uploads/${cleanedBaseName}-small.webp`;
    const srcSet = [
        `${API_URL}/api/uploads/${cleanedBaseName}-small.webp 300w`,
        `${API_URL}/api/uploads/${cleanedBaseName}-medium.webp 600w`,
        `${API_URL}/api/uploads/${cleanedBaseName}.webp 1200w`
    ].join(', ');

    if (eager) {
        return (
            <img
                src={src}
                srcSet={srcSet}
                sizes={sizes}
                className={className}
                onLoad={handleImageLoad}
                fetchPriority="high"
                width={width}
                height={height}
                alt={alt}
            />
        );
    }

    return (
        <div className="relative w-full h-full overflow-hidden">
            {!isLoaded && blurHash && <BlurHashCanvas hash={blurHash} width={32} height={32} />}
            <LazyLoadImage
                alt={alt}
                src={src}
                srcSet={srcSet}
                sizes={sizes}
                className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
                width={width}
                height={height}
                effect="opacity"
                afterLoad={handleImageLoad}
            />
        </div>
    );
};

export default ResponsiveAuthImage;