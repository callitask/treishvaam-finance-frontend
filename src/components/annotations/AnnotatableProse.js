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
 * • Bug Fix: Replaced `addEventListener` closures with native React `onPointerUp`. Previous closures captured stale `activeTool` states or were unmounted during Next.js hydration, preventing the highlighter from activating. React's Synthetic Events guarantee absolute state synchronicity.
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

    // Generate Dynamic SVG Cursors for Highlighting
    useEffect(() => {
        if (activeTool === 'highlight') {
            const encodedColor = encodeURIComponent(highlightColor);
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${encodedColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
            setCursor(`url("data:image/svg+xml;utf8,${svg}") 12 12, text`);
        } else if (activeTool === 'pen') {
            setCursor('none'); // Handled natively by CanvasOverlay
        } else {
            setCursor('auto');
        }
    }, [activeTool, highlightColor]);

    // Initial Hydration of Highlights from State
    useEffect(() => {
        if (proseRef.current && highlights.length > 0) {
            restoreHighlightsFromMemory(highlights, proseRef.current, removeHighlight);
        }
    }, [highlights, removeHighlight]);

    // React Native Pointer Event: Guarantees no stale closures!
    const handlePointerUp = (e) => {
        if (activeTool !== 'highlight') return;

        const selection = window.getSelection();
        if (selection.rangeCount > 0 && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);

            // Generate fallback UUID if browser crypto is disabled
            const tempId = window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
            const id = wrapRangeInMarks(range, highlightColor, tempId, removeHighlight);

            const root = proseRef.current;
            const startXPath = getXPath(range.startContainer, root);
            const endXPath = getXPath(range.endContainer, root);

            if (id && startXPath && endXPath) {
                addHighlight({
                    id,
                    startXPath,
                    startOffset: range.startOffset,
                    endXPath,
                    endOffset: range.endOffset,
                    color: highlightColor,
                    text: selection.toString()
                });
            }
            selection.removeAllRanges();
        }
    };

    return (
        <div
            ref={proseRef}
            onPointerUp={handlePointerUp}
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