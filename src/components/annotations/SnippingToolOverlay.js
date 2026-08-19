/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Enterprise-grade viewport snipping tool portal for precision screenshots.
 *
 * Scope:
 * - Overlays the entire screen, capturing pointer coordinates to generate a precise bounding box.
 * - Submits `(x, y, width, height)` coordinates back to `html2canvas` in the `RadarSidebar`.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED (Phase 8.7 - Precision Snipping Architecture):
 * • Engineered the `SnippingToolOverlay` React Portal. Replaces the blind full-page snapshot logic.
 * • Utilizes strict `setPointerCapture` to freeze background interactions while the user drags the crop rectangle.
 * • Features a CSS `clip-path` inverted mask to simulate a spotlight effect over the selected content.
 *
 * - EDITED (Phase 8.8 - Snipping Tool Truncation Fix):
 * • Removed the destructive 'overflow: hidden' DOM mutation on document.body during capture.
 * • Why: The mutation artificially truncated the body height, causing absolute coordinate mapping in html2canvas to clip out-of-bounds when scrolled.
 *
 * - DO-NOT-DELETE RULE (ABSOLUTE):
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const SnippingToolOverlay = ({ onCapture, onCancel }) => {
    const [startPos, setStartPos] = useState(null);
    const [currentPos, setCurrentPos] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onCancel]);

    const handlePointerDown = (e) => {
        e.target.setPointerCapture(e.pointerId);
        setIsDragging(true);
        const pos = { x: e.clientX, y: e.clientY };
        setStartPos(pos);
        setCurrentPos(pos);
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        setCurrentPos({ x: e.clientX, y: e.clientY });
    };

    const handlePointerUp = (e) => {
        e.target.releasePointerCapture(e.pointerId);
        setIsDragging(false);

        if (!startPos || !currentPos) {
            onCancel();
            return;
        }

        // Calculate absolute bounds
        const x = Math.min(startPos.x, currentPos.x);
        const y = Math.min(startPos.y, currentPos.y);
        const width = Math.abs(currentPos.x - startPos.x);
        const height = Math.abs(currentPos.y - startPos.y);

        // If the user just clicked without dragging, cancel
        if (width < 10 || height < 10) {
            onCancel();
            return;
        }

        // Pass bounds relative to scroll position for html2canvas
        onCapture({
            x: x + window.scrollX,
            y: y + window.scrollY,
            width,
            height
        });
    };

    // Calculate dynamic clip-path for the spotlight effect
    let clipPathStyle = {};
    if (startPos && currentPos) {
        const left = Math.min(startPos.x, currentPos.x);
        const top = Math.min(startPos.y, currentPos.y);
        const right = Math.max(startPos.x, currentPos.x);
        const bottom = Math.max(startPos.y, currentPos.y);

        clipPathStyle = {
            clipPath: `polygon(0% 0%, 0% 100%, ${left}px 100%, ${left}px ${top}px, ${right}px ${top}px, ${right}px ${bottom}px, ${left}px ${bottom}px, ${left}px 100%, 100% 100%, 100% 0%)`
        };
    }

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[100] cursor-crosshair touch-none select-none treish-no-capture"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            {/* The Dark Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 transition-opacity duration-150"
                style={clipPathStyle}
            />

            {/* The Bounding Box Border */}
            {startPos && currentPos && (
                <div
                    className="absolute border border-white bg-sky-500/10 pointer-events-none"
                    style={{
                        left: Math.min(startPos.x, currentPos.x),
                        top: Math.min(startPos.y, currentPos.y),
                        width: Math.abs(currentPos.x - startPos.x),
                        height: Math.abs(currentPos.y - startPos.y)
                    }}
                >
                    {/* Corner Target Reticles */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />
                </div>
            )}

            {/* Instruction Toast */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/90 text-white text-xs font-bold rounded-full shadow-2xl backdrop-blur-md border border-white/10 pointer-events-none animate-pulse">
                Click and drag to capture area. Press Esc to cancel.
            </div>
        </div>,
        document.body
    );
};

export default SnippingToolOverlay;