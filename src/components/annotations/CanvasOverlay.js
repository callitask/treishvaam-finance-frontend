/**
 * AI-CONTEXT:
 * Purpose: Absolutely positioned Stylus/Pen layer.
 * Scope: Conditionally intercepts pointer events over the `.prose` container for freehand drawing with Apple Pencil / S-Pen pressure tracking.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED (Phase 8 - Enterprise UX): Created CanvasOverlay to support native Stylus annotations overlaying financial articles.
 */
import React, { useRef, useEffect, useState } from 'react';
import { useAnnotations } from '../../context/AnnotationContext';

const CanvasOverlay = () => {
    const { activeTool, currentColor, currentWidth } = useAnnotations();
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const isPenActive = activeTool === 'pen';

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
            }
        };
        // Initial sizing + observer
        resize();
        window.addEventListener('resize', resize);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        return () => window.removeEventListener('resize', resize);
    }, []);

    const handlePointerDown = (e) => {
        if (!isPenActive) return;
        setIsDrawing(true);
        const ctx = canvasRef.current.getContext('2d');
        const rect = canvasRef.current.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);

        // Dynamic pressure sensitivity (Apple Pencil / S-Pen)
        const pressure = e.pointerType === 'pen' ? e.pressure : 0.5;
        ctx.lineWidth = currentWidth * (pressure * 2);
        ctx.strokeStyle = currentColor;
    };

    const handlePointerMove = (e) => {
        if (!isDrawing || !isPenActive) return;
        const ctx = canvasRef.current.getContext('2d');
        const rect = canvasRef.current.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    };

    return (
        <canvas
            ref={canvasRef}
            className={`absolute top-0 left-0 w-full h-full ${isPenActive ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'}`}
            style={{ zIndex: 10 }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => setIsDrawing(false)}
            onPointerLeave={() => setIsDrawing(false)}
        />
    );
};
export default CanvasOverlay;