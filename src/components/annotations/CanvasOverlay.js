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
 * - EDITED (Phase 8.9 - GPU Hydration Loop, Eraser Hit-Detection & Clean SVG Cursors):
 * • Built `redrawCanvas` utilizing `ctx.clearRect` to protect GPU memory from artifacting during Undo/Redo operations.
 * • Implemented `Math.hypot` spatial proximity hit-detection to accurately splice out specific strokes via the Eraser tool.
 * • Cleaned SVG cursor data URI strings by stripping legacy `;utf8,` and applying strict `encodeURIComponent`.
 * 
 * - DO-NOT-DELETE RULE (ABSOLUTE):
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
import React, { useRef, useEffect, useState } from 'react';
import { useAnnotations } from '../../context/AnnotationContext';

const ERASE_RADIUS = 10; // Precision target radius for hit detection

const CanvasOverlay = () => {
    const {
        activeTool,
        penColor, penWidth, penStyle,
        penStrokes, saveStateToHistory, highlights
    } = useAnnotations();

    const canvasRef = useRef(null);
    const [cursorSvg, setCursorSvg] = useState('crosshair');

    // Mutable refs for 60fps physics rendering without React re-renders
    const isDrawing = useRef(false);
    const pointsRef = useRef([]);

    const isPenActive = activeTool === 'pen';
    const isEraserActive = activeTool === 'eraser';
    const canInteract = isPenActive || isEraserActive;

    // Dynamic High-Fidelity Minimalist SVG Cursor Generator
    useEffect(() => {
        if (!canInteract) return;

        let svg = '';
        if (isEraserActive) {
            svg = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.25)" stroke="rgba(0,0,0,0.5)" stroke-width="1.5" /><circle cx="12" cy="12" r="2" fill="rgba(0,0,0,0.7)"/></svg>`;
        } else {
            // Refined, ultra-precise anti-aliased nib for pen
            svg = `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="3.5" fill="${penColor}" stroke="rgba(255,255,255,0.95)" stroke-width="1.5" /></svg>`;
        }

        const encodedSvg = encodeURIComponent(svg);
        const offset = isEraserActive ? 12 : 10;
        setCursorSvg(`url("data:image/svg+xml,${encodedSvg}") ${offset} ${offset}, crosshair`);
    }, [canInteract, isEraserActive, penColor]);

    // Redraw Canvas Engine (Handles Undo/Redo & Resizes)
    const redrawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // 1. Absolute GPU purge
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 2. Iterate and replay serialized strokes
        penStrokes.forEach(stroke => {
            const pts = stroke.points;
            if (!pts || pts.length < 3) return;

            for (let i = 2; i < pts.length; i++) {
                const lastTwo = pts[i - 1];
                const lastOne = pts[i];

                const midPoint = {
                    x: lastTwo.x + (lastOne.x - lastTwo.x) / 2,
                    y: lastTwo.y + (lastOne.y - lastTwo.y) / 2
                };

                const prevMidPoint = {
                    x: pts[i - 2].x + (lastTwo.x - pts[i - 2].x) / 2,
                    y: pts[i - 2].y + (lastTwo.y - pts[i - 2].y) / 2
                };

                ctx.beginPath();
                ctx.moveTo(prevMidPoint.x, prevMidPoint.y);

                applyBrushPhysics(ctx, lastOne.pressure, lastOne.velocity, stroke.width, stroke.color, stroke.style);

                ctx.quadraticCurveTo(lastTwo.x, lastTwo.y, midPoint.x, midPoint.y);
                ctx.stroke();
            }
        });
    };

    // Trigger Hydration on state changes
    useEffect(() => {
        redrawCanvas();
    }, [penStrokes]);

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
                redrawCanvas(); // Redraw ink after resolution scaling
            }
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [penStrokes]);

    const applyBrushPhysics = (ctx, pressure, velocity, targetWidth, targetColor, targetStyle) => {
        ctx.strokeStyle = targetColor;

        const clampedVelocity = Math.min(Math.max(velocity, 0.1), 5.0);
        const velocityFactor = 1.5 / clampedVelocity;
        const dynamicWidth = targetWidth * pressure * velocityFactor;
        const finalWidth = Math.min(Math.max(dynamicWidth, targetWidth * 0.2), targetWidth * 2.5);

        switch (targetStyle) {
            case 'brush':
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.lineWidth = finalWidth * 1.5;
                ctx.shadowBlur = targetWidth * 1.5;
                ctx.shadowColor = targetColor;
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
        const rect = canvasRef.current.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;

        if (isEraserActive) {
            // Hit-Detection Math: Find stroke intersecting with pointer coordinates
            const strokeIndex = penStrokes.findIndex(stroke =>
                stroke.points.some(pt => Math.hypot(pt.x - px, pt.y - py) <= ERASE_RADIUS)
            );

            if (strokeIndex !== -1) {
                const updatedStrokes = [...penStrokes];
                updatedStrokes.splice(strokeIndex, 1);
                // Save to history engine
                saveStateToHistory(highlights, updatedStrokes);
            }
            return;
        }

        if (!isPenActive) return;
        isDrawing.current = true;

        pointsRef.current = [{
            x: px,
            y: py,
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

        const lastPoint = pts[pts.length - 1];
        const dt = Math.max(now - lastPoint.time, 1);
        const dx = newPoint.x - lastPoint.x;
        const dy = newPoint.y - lastPoint.y;
        const velocity = Math.hypot(dx, dy) / dt;

        newPoint.velocity = velocity;
        pts.push(newPoint);

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

            applyBrushPhysics(ctx, lastOne.pressure, lastOne.velocity, penWidth, penColor, penStyle);

            ctx.quadraticCurveTo(lastTwo.x, lastTwo.y, midPoint.x, midPoint.y);
            ctx.stroke();
        }
    };

    const handlePointerUp = () => {
        if (isEraserActive) return;

        if (isDrawing.current && pointsRef.current.length >= 3) {
            const newStroke = {
                id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
                points: [...pointsRef.current],
                color: penColor,
                width: penWidth,
                style: penStyle
            };
            // Package into history engine
            saveStateToHistory(highlights, [...penStrokes, newStroke]);
        }

        isDrawing.current = false;
        pointsRef.current = [];
    };

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
            style={{
                zIndex: 30,
                cursor: canInteract ? cursorSvg : 'auto',
                pointerEvents: canInteract ? 'auto' : 'none'
            }}
            onPointerDown={canInteract ? handlePointerDown : undefined}
            onPointerMove={canInteract ? handlePointerMove : undefined}
            onPointerUp={canInteract ? handlePointerUp : undefined}
            onPointerLeave={canInteract ? handlePointerUp : undefined}
            onPointerCancel={canInteract ? handlePointerUp : undefined}
        />
    );
};

export default CanvasOverlay;