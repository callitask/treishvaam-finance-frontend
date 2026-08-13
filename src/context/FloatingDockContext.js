/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Context manager and Portal renderer for client-side Multi-PiP video docking system.
 *
 * Scope:
 * - Tracks pinned video streams and mounts draggable overlays using React Portals natively.
 *
 * Security Constraints:
 * - Free-Tier performance mandate: Uses native onMouseMove handlers rather than heavy third-party drag libraries to protect bundle size.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED:
 * • Implemented Multi-PiP context and native DOM portal.
 * • Date/Phase: Phase 2 (Multi-PiP)
 *
 * - EDITED:
 * • Migrated from mouse events to native HTML5 pointer events (onPointerDown, onPointerMove) with setPointerCapture to enforce true multi-video dragging across mobile and desktop boundaries.
 * • Date/Phase: Phase 3 (Enterprise Video Layer)
 */

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

const FloatingDockContext = createContext();

export const useFloatingDock = () => useContext(FloatingDockContext);

export const FloatingDockProvider = ({ children }) => {
    const [pinnedVideos, setPinnedVideos] = useState([]);

    const pinVideo = (videoData) => {
        setPinnedVideos((prev) => [...prev, videoData]);
    };

    const unpinVideo = (id) => {
        setPinnedVideos((prev) => prev.filter((v) => v.id !== id));
    };

    return (
        <FloatingDockContext.Provider value={{ pinnedVideos, pinVideo, unpinVideo }}>
            {children}
            <FloatingDockContainer />
        </FloatingDockContext.Provider>
    );
};

const DraggableVideoCard = ({ video, onClose }) => {
    const [isMuted, setIsMuted] = useState(true);
    const [position, setPosition] = useState({ x: 50 + Math.random() * 50, y: 100 + Math.random() * 50 });
    const dragRef = useRef({ isDragging: false, startX: 0, startY: 0 });

    const handlePointerDown = (e) => {
        dragRef.current = {
            isDragging: true,
            startX: e.clientX - position.x,
            startY: e.clientY - position.y
        };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!dragRef.current.isDragging) return;
        setPosition({
            x: e.clientX - dragRef.current.startX,
            y: e.clientY - dragRef.current.startY
        });
    };

    const handlePointerUp = (e) => {
        dragRef.current.isDragging = false;
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    return (
        <div
            style={{ transform: `translate(${position.x}px, ${position.y}px)`, width: '320px', position: 'absolute', top: 0, left: 0 }}
            className="z-[9999] shadow-2xl rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex flex-col pointer-events-auto touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            <div
                className="bg-slate-950 px-3 py-1.5 flex items-center justify-between text-xs text-white border-b border-slate-800 cursor-move select-none"
            >
                <span className="truncate max-w-[180px] font-medium text-slate-300">
                    📌 {video.title || 'Pinned Stream'}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-slate-400 hover:text-white"
                    >
                        {isMuted ? '🔇' : '🔊'}
                    </button>
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => onClose(video.id)}
                        className="text-slate-400 hover:text-red-400 font-bold"
                    >
                        ✕
                    </button>
                </div>
            </div>
            <div className="bg-black relative aspect-video" onPointerDown={(e) => e.stopPropagation()}>
                <video src={video.src} autoPlay muted={isMuted} loop playsInline className="w-full h-full object-contain" controls={false} />
            </div>
        </div>
    );
};

const FloatingDockContainer = () => {
    const { pinnedVideos, unpinVideo } = useFloatingDock();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted || pinnedVideos.length === 0) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 pointer-events-none z-[100]">
            {pinnedVideos.map((video) => (
                <DraggableVideoCard key={video.id} video={video} onClose={unpinVideo} />
            ))}
        </div>,
        document.body
    );
};