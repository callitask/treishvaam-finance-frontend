/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Enterprise-grade HLS Video Player wrapping hls.js with fast adaptive buffering and resolution controls.
 *
 * Scope:
 * - Replaces native video elements to prevent full raw file downloads and enable custom Multi-PiP pinning.
 *
 * Security Constraints:
 * - Enforces controlsList="nodownload" and disables context menu download triggers.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED:
 * • Built HLS Player with quality selection and multi-dock portal trigger.
 * • Date/Phase: Phase 2 (Enterprise Player)
 *
 * - EDITED:
 * • Added disablePictureInPicture attribute to the video tag to block native OS PiP overriding the React Portal dock.
 * • Date/Phase: Phase 3 (Enterprise Video Layer)
 *
 * - EDITED (Hydration Crash Resolution - Incident 109):
 * • Injected a strict `mounted` state check.
 * • Why: Eradicates React #418/#423 Hydration crashes. HLS manifest parsing and conditional rendering was executing differently on SSR vs CSR. Yielding a static skeleton until client-side mount resolves the DOM parity failure.
 */

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { useFloatingDock } from '../../context/FloatingDockContext';

const EnterpriseVideoPlayer = ({ src, alt = 'Video', className = '', autoPlay = false }) => {
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const [levels, setLevels] = useState([]);
    const [currentLevel, setCurrentLevel] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [progress, setProgress] = useState(0);
    const [mounted, setMounted] = useState(false);

    const dockContext = useFloatingDock();
    const pinVideo = dockContext ? dockContext.pinVideo : null;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const video = videoRef.current;
        if (!video || !src) return;

        if (src.endsWith('.m3u8') && Hls.isSupported()) {
            const hls = new Hls({
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
                capLevelToPlayerSize: true,
                fastSwitchEnabled: true,
            });

            hls.loadSource(src);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                setLevels(data.levels);
                if (autoPlay) video.play().catch(() => { });
            });

            hlsRef.current = hls;

            return () => {
                hls.destroy();
            };
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            if (autoPlay) video.play().catch(() => { });
        } else {
            video.src = src;
        }
    }, [src, autoPlay, mounted]);

    const handleQualityChange = (levelIndex) => {
        setCurrentLevel(levelIndex);
        if (hlsRef.current) {
            hlsRef.current.currentLevel = levelIndex;
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const duration = videoRef.current.duration || 1;
            setProgress((current / duration) * 100);
        }
    };

    const handlePinToDock = () => {
        if (pinVideo) {
            pinVideo({
                id: `video-pip-${Date.now()}`,
                src,
                title: alt
            });
        }
    };

    // Hydration Shield: Return stable skeleton during SSR
    if (!mounted) {
        return (
            <div className={`relative w-full aspect-video bg-slate-950 rounded-xl animate-pulse ${className}`} />
        );
    }

    return (
        <div
            className={`relative group overflow-hidden rounded-xl bg-slate-950 shadow-2xl border border-slate-800 ${className}`}
            onContextMenu={(e) => e.preventDefault()}
        >
            <video
                ref={videoRef}
                className="w-full h-auto max-h-[60vh] object-contain"
                onTimeUpdate={handleTimeUpdate}
                controlsList="nodownload"
                disablePictureInPicture
                playsInline
            />

            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent flex items-center justify-between gap-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button type="button" onClick={togglePlay} className="p-1.5 hover:text-sky-400 font-semibold text-sm">
                    {isPlaying ? 'Pause' : 'Play'}
                </button>

                <div className="flex-1 h-1.5 bg-slate-700/60 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                    if (videoRef.current) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pos = (e.clientX - rect.left) / rect.width;
                        videoRef.current.currentTime = pos * videoRef.current.duration;
                    }
                }}>
                    <div className="h-full bg-sky-500" style={{ width: `${progress}%` }} />
                </div>

                {levels.length > 0 && (
                    <select
                        value={currentLevel}
                        onChange={(e) => handleQualityChange(Number(e.target.value))}
                        className="bg-slate-800 text-xs px-2 py-1 rounded border border-slate-700 focus:outline-none"
                    >
                        <option value={-1}>Auto</option>
                        {levels.map((lvl, index) => (
                            <option key={index} value={index}>
                                {lvl.height ? `${lvl.height}p` : `Lvl ${index}`}
                            </option>
                        ))}
                    </select>
                )}

                {pinVideo && (
                    <button
                        type="button"
                        onClick={handlePinToDock}
                        className="flex items-center gap-1 bg-sky-600 hover:bg-sky-500 text-white text-xs px-2.5 py-1 rounded-md font-medium transition-colors"
                    >
                        📌 Pin (PiP)
                    </button>
                )}
            </div>
        </div>
    );
};

export default EnterpriseVideoPlayer;