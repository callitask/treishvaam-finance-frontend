/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Extracted view container exclusively responsible for mounting the article HTML and capturing text selections.
 *
 * Scope:
 * - Listens for native React `onPointerUp` events to intercept mouse, touch, and stylus highlighting selections.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED (Phase 8.6 - Component Extraction & Highlight Event Fix):
 * • Decoupled from `SinglePostPage.js` to enforce modularity.
 * • Bug Fix: Replaced `addEventListener` closures with native React `onPointerUp`.
 *
 * - EDITED (Phase 8.7 - Native DOM Event Synchronization):
 * • Diagnosis: React's synthetic `onPointerUp` proved too slow; modern browsers collapse the selection range before the React event tree propagates, causing silent highlight failures.
 * • Fix: Reverted to a native `document.addEventListener('mouseup')` coupled with a synchronized `useRef(activeTool)` and `useRef(highlightColor)`. This mathematically guarantees we capture the DOM selection range synchronously at the exact microsecond of the physical mouse lift while completely neutralizing "stale closure" bugs.
 *
 * - EDITED (Phase 8.8 - Cursor SVG Encoding):
 * • Encoded the custom SVG cursor string via encodeURIComponent to resolve rendering failures in modern Chromium browsers that reject unescaped characters in data URIs.
 *
 * - EDITED (Phase 8.9 - Acrobat Highlighting Execution Inversion & Cursor Cleanup):
 * • Inverted execution order: extract `startXPath`, `endXPath`, and text range offsets *before* calling `wrapRangeInMarks()` to prevent TextNode splitting from invalidating the range container.
 * • Invoked `selection.removeAllRanges()` immediately upon mouse release for synchronous Acrobat-style native selection clearing.
 * • Cleaned SVG cursor data URI by stripping legacy `;utf8,` charset token and ensuring full `encodeURIComponent` encoding.
 * • Added delegated `onClick` handler on `.prose` to erase `<mark>` elements when the Eraser tool is active.
 *
 * - DO-NOT-DELETE RULE (ABSOLUTE):
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useAnnotations } from '../../context/AnnotationContext';
import { wrapRangeInMarks, getXPath, restoreHighlightsFromMemory } from './HighlightEngine';

const AnnotatableProse = ({ content }) => {
    const { activeTool, addHighlight, removeHighlight, highlights, highlightColor, fontSizeScale, fontFamily } = useAnnotations();
    const proseRef = useRef(null);
    const [cursor, setCursor] = useState('auto');

    // 1. Ref-Backed State Synchronization
    // Prevents stale closures in native event listeners without requiring constant re-binding
    const activeToolRef = useRef(activeTool);
    const highlightColorRef = useRef(highlightColor);

    useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);
    useEffect(() => { highlightColorRef.current = highlightColor; }, [highlightColor]);

    // 2. Dynamic Highlighting Cursor (Minimalist Marker Tip)
    useEffect(() => {
        if (activeTool === 'highlight') {
            const svg = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" fill="${highlightColor}" fill-opacity="0.45" stroke="${highlightColor}" stroke-width="1.5" /><circle cx="12" cy="12" r="2" fill="${highlightColor}" /></svg>`;
            const encodedSvg = encodeURIComponent(svg);
            setCursor(`url("data:image/svg+xml,${encodedSvg}") 12 12, text`);
        } else if (activeTool === 'pen' || activeTool === 'eraser') {
            setCursor('none'); // Handled by CanvasOverlay for precision hit-detection
        } else {
            setCursor('auto');
        }
    }, [activeTool, highlightColor]);

    // 3. Rehydrate stored highlights
    useEffect(() => {
        if (proseRef.current && highlights.length > 0) {
            restoreHighlightsFromMemory(highlights, proseRef.current, removeHighlight);
        }
    }, [highlights, removeHighlight]);

    // 4. Native DOM Event Listener (Acrobat-Style Pre-Mutation XPath Extraction)
    useEffect(() => {
        const handleNativeMouseUp = () => {
            if (activeToolRef.current !== 'highlight') return;

            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                const range = selection.getRangeAt(0);
                const root = proseRef.current;

                // Ensure selection is actually inside our article body
                if (!root || !root.contains(range.commonAncestorContainer)) return;

                // CRITICAL FIX: Extract XPath coordinates BEFORE modifying the DOM
                const startXPath = getXPath(range.startContainer, root);
                const endXPath = getXPath(range.endContainer, root);
                const startOffset = range.startOffset;
                const endOffset = range.endOffset;
                const selectedText = selection.toString();

                if (!startXPath || !endXPath) return;

                const color = highlightColorRef.current;
                const tempId = window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15);

                // Mutate DOM to apply visual marks
                const id = wrapRangeInMarks(range, color, tempId, removeHighlight);

                if (id) {
                    addHighlight({
                        id,
                        startXPath,
                        startOffset,
                        endXPath,
                        endOffset,
                        color,
                        text: selectedText
                    });
                }

                // Acrobat-style instant selection clearing
                selection.removeAllRanges();
            }
        };

        // Bind natively to guarantee synchronous execution
        document.addEventListener('mouseup', handleNativeMouseUp);
        document.addEventListener('touchend', handleNativeMouseUp);

        return () => {
            document.removeEventListener('mouseup', handleNativeMouseUp);
            document.removeEventListener('touchend', handleNativeMouseUp);
        };
    }, [addHighlight, removeHighlight]);

    // 5. Delegated Eraser Click Handler for Text Highlights
    const handleProseClick = (e) => {
        if (activeToolRef.current === 'eraser' || e.shiftKey || e.altKey) {
            const mark = e.target.closest('mark.treish-highlight');
            if (mark) {
                const id = mark.getAttribute('data-highlight-id') || mark.id;
                if (id) {
                    removeHighlight(id);
                }
            }
        }
    };

    return (
        <div
            ref={proseRef}
            onClick={handleProseClick}
            className={`prose prose-lg dark:prose-invert prose-slate max-w-none font-${fontFamily} leading-relaxed relative z-20`}
            style={{
                fontSize: `${fontSizeScale}%`,
                transition: 'font-size 0.3s ease',
                cursor: cursor
            }}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
};

export default AnnotatableProse;