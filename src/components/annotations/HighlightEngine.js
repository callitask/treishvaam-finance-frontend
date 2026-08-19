/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - DOM TreeWalker and Character-Offset serialization logic for non-destructive article highlighting.
 *
 * Scope:
 * - Serializes arbitrary user text selections across complex HTML structures.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED (Phase 8 - Enterprise UX):
 * • Created HighlightEngine to securely parse and serialize text selections natively.
 *
 * - EDITED (Phase 8.1 - Non-Destructive Multi-Boundary Reconstitution Engine):
 * • Replaced brittle DOM splitting with an offset-indexed TreeWalker architecture.
 *
 * - EDITED (Phase 8.6 - UUID Polyfill Hardening):
 * • Injected a `generateSafeId()` fallback. The native `crypto.randomUUID()` fails silently in non-secure (HTTP) or isolated environments. The fallback ensures highlights always receive a valid ID, preventing selection collapse.
 *
 * - EDITED (Phase 8.11 - Cross-Paragraph TreeWalker Resolution):
 * • Fixed the "Dead Highlighter" bug. When selections cross block boundaries (e.g., multiple `<p>` tags), `commonAncestorContainer` resolves to the parent `div`.
 * • Implemented a robust `NodeFilter.SHOW_TEXT` iteration that explicitly checks `range.intersectsNode(currentNode)` and ignores empty whitespace nodes, ensuring all text segments within the multi-paragraph selection are successfully serialized and wrapped.
 *
 * - EDITED (Phase 8.12 - Focus-Steal Race Condition Fix):
 * • Altered root resolution to support '.' for exact node matches, curing the cross-paragraph TreeWalker abort.
 *
 * - DO-NOT-DELETE RULE (ABSOLUTE):
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */

// Fallback for crypto.randomUUID in non-secure browser contexts
const generateSafeId = () => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const getXPath = (node, root) => {
    if (!node) return '';
    if (node === root) return '.';
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

export const wrapRangeInMarks = (range, color, id = generateSafeId(), onRemove) => {
    if (!range || range.collapsed) return null;

    const commonAncestor = range.commonAncestorContainer;

    // Create a TreeWalker to find all text nodes within the common ancestor
    const walker = document.createTreeWalker(
        commonAncestor.nodeType === Node.TEXT_NODE ? commonAncestor.parentNode : commonAncestor,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const textNodes = [];
    let currentNode;

    if (commonAncestor.nodeType === Node.TEXT_NODE) {
        textNodes.push(commonAncestor);
    } else {
        while ((currentNode = walker.nextNode())) {
            // Robust cross-paragraph intersection check
            if (range.intersectsNode(currentNode)) {
                // Skip empty whitespace nodes between paragraphs
                if (currentNode.textContent.trim().length > 0) {
                    textNodes.push(currentNode);
                }
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

        const textContent = node.textContent;
        const beforeText = textContent.substring(0, startOffset);
        const highlightedText = textContent.substring(startOffset, endOffset);
        const afterText = textContent.substring(endOffset);

        const parent = node.parentNode;
        if (!parent) return;

        const mark = document.createElement('mark');
        mark.style.backgroundColor = color;
        mark.style.color = 'inherit';
        mark.dataset.highlightId = id;
        mark.className = 'treish-highlight rounded px-0.5 py-0.5 transition-all duration-150 hover:brightness-95 cursor-pointer select-text relative group inline';
        mark.textContent = highlightedText;

        // Binds eraser/click handler natively to the element
        mark.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.shiftKey || e.altKey || window.__ACTIVE_TOOL === 'eraser') {
                removeMarksById(id);
                if (onRemove) onRemove(id);
            }
        });

        const fragment = document.createDocumentFragment();
        if (beforeText) fragment.appendChild(document.createTextNode(beforeText));
        fragment.appendChild(mark);
        if (afterText) fragment.appendChild(document.createTextNode(afterText));

        parent.replaceChild(fragment, node);
    });

    return id;
};

export const removeMarksById = (highlightId, root = document) => {
    const marks = root.querySelectorAll(`mark[data-highlight-id="${highlightId}"]`);
    marks.forEach(mark => {
        const parent = mark.parentNode;
        if (parent) {
            const textNode = document.createTextNode(mark.textContent || '');
            parent.replaceChild(textNode, mark);
            parent.normalize();
        }
    });
};

export const restoreHighlightsFromMemory = (highlights, rootElement, onRemove) => {
    if (!highlights || !Array.isArray(highlights) || !rootElement) return;

    const existingMarks = rootElement.querySelectorAll('mark.treish-highlight');
    existingMarks.forEach(mark => {
        const parent = mark.parentNode;
        if (parent) {
            parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
            parent.normalize();
        }
    });

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
            console.warn('[HighlightEngine] Skipped stale highlight reconciliation');
        }
    });
};