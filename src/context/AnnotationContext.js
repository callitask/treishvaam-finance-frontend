/**
 * AI-CONTEXT:
 * Purpose: Global state management for the Enterprise UX Annotation Engine.
 * Scope: Manages highlights, pen overlay active states, calculator visibility, and localStorage persistence.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED (Phase 8 - Enterprise UX): Created AnnotationContext to manage the cross-boundary highlighting and stylus canvas layer for `SinglePostPage.js`.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

const AnnotationContext = createContext();

export const AnnotationProvider = ({ children, articleId }) => {
    const [highlights, setHighlights] = useState([]);
    const [activeTool, setActiveTool] = useState('cursor'); // 'cursor', 'highlight', 'pen'
    const [currentColor, setCurrentColor] = useState('#fbbf24');
    const [currentWidth, setCurrentWidth] = useState(2);
    const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);

    useEffect(() => {
        if (!articleId) return;
        const saved = localStorage.getItem(`annotations_${articleId}`);
        if (saved) {
            try {
                setHighlights(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse annotations");
            }
        }
    }, [articleId]);

    const saveHighlights = (newHighlights) => {
        setHighlights(newHighlights);
        if (articleId) {
            localStorage.setItem(`annotations_${articleId}`, JSON.stringify(newHighlights));
        }
    };

    const addHighlight = (highlight) => {
        saveHighlights([...highlights, highlight]);
    };

    const removeHighlight = (id) => {
        saveHighlights(highlights.filter(h => h.id !== id));
    };

    return (
        <AnnotationContext.Provider value={{
            highlights, addHighlight, removeHighlight,
            activeTool, setActiveTool,
            currentColor, setCurrentColor,
            currentWidth, setCurrentWidth,
            isCalculatorVisible, setIsCalculatorVisible
        }}>
            {children}
        </AnnotationContext.Provider>
    );
};

export const useAnnotations = () => useContext(AnnotationContext);