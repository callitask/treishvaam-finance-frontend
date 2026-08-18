/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Global state management for the Enterprise UX Annotation Engine.
 *
 * Scope:
 * - Manages highlights, pen overlay active states, calculator visibility, typography scaling,
 *   audio TTS reading state, margin notes, and browser localStorage auto-persistence.
 *
 * Critical Dependencies:
 * - Consumed by RadarSidebar.js, CanvasOverlay.js, FloatingCalculator.js, and SinglePostPage.js.
 *
 * Security Constraints:
 * - All persisted state stored client-side in localStorage keyed by articleId. Zero server storage overhead.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED (Phase 8 - Enterprise UX):
 * • Created AnnotationContext to manage the cross-boundary highlighting and stylus canvas layer for `SinglePostPage.js`.
 *
 * - EDITED (Phase 8.1 - Liquid Glass Toolbar & Multi-Tool Suite Expansion):
 * • Expanded AnnotationContext to support the complete Apple/Mac-grade suite of reader tools:
 *   Multi-color highlighter, Stylus/Pen pressure tracking, Web Speech API Audio Reader (TTS),
 *   Typography/Focus reader mode scaling, Draggable Financial Calculator, and Sticky Margin Notes.
 * • Implemented Google Docs-style instant auto-persistence to localStorage with defensive serialization.
 *
 * - DO-NOT-DELETE RULE (ABSOLUTE):
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AnnotationContext = createContext();

export const HIGHLIGHT_COLORS = [
    { id: 'yellow', hex: '#fef08a', border: '#eab308', label: 'Amber' },
    { id: 'green', hex: '#bbf7d0', border: '#22c55e', label: 'Emerald' },
    { id: 'blue', hex: '#bae6fd', border: '#0284c7', label: 'Sky' },
    { id: 'pink', hex: '#fbcfe8', border: '#ec4899', label: 'Rose' },
    { id: 'purple', hex: '#e9d5ff', border: '#a855f7', label: 'Violet' }
];

export const AnnotationProvider = ({ children, articleId }) => {
    // 1. Tool Selection State: 'cursor' | 'highlight' | 'pen' | 'eraser'
    const [activeTool, setActiveTool] = useState('cursor');

    // 2. Highlighting State
    const [highlights, setHighlights] = useState([]);
    const [highlightColor, setHighlightColor] = useState(HIGHLIGHT_COLORS[0].hex);

    // 3. Pen / Stylus Canvas State
    const [penColor, setPenColor] = useState('#0284c7');
    const [penWidth, setPenWidth] = useState(3);
    const [penStrokes, setPenStrokes] = useState([]);

    // 4. Financial Calculator State
    const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);

    // 5. Typography & Reader Focus State
    const [fontSizeScale, setFontSizeScale] = useState(100); // 100% default (range: 85% to 135%)
    const [fontFamily, setFontFamily] = useState('sans'); // 'sans' | 'serif' | 'mono'
    const [isFocusMode, setIsFocusMode] = useState(false); // Dims surroundings

    // 6. Audio Reader (Web Speech API TTS) State
    const [audioState, setAudioState] = useState({
        isPlaying: false,
        isPaused: false,
        rate: 1.0, // 0.75x, 1x, 1.25x, 1.5x, 2x
        progress: 0,
        currentText: ''
    });

    // 7. Margin Notes State
    const [notes, setNotes] = useState([]);
    const [isNotesOpen, setIsNotesOpen] = useState(false);

    // Initial State Hydration from Browser Memory (localStorage)
    useEffect(() => {
        if (!articleId || typeof window === 'undefined') return;

        try {
            const savedHighlights = localStorage.getItem(`treish_hl_${articleId}`);
            if (savedHighlights) setHighlights(JSON.parse(savedHighlights));

            const savedNotes = localStorage.getItem(`treish_notes_${articleId}`);
            if (savedNotes) setNotes(JSON.parse(savedNotes));

            const savedStrokes = localStorage.getItem(`treish_strokes_${articleId}`);
            if (savedStrokes) setPenStrokes(JSON.parse(savedStrokes));

            const savedTypography = localStorage.getItem('treish_typography_pref');
            if (savedTypography) {
                const parsed = JSON.parse(savedTypography);
                if (parsed.fontSizeScale) setFontSizeScale(parsed.fontSizeScale);
                if (parsed.fontFamily) setFontFamily(parsed.fontFamily);
            }
        } catch (e) {
            console.warn('[AnnotationContext] Failed to load cached preferences:', e);
        }
    }, [articleId]);

    // Google Docs-Style Auto-Persistence Engine (Auto-Saves on State Change)
    const saveHighlights = useCallback((newHighlights) => {
        setHighlights(newHighlights);
        if (articleId && typeof window !== 'undefined') {
            try {
                localStorage.setItem(`treish_hl_${articleId}`, JSON.stringify(newHighlights));
            } catch (e) {
                console.warn('[AnnotationContext] LocalStorage quota exceeded:', e);
            }
        }
    }, [articleId]);

    const addHighlight = useCallback((highlight) => {
        saveHighlights([...highlights, highlight]);
    }, [highlights, saveHighlights]);

    const removeHighlight = useCallback((id) => {
        saveHighlights(highlights.filter(h => h.id !== id));
    }, [highlights, saveHighlights]);

    const clearAllHighlights = useCallback(() => {
        saveHighlights([]);
    }, [saveHighlights]);

    // Margin Notes Auto-Persistence
    const saveNotes = useCallback((newNotes) => {
        setNotes(newNotes);
        if (articleId && typeof window !== 'undefined') {
            localStorage.setItem(`treish_notes_${articleId}`, JSON.stringify(newNotes));
        }
    }, [articleId]);

    const addNote = useCallback((noteText) => {
        const newNote = {
            id: crypto.randomUUID(),
            text: noteText,
            timestamp: new Date().toISOString()
        };
        saveNotes([newNote, ...notes]);
    }, [notes, saveNotes]);

    const deleteNote = useCallback((id) => {
        saveNotes(notes.filter(n => n.id !== id));
    }, [notes, saveNotes]);

    // Typography Auto-Persistence
    const updateTypography = useCallback((scale, family) => {
        if (scale !== undefined) setFontSizeScale(scale);
        if (family !== undefined) setFontFamily(family);
        if (typeof window !== 'undefined') {
            localStorage.setItem('treish_typography_pref', JSON.stringify({
                fontSizeScale: scale !== undefined ? scale : fontSizeScale,
                fontFamily: family !== undefined ? family : fontFamily
            }));
        }
    }, [fontSizeScale, fontFamily]);

    return (
        <AnnotationContext.Provider value={{
            articleId,
            // Active Tool State
            activeTool, setActiveTool,
            // Highlighter
            highlights, addHighlight, removeHighlight, clearAllHighlights,
            highlightColor, setHighlightColor,
            // Stylus Canvas
            penColor, setPenColor, penWidth, setPenWidth, penStrokes, setPenStrokes,
            // Financial Calculator
            isCalculatorVisible, setIsCalculatorVisible,
            // Typography & Reader Focus
            fontSizeScale, setFontSizeScale, fontFamily, setFontFamily, updateTypography,
            isFocusMode, setIsFocusMode,
            // Audio TTS Reader
            audioState, setAudioState,
            // Margin Notes
            notes, addNote, deleteNote, isNotesOpen, setIsNotesOpen
        }}>
            {children}
        </AnnotationContext.Provider>
    );
};

export const useAnnotations = () => {
    const context = useContext(AnnotationContext);
    if (!context) {
        throw new Error('useAnnotations must be used within an AnnotationProvider');
    }
    return context;
};