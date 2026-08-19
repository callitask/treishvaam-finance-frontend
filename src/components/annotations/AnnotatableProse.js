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

    // 2. Dynamic Highlighting Cursor
    useEffect(() => {
        if (activeTool === 'highlight') {
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${highlightColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
            const encodedSvg = encodeURIComponent(svg);
            setCursor(`url("data:image/svg+xml;utf8,${encodedSvg}") 12 12, text`);
        } else if (activeTool === 'pen') {
            setCursor('none'); // Handled by CanvasOverlay
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

    // 4. Native DOM Event Listener (Solves the React Synthetic Event Race Condition)
    useEffect(() => {
        const handleNativeMouseUp = () => {
            if (activeToolRef.current !== 'highlight') return;

            const selection = window.getSelection();
            if (selection.rangeCount > 0 && !selection.isCollapsed) {
                const range = selection.getRangeAt(0);
                const root = proseRef.current;

                // Ensure selection is actually inside our article body
                if (!root || !root.contains(range.commonAncestorContainer)) return;

                const color = highlightColorRef.current;
                const tempId = window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15);

                const id = wrapRangeInMarks(range, color, tempId, removeHighlight);

                const startXPath = getXPath(range.startContainer, root);
                const endXPath = getXPath(range.endContainer, root);

                if (id && startXPath && endXPath) {
                    addHighlight({
                        id,
                        startXPath,
                        startOffset: range.startOffset,
                        endXPath,
                        endOffset: range.endOffset,
                        color: color,
                        text: selection.toString()
                    });
                }
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

    return (
        <div
            ref={proseRef}
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