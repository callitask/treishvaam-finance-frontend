/**
 * AI-CONTEXT:
 * Purpose: Absolutely positioned Stylus/Pen layer.
 * Scope: Conditionally intercepts pointer events over the `.prose` container for freehand drawing.
 * 
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED (Phase 8 - Enterprise UX): Created CanvasOverlay to support native Stylus annotations overlaying financial articles.
 * 
 * - EDITED (Phase 8.5 - Z-Index Layering Fix): Elevated z-index from 10 to 30 to bypass `.prose` z-index blockers.
 * 
 * - EDITED (Phase 8.6 - Samsung-Level Smoothing & Dynamic Cursors):
 * • Engineered a high-performance `useRef` buffering system computing mathematically perfect Quadratic Bezier curves (`quadraticCurveTo`).
 * 
 * - EDITED (Phase 8.7 - Velocity & Pressure Physics Engine):
 * • Replaced static line weights with a dynamic Momentum Engine.
 * • Captures high-resolution timestamps via `performance.now()`. Calculates velocity (`Math.hypot(dx, dy) / dt`).
 * • Inversely maps velocity to stroke thickness (fast swipe = thin tail; slow drag = thick ink pool), multiplying by hardware `e.pressure` for hyper-realistic calligraphy.
 *
 * - EDITED (Phase 8.8 - Cursor SVG Encoding & Physics Continuity):
 * • Encoded SVG data URIs via encodeURIComponent to resolve Chromium's rejection of unescaped brackets.
 * • Detached React pointer listeners and enforced 'pointerEvents: none' when inactive to prevent synthetic event swallowing.
 * • Corrected the Quadratic Bezier anchor point to 'prevMidPoint' for continuous, fluid strokes without overlapping artifacts.
 * 
 * - DO-NOT-DELETE RULE (ABSOLUTE):
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
import React, { useRef, useEffect, useState } from 'react';
import { useAnnotations } from '../../context/AnnotationContext';

const CanvasOverlay = () => {
    const { activeTool, penColor, penWidth, penStyle } = useAnnotations();
    const canvasRef = useRef(null);
    const [cursorSvg, setCursorSvg] = useState('crosshair');

    // Mutable refs for 60fps physics rendering without React re-renders
    const isDrawing = useRef(false);
    const pointsRef = useRef([]);

    const isPenActive = activeTool === 'pen';

    // Dynamic High-Fidelity SVG Cursor Generator
    useEffect(() => {
        if (!isPenActive) return;
        const radius = Math.max(penWidth / 2, 2);
        const svgSize = radius * 2 + 4;

        let svg = '';
        if (penStyle === 'fountain') {
            svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}"><rect x="2" y="2" width="${radius * 2}" height="${radius * 2}" fill="${penColor}" stroke="white" stroke-width="1.5" transform="rotate(45 ${svgSize / 2} ${svgSize / 2})"/></svg>`;
        } else {
            svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}"><circle cx="${svgSize / 2}" cy="${svgSize / 2}" r="${radius}" fill="${penColor}" stroke="white" stroke-width="1.5"/></svg>`;
        }

        const encodedSvg = encodeURIComponent(svg);
        setCursorSvg(`url('data:image/svg+xml;utf8,${encodedSvg}') ${svgSize / 2} ${svgSize / 2}, auto`);
    }, [isPenActive, penColor, penWidth, penStyle]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resize = () => {
            if (canvas.parentElement) {
                const rect = canvas.parentElement.getBoundingClientRect();
                canvas.width = rect.width * window.devicePixelRatio;
                canvas.height = rect.height * window.devicePixelRatio;
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${rect.height}px`;
                canvas.getContext('2d').scale(window.devicePixelRatio, window.devicePixelRatio);
            }
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    const applyBrushPhysics = (ctx, pressure, velocity) => {
        ctx.strokeStyle = penColor;

        // Clamp velocity to a reasonable range to prevent infinite multipliers
        const clampedVelocity = Math.min(Math.max(velocity, 0.1), 5.0);

        // Inverse Velocity Mapping: Fast = Thin, Slow = Thick.
        const velocityFactor = 1.5 / clampedVelocity;

        // Base Dynamic Width = Target Width * Hardware Pressure * Velocity Modifier
        const dynamicWidth = penWidth * pressure * velocityFactor;

        // Prevent strokes from getting too thin or too massive
        const finalWidth = Math.min(Math.max(dynamicWidth, penWidth * 0.2), penWidth * 2.5);

        switch (penStyle) {
            case 'brush':
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.lineWidth = finalWidth * 1.5;
                ctx.shadowBlur = penWidth * 1.5;
                ctx.shadowColor = penColor;
                ctx.globalAlpha = 0.7;
                break;
            case 'fountain':
                ctx.lineCap = 'square';
                ctx.lineJoin = 'miter';
                ctx.lineWidth = finalWidth;
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 0.95;
                break;
            case 'pen':
            default:
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.lineWidth = finalWidth;
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1.0;
                break;
        }
    };

    const handlePointerDown = (e) => {
        if (!isPenActive) return;
        isDrawing.current = true;
        const rect = canvasRef.current.getBoundingClientRect();

        pointsRef.current = [{
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            pressure: e.pointerType === 'pen' ? e.pressure : 0.5,
            time: performance.now()
        }];
    };

    const handlePointerMove = (e) => {
        if (!isDrawing.current || !isPenActive) return;

        const ctx = canvasRef.current.getContext('2d');
        const rect = canvasRef.current.getBoundingClientRect();
        const pts = pointsRef.current;
        const now = performance.now();

        const newPoint = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            pressure: e.pointerType === 'pen' ? e.pressure : 0.5,
            time: now
        };

        // Calculate physics relative to the last point
        const lastPoint = pts[pts.length - 1];
        const dt = Math.max(now - lastPoint.time, 1); // ms passed (avoid div zero)
        const dx = newPoint.x - lastPoint.x;
        const dy = newPoint.y - lastPoint.y;
        const velocity = Math.hypot(dx, dy) / dt; // pixels per ms

        newPoint.velocity = velocity;
        pts.push(newPoint);

        // Samsung-Grade Quadratic Bezier Smoothing (Requires 3 points)
        if (pts.length >= 3) {
            const lastTwo = pts[pts.length - 2];
            const lastOne = pts[pts.length - 1];

            const midPoint = {
                x: lastTwo.x + (lastOne.x - lastTwo.x) / 2,
                y: lastTwo.y + (lastOne.y - lastTwo.y) / 2
            };

            const prevMidPoint = {
                x: pts[pts.length - 3].x + (lastTwo.x - pts[pts.length - 3].x) / 2,
                y: pts[pts.length - 3].y + (lastTwo.y - pts[pts.length - 3].y) / 2
            };

            ctx.beginPath();
            ctx.moveTo(prevMidPoint.x, prevMidPoint.y);

            applyBrushPhysics(ctx, lastOne.pressure, lastOne.velocity);

            ctx.quadraticCurveTo(lastTwo.x, lastTwo.y, midPoint.x, midPoint.y);
            ctx.stroke();
        }
    };

    const handlePointerUp = () => {
        isDrawing.current = false;
        pointsRef.current = [];
    };

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
            style={{
                zIndex: 30,
                cursor: isPenActive ? cursorSvg : 'auto',
                pointerEvents: isPenActive ? 'auto' : 'none'
            }}
            onPointerDown={isPenActive ? handlePointerDown : undefined}
            onPointerMove={isPenActive ? handlePointerMove : undefined}
            onPointerUp={isPenActive ? handlePointerUp : undefined}
            onPointerLeave={isPenActive ? handlePointerUp : undefined}
            onPointerCancel={isPenActive ? handlePointerUp : undefined}
        />
    );
};

export default CanvasOverlay;