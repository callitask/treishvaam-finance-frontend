/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - DOM TreeWalker and Character-Offset serialization logic for non-destructive article highlighting.
 *
 * Scope:
 * - Serializes arbitrary user text selections across complex HTML structures (headings, paragraphs, blockquotes, lists, tables)
 *   into persistent character offsets and relative XPaths.
 * - Reconstitutes saved highlights seamlessly upon initial mount or post-render without causing React hydration mismatches.
 *
 * Security Constraints:
 * - Zero third-party library footprint ($0.00 Free-Tier constraint).
 * - Sanitizes all mark tags to prevent DOM-based XSS vectors.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED (Phase 8 - Enterprise UX):
 * • Created HighlightEngine to securely parse and serialize text selections natively without heavy third-party libraries.
 *
 * - EDITED (Phase 8.1 - Non-Destructive Multi-Boundary Reconstitution Engine):
 * • Replaced brittle DOM splitting with an offset-indexed TreeWalker architecture.
 * • Supports arbitrary multi-boundary highlighting, overlapping selections, dynamic color shifts,
 *   and instant Shift+Click / Hover delete actions without corrupting the parent HTML tree.
 * • Added `restoreHighlightsFromMemory()` to auto-hydrate cached highlights upon article render.
 *
 * - DO-NOT-DELETE RULE (ABSOLUTE):
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */

export const getXPath = (node, root) => {
    if (!node || node === root) return '';
    if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentNode;
        if (!parent) return '';
        const siblings = Array.from(parent.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
        const index = siblings.indexOf(node);
        return `${getXPath(parent, root)}/text()[${index + 1}]`;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        const parent = node.parentNode;
        if (!parent) return '';
        const siblings = Array.from(parent.children).filter(n => n.tagName === node.tagName);
        const index = siblings.indexOf(node);
        return `${getXPath(parent, root)}/${node.tagName.toLowerCase()}[${index + 1}]`;
    }
    return '';
};

export const resolveXPath = (xpath, root) => {
    if (!xpath || !root) return null;
    try {
        const evaluator = new XPathEvaluator();
        const result = evaluator.evaluate(xpath, root, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue;
    } catch (e) {
        return null;
    }
};

/**
 * Calculates absolute text offset of a point within a root container.
 */
export const getAbsoluteTextOffset = (root, targetNode, targetOffset) => {
    let offset = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let currentNode;

    while ((currentNode = walker.nextNode())) {
        if (currentNode === targetNode) {
            return offset + targetOffset;
        }
        offset += currentNode.textContent.length;
    }
    return offset;
};

/**
 * Wraps an active window.Selection Range in styled <mark> tags supporting cross-boundary structures.
 */
export const wrapRangeInMarks = (range, color, id = crypto.randomUUID(), onRemove) => {
    if (!range || range.collapsed) return null;

    const commonAncestor = range.commonAncestorContainer;
    const walker = document.createTreeWalker(
        commonAncestor.nodeType === Node.TEXT_NODE ? commonAncestor.parentNode : commonAncestor,
        NodeFilter.SHOW_TEXT
    );

    const textNodes = [];
    let currentNode;

    if (commonAncestor.nodeType === Node.TEXT_NODE) {
        textNodes.push(commonAncestor);
    } else {
        while ((currentNode = walker.nextNode())) {
            if (range.intersectsNode(currentNode)) {
                textNodes.push(currentNode);
            }
        }
    }

    if (textNodes.length === 0) return null;

    textNodes.forEach(node => {
        const isStart = node === range.startContainer;
        const isEnd = node === range.endContainer;

        const startOffset = isStart ? range.startOffset : 0;
        const endOffset = isEnd ? range.endOffset : node.textContent.length;

        if (startOffset >= endOffset) return;

        // Surgical node slice
        const textContent = node.textContent;
        const beforeText = textContent.substring(0, startOffset);
        const highlightedText = textContent.substring(startOffset, endOffset);
        const afterText = textContent.substring(endOffset);

        const parent = node.parentNode;
        if (!parent) return;

        // Create the high-density highlight mark
        const mark = document.createElement('mark');
        mark.style.backgroundColor = color;
        mark.style.color = 'inherit';
        mark.dataset.highlightId = id;
        mark.className = 'treish-highlight rounded px-0.5 py-0.5 transition-all duration-150 hover:brightness-95 cursor-pointer select-text relative group inline';

        mark.textContent = highlightedText;

        // Click-to-Inspect / Delete listener
        mark.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.shiftKey || e.altKey) {
                removeMarksById(id);
                if (onRemove) onRemove(id);
            }
        });

        // Fragment insertion
        const fragment = document.createDocumentFragment();
        if (beforeText) fragment.appendChild(document.createTextNode(beforeText));
        fragment.appendChild(mark);
        if (afterText) fragment.appendChild(document.createTextNode(afterText));

        parent.replaceChild(fragment, node);
    });

    return id;
};

/**
 * Removes all <mark> tags belonging to a specific highlight ID and rejoins adjacent text nodes.
 */
export const removeMarksById = (highlightId, root = document) => {
    const marks = root.querySelectorAll(`mark[data-highlight-id="${highlightId}"]`);
    marks.forEach(mark => {
        const parent = mark.parentNode;
        if (parent) {
            const textNode = document.createTextNode(mark.textContent || '');
            parent.replaceChild(textNode, mark);
            parent.normalize(); // Merges adjacent text nodes cleanly
        }
    });
};

/**
 * Rehydrates cached highlights from localStorage onto the rendered DOM.
 */
export const restoreHighlightsFromMemory = (highlights, rootElement, onRemove) => {
    if (!highlights || !Array.isArray(highlights) || !rootElement) return;

    // Clear existing marks first to prevent duplicate stacking
    const existingMarks = rootElement.querySelectorAll('mark.treish-highlight');
    existingMarks.forEach(mark => {
        const parent = mark.parentNode;
        if (parent) {
            parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
            parent.normalize();
        }
    });

    // Reapply each stored highlight
    highlights.forEach(hl => {
        try {
            const startNode = resolveXPath(hl.startXPath, rootElement);
            const endNode = resolveXPath(hl.endXPath, rootElement);

            if (startNode && endNode) {
                const range = document.createRange();
                range.setStart(startNode, Math.min(hl.startOffset, startNode.textContent?.length || 0));
                range.setEnd(endNode, Math.min(hl.endOffset, endNode.textContent?.length || 0));

                wrapRangeInMarks(range, hl.color, hl.id, onRemove);
            }
        } catch (err) {
            console.warn('[HighlightEngine] Skipped stale highlight reconciliation:', err);
        }
    });
};