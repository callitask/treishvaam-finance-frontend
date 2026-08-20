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
 * - EDITED (Phase 8.9 - Eraser Engine Integration):
 * • Implemented a delegated `onClick` event listener on the `.prose` container to intercept clicks on `<mark>` elements when the Eraser tool is active.
 * • Delegated the 'none' cursor state to the Eraser tool to allow `CanvasOverlay` to control the crosshair precision visually.
 *
 * - EDITED (Phase 8.11 - Visual Cursors & Acrobat DOM Highlighting):
 * • Fixed the `$` cursor error by explicitly applying `encodeURIComponent` to the raw SVG string.
 * • Reordered `wrapRangeInMarks` execution. We now strictly evaluate `getXPath` *before* wrapping nodes to prevent DOM splitting from invalidating the native selection range container.
 * • Added `selection.removeAllRanges()` immediately upon completion for true Adobe Acrobat-style seamless visual clearing.
 *
 * - EDITED (Phase 8.12 - Selection Caching Engine):
 * • Implemented native 'selectionchange' listener to passively cache the DOM Range object.
 * • Why: Clicking the Liquid Glass toolbar in WebKit/Safari natively collapses the text selection before React can process it. Caching the range deeply decouples the selection phase from the tool activation phase.
 *
 * - EDITED (Phase 8.13 - Re-Render DOM Wipe Loop Fix):
 * • Bound the highlight hydration `useEffect` strictly to `highlights.length` rather than the array reference or context functions.
 * • Why: Contextual re-renders (like scrolling) were mutating the dependency array, causing `restoreHighlightsFromMemory` to fire continuously. This executed `parent.normalize()` repeatedly, destroying the original TextNode splits, permanently corrupting the XPath resolution, and causing applied highlights to instantly vanish.
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
    const cachedRangeRef = useRef(null);

    useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);
    useEffect(() => { highlightColorRef.current = highlightColor; }, [highlightColor]);

    // 2. Dynamic Highlighting Cursor
    useEffect(() => {
        if (activeTool === 'highlight') {
            const svg = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" fill="${highlightColor}" fill-opacity="0.4" stroke="${highlightColor}" stroke-width="1.5" /><circle cx="12" cy="12" r="2" fill="${highlightColor}"/></svg>`;
            const encodedSvg = encodeURIComponent(svg);
            setCursor(`url("data:image/svg+xml,${encodedSvg}") 12 12, text !important`);
        } else if (activeTool === 'pen' || activeTool === 'eraser') {
            setCursor('none'); // Handled by CanvasOverlay for precision hit-detection
        } else {
            setCursor('auto');
        }
    }, [activeTool, highlightColor]);

    // 3. Rehydrate stored highlights (Optimized to prevent DOM wipe loops)
    const highlightsLength = highlights.length;
    
    useEffect(() => {
        if (proseRef.current && highlightsLength > 0) {
            restoreHighlightsFromMemory(highlights, proseRef.current, removeHighlight);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlightsLength]); // strictly bounded to length changes to prevent DOM wipe loops

    // 4. Zero-Trust Range Caching (Solves WebKit/Safari Toolbar Focus-Steal Race Condition)
    useEffect(() => {
        const handleSelectionChange = () => {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                const range = selection.getRangeAt(0);
                if (proseRef.current && proseRef.current.contains(range.commonAncestorContainer)) {
                    cachedRangeRef.current = range.cloneRange();
                }
            }
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, []);

    // 4.5. Reactive Highlighting (Processes cached range when user selects text FIRST, then clicks the tool)
    useEffect(() => {
        if (activeTool === 'highlight' && cachedRangeRef.current) {
            const range = cachedRangeRef.current;
            const root = proseRef.current;

            if (!root || !root.contains(range.commonAncestorContainer)) return;

            const startXPath = getXPath(range.startContainer, root);
            const endXPath = getXPath(range.endContainer, root);
            const startOffset = range.startOffset;
            const endOffset = range.endOffset;
            const textStr = range.toString();

            if (!startXPath || !endXPath) return;

            const tempId = window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
            const id = wrapRangeInMarks(range, highlightColor, tempId, removeHighlight);

            if (id) {
                addHighlight({
                    id, startXPath, startOffset, endXPath, endOffset, color: highlightColor, text: textStr
                });
            }
            
            cachedRangeRef.current = null;
            window.getSelection().removeAllRanges();
        }
    }, [activeTool, highlightColor, addHighlight, removeHighlight]);

    // 5. Native DOM Event Listener (Handles highlighting when tool is ALREADY active)
    useEffect(() => {
        const handleNativeMouseUp = () => {
            if (activeToolRef.current !== 'highlight') return;

            const selection = window.getSelection();
            if (selection.rangeCount > 0 && !selection.isCollapsed) {
                const range = selection.getRangeAt(0);
                const root = proseRef.current;

                if (!root || !root.contains(range.commonAncestorContainer)) return;

                const startXPath = getXPath(range.startContainer, root);
                const endXPath = getXPath(range.endContainer, root);
                const startOffset = range.startOffset;
                const endOffset = range.endOffset;
                const textStr = selection.toString();

                if (!startXPath || !endXPath) return;

                const color = highlightColorRef.current;
                const tempId = window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15);

                const id = wrapRangeInMarks(range, color, tempId, removeHighlight);

                if (id) {
                    addHighlight({
                        id,
                        startXPath,
                        startOffset,
                        endXPath,
                        endOffset,
                        color,
                        text: textStr
                    });
                }

                cachedRangeRef.current = null;
                selection.removeAllRanges();
            }
        };

        document.addEventListener('mouseup', handleNativeMouseUp);
        document.addEventListener('touchend', handleNativeMouseUp);

        return () => {
            document.removeEventListener('mouseup', handleNativeMouseUp);
            document.removeEventListener('touchend', handleNativeMouseUp);
        };
    }, [addHighlight, removeHighlight]);

    // 6. Delegated Eraser Click Handler
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