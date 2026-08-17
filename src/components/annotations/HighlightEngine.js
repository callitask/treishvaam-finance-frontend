/**
 * AI-CONTEXT:
 * Purpose: DOM TreeWalker logic for cross-boundary text highlighting.
 * Scope: Serializes DOM nodes to XPath strings for `localStorage` persistence, and applies `<mark>` tags cleanly across complex HTML elements (e.g. paragraphs to bold tags).
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED (Phase 8 - Enterprise UX): Created HighlightEngine to securely parse and serialize text selections natively without heavy third-party libraries.
 */

export const getXPath = (node, root) => {
    if (node === root) return '';
    if (node.nodeType === Node.TEXT_NODE) {
        const index = Array.from(node.parentNode.childNodes).indexOf(node);
        return `${getXPath(node.parentNode, root)}/text()[${index + 1}]`;
    }
    const index = Array.from(node.parentNode.children).indexOf(node);
    return `${getXPath(node.parentNode, root)}/${node.tagName.toLowerCase()}[${index + 1}]`;
};

export const resolveXPath = (xpath, root) => {
    try {
        const evaluator = new XPathEvaluator();
        const result = evaluator.evaluate(xpath, root, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue;
    } catch (e) {
        return null;
    }
};

export const wrapRangeInMarks = (range, color, id = crypto.randomUUID()) => {
    const walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let currentNode;

    // Handle single-node selections
    if (range.startContainer === range.endContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
        nodes.push(range.startContainer);
    } else {
        // Handle cross-boundary selections
        while ((currentNode = walker.nextNode())) {
            if (range.intersectsNode(currentNode)) {
                nodes.push(currentNode);
            }
        }
    }

    nodes.forEach(node => {
        const isStart = node === range.startContainer;
        const isEnd = node === range.endContainer;

        let startOffset = isStart ? range.startOffset : 0;
        let endOffset = isEnd ? range.endOffset : node.length;

        if (startOffset < endOffset) {
            const splitNode = node.splitText(startOffset);
            splitNode.splitText(endOffset - startOffset);

            const mark = document.createElement('mark');
            mark.style.backgroundColor = color;
            mark.dataset.highlightId = id;
            mark.className = 'treishvaam-highlight group transition-opacity duration-150 hover:opacity-70 cursor-pointer';

            // Drag-to-Erase mechanic (Shift + Click)
            mark.addEventListener('pointerdown', (e) => {
                if (e.shiftKey) {
                    document.dispatchEvent(new CustomEvent('remove-highlight', { detail: { id } }));
                }
            });

            splitNode.parentNode.insertBefore(mark, splitNode);
            mark.appendChild(splitNode);
        }
    });

    return id;
};