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
 *
 * - EDITED:
 * • Intercepts .m3u8 streams and locks grid cover videos strictly to 360p via native fallback logic, rendering a muted, looping, auto-playing video element with disabled PiP to preserve UI integrity.
 * • Date/Phase: Phase 3 (Enterprise Video Layer)
 *
 * - EDITED (Hydration Crash Resolution - Incident 109):
 * • Injected a `mounted` state shield using `useState` and `useEffect`.
 * • Why: Resolved severe React Minified Errors #418 and #423. Dynamic media resolution caused the Server-Side Rendered (SSR) HTML to fundamentally mismatch the Client-Side Rendered (CSR) HTML. Returning a stable placeholder until hydration completes guarantees render parity and stops the client-side fallback crashes.
 */

import React, { memo, useEffect, useState, useRef } from 'react';
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
    const videoRef = useRef(null);
    const [mounted, setMounted] = useState(false);

    // Hydration Shield: Delay complex rendering until client mounts
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !mediaUrl) {
        return <div className={`bg-gray-200 animate-pulse ${className}`} style={{ width, height }} />;
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

    // Strict 360p URL locking for Free-Tier Bandwidth Optimization
    const optimizedVideoUrl = mediaUrl.endsWith('.m3u8')
        ? mediaUrl.replace(/(master|1080p|720p|480p)\.m3u8$/i, '360p.m3u8')
        : mediaUrl;

    return (
        <video
            ref={videoRef}
            src={optimizedVideoUrl}
            className={`w-full h-full object-cover ${className}`}
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            aria-label={alt}
        >
            <source src={optimizedVideoUrl} type={optimizedVideoUrl.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'} />
        </video>
    );
});

export default SmartMediaRenderer;