/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Smart media component capable of rendering images or videos based on URL extensions and layout context.
 *
 * Scope:
 * - Resolves blank cover video anomalies in Grid cards, Hero banners, and Sidebar widgets.
 *
 * Security & Free-Tier Constraints:
 * - Force-rewrites master.m3u8 to 360p.m3u8 in thumbnail/grid contexts to drastically save host bandwidth.
 * - Does not use controls to prevent unauthorized downloading on covers.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED:
 * • Created SmartMediaRenderer to handle cover videos across all editorial layout contexts without breaking grids.
 * • Date/Phase: Phase 2 (Smart Media Engine)
 */

import React, { memo } from 'react';
import ResponsiveAuthImage from '../ResponsiveAuthImage';
import EnterpriseVideoPlayer from './EnterpriseVideoPlayer';

const VIDEO_EXT_REGEX = /\.(mp4|m3u8|webm)(\?.*)?$/i;

const SmartMediaRenderer = memo(({
    mediaUrl,
    alt = 'Treishvaam Media',
    className = '',
    layoutContext = 'grid', // 'grid' | 'sidebar' | 'article' | 'hero'
    width,
    height,
    eager = false,
    sizes
}) => {
    if (!mediaUrl) {
        return <div className={`bg-gray-200 ${className}`} style={{ width, height }} />;
    }

    const isVideo = VIDEO_EXT_REGEX.test(mediaUrl);

    if (!isVideo) {
        return (
            <ResponsiveAuthImage
                baseName={mediaUrl}
                alt={alt}
                className={className}
                sizes={sizes}
                eager={eager}
                width={width}
                height={height}
            />
        );
    }

    if (layoutContext === 'article') {
        return (
            <EnterpriseVideoPlayer
                src={mediaUrl}
                alt={alt}
                className={className}
                autoPlay={false}
            />
        );
    }

    const optimizedVideoUrl = mediaUrl.replace(/master\.m3u8$/i, '360p.m3u8');

    return (
        <video
            src={optimizedVideoUrl}
            className={`w-full h-full object-cover ${className}`}
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            aria-label={alt}
        >
            <source src={optimizedVideoUrl} type={optimizedVideoUrl.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'} />
        </video>
    );
});

export default SmartMediaRenderer;