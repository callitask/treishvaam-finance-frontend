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
 *
 * - EDITED (Phase 5 - Cover Video Normalization & Absolute Path Resolution):
 * • Added defensive path normalization to ensure all video URLs resolve as absolute paths (`/api/v1/uploads/...`) instead of route-relative URLs.
 * • Added support for raw MP4s and HLS manifests in cover contexts, sanitizing invalid `[object Object]` strings.
 *
 * - EDITED (Phase 8 - Media UX Animations):
 * • Implemented React state-driven CSS opacity transitions (`isLoaded`) and blurred edge masking (`[mask-image:...]`) triggered by `onLoadedData` to provide seamless, enterprise-grade auto-play cover fades without violating Virtual DOM parity.
 *
 * - EDITED (Phase 8.1 - React DOM Mutation Fix):
 * • Eliminated vanilla JS classList manipulations. Applied strict React useState boolean toggles to manage opacity fade-in animations on video load, protecting SSR hydration parity.
 *
 * - EDITED (Phase 12.1 - HLS RegExp, Media Path Normalization & 360p Fallback):
 * • Corrected double-escaped regex to single-escaped `/(master|1080p|720p|480p)\.m3u8$/i`.
 * • Normalized `/uploads/...` paths to `/api/v1/uploads/...`.
 * • Removed static child `<source>` from `<video>` element to prevent MediaSource attachment collision with Hls.js in Chromium.
 * • Implemented automated fallback to `master.m3u8` with `hls.autoLevelCapping = 0` when `360p.m3u8` returns fatal network/manifest error.
 * • Added 800ms safety timeout and metadata listeners to prevent permanent `opacity-0` render locks.
 *
 * - DO-NOT-DELETE RULE (ABSOLUTE):
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions. 
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */

import React, { memo, useEffect, useState, useRef } from 'react';
import Hls from 'hls.js';
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
    const [isLoaded, setIsLoaded] = useState(false);

    // Hydration Shield: Delay complex rendering until client mounts
    useEffect(() => {
        setMounted(true);
    }, []);

    const videoRefLocal = videoRef;

    useEffect(() => {
        if (!mounted || layoutContext === 'article') return;
        let normalizedUrl = mediaUrl && (mediaUrl.startsWith('http') || mediaUrl.startsWith('/')) ? mediaUrl : (mediaUrl ? `/${mediaUrl}` : '');
        if (normalizedUrl.startsWith('/uploads/')) {
            normalizedUrl = `/api/v1${normalizedUrl}`;
        } else if (normalizedUrl.startsWith('uploads/')) {
            normalizedUrl = `/api/v1/${normalizedUrl}`;
        }

        const isVideo = !!normalizedUrl && (VIDEO_EXT_REGEX.test(normalizedUrl) || normalizedUrl.includes('/raw/') || normalizedUrl.includes('/hls/'));
        if (!isVideo) return;
        const optimizedVideoUrl = normalizedUrl.endsWith('.m3u8')
            ? normalizedUrl.replace(/(master|1080p|720p|480p)\.m3u8$/i, '360p.m3u8')
            : normalizedUrl;

        const videoEl = videoRefLocal.current;
        if (!videoEl) return;

        let hls = null;
        const safetyTimer = setTimeout(() => {
            setIsLoaded(true);
        }, 800);

        const startPlayback = (srcUrl, isFallback = false) => {
            if (srcUrl.endsWith('.m3u8') && Hls.isSupported()) {
                hls = new Hls({ enableWorker: true, lowLatencyMode: false });
                if (isFallback) {
                    hls.autoLevelCapping = 0;
                }
                hls.loadSource(srcUrl);
                hls.attachMedia(videoEl);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    setIsLoaded(true);
                    videoEl.play().catch(() => {});
                });
                hls.on(Hls.Events.ERROR, (_event, data) => {
                    if (data.fatal && srcUrl !== normalizedUrl) {
                        if (hls) hls.destroy();
                        startPlayback(normalizedUrl, true);
                    }
                });
            } else {
                videoEl.src = srcUrl;
                videoEl.play().catch(() => {});
                setIsLoaded(true);
            }
        };

        startPlayback(optimizedVideoUrl);
        return () => {
            clearTimeout(safetyTimer);
            if (hls) hls.destroy();
        };
    }, [mounted, mediaUrl, layoutContext]);

    if (!mounted || !mediaUrl || typeof mediaUrl !== 'string' || mediaUrl.includes('[object Object]')) {
        return <div className={`bg-slate-200 dark:bg-slate-800 animate-pulse ${className}`} style={{ width, height }} />;
    }

    // Path normalization: Ensure absolute URL structure
    let normalizedUrl = mediaUrl.startsWith('http') || mediaUrl.startsWith('/')
        ? mediaUrl
        : `/${mediaUrl}`;
    if (normalizedUrl.startsWith('/uploads/')) {
        normalizedUrl = `/api/v1${normalizedUrl}`;
    }

    const isVideo = VIDEO_EXT_REGEX.test(normalizedUrl) || normalizedUrl.includes('/raw/') || normalizedUrl.includes('/hls/');

    if (!isVideo) {
        return (
            <ResponsiveAuthImage
                baseName={normalizedUrl}
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
                src={normalizedUrl}
                alt={alt}
                className={className}
                autoPlay={false}
            />
        );
    }

    return (
        <video
            ref={videoRef}
            className={`w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
            onLoadedData={() => setIsLoaded(true)}
            onLoadedMetadata={() => setIsLoaded(true)}
            onCanPlay={() => setIsLoaded(true)}
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            aria-label={alt}
        />
    );
});

export default SmartMediaRenderer;