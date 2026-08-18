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
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED (Phase 8 - Enterprise UX):
 * • Created AnnotationContext to manage the cross-boundary highlighting and stylus canvas layer for `SinglePostPage.js`.
 *
 * - EDITED (Phase 8.1 - Liquid Glass Toolbar & Multi-Tool Suite Expansion):
 * • Expanded AnnotationContext to support the complete Apple/Mac-grade suite of reader tools.
 *
 * - EDITED (Phase 8.6 - Infinite Palette & Advanced Stylus State):
 * • Added `penStyle` ('pen', 'brush', 'fountain') for advanced Samsung-level drawing interpolation.
 * • Upgraded color states to support infinite hex codes from native color pickers.
 *
 * - DO-NOT-DELETE RULE (ABSOLUTE):
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AnnotationContext = createContext();

export const HIGHLIGHT_COLORS = [
    { id: 'yellow', hex: '#fef08a', border: '#eab308', label: 'Amber' },
    { id: 'green', hex: '#bbf7d0', border: '#22c55e', label: 'Emerald' },
    { id: 'blue', hex: '#bae6fd', border: '#0284c7', label: 'Sky' },
    { id: 'pink', hex: '#fbcfe8', border: '#ec4899', label: 'Rose' },
    { id: 'purple', hex: '#e9d5ff', border: '#a855f7', label: 'Violet' }
];

export const AnnotationProvider = ({ children, articleId }) => {
    const [activeTool, setActiveTool] = useState('cursor');

    // Highlighting State
    const [highlights, setHighlights] = useState([]);
    const [highlightColor, setHighlightColor] = useState(HIGHLIGHT_COLORS[0].hex);

    // Advanced Stylus State (Samsung-grade)
    const [penColor, setPenColor] = useState('#0284c7');
    const [penWidth, setPenWidth] = useState(3);
    const [penStyle, setPenStyle] = useState('pen'); // 'pen' | 'brush' | 'fountain'
    const [penStrokes, setPenStrokes] = useState([]);

    // Financial Calculator
    const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);

    // Typography & Focus
    const [fontSizeScale, setFontSizeScale] = useState(100);
    const [fontFamily, setFontFamily] = useState('sans');
    const [isFocusMode, setIsFocusMode] = useState(false);

    // Audio Reader
    const [audioState, setAudioState] = useState({
        isPlaying: false, isPaused: false, rate: 1.0, progress: 0, currentText: ''
    });

    // Margin Notes
    const [notes, setNotes] = useState([]);
    const [isNotesOpen, setIsNotesOpen] = useState(false);

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
            console.warn('[AnnotationContext] Failed to load cached preferences');
        }
    }, [articleId]);

    const saveHighlights = useCallback((newHighlights) => {
        setHighlights(newHighlights);
        if (articleId && typeof window !== 'undefined') {
            localStorage.setItem(`treish_hl_${articleId}`, JSON.stringify(newHighlights));
        }
    }, [articleId]);

    const addHighlight = useCallback((highlight) => saveHighlights([...highlights, highlight]), [highlights, saveHighlights]);
    const removeHighlight = useCallback((id) => saveHighlights(highlights.filter(h => h.id !== id)), [highlights, saveHighlights]);
    const clearAllHighlights = useCallback(() => saveHighlights([]), [saveHighlights]);

    const saveNotes = useCallback((newNotes) => {
        setNotes(newNotes);
        if (articleId && typeof window !== 'undefined') {
            localStorage.setItem(`treish_notes_${articleId}`, JSON.stringify(newNotes));
        }
    }, [articleId]);

    const addNote = useCallback((noteText) => {
        saveNotes([{ id: crypto.randomUUID(), text: noteText, timestamp: new Date().toISOString() }, ...notes]);
    }, [notes, saveNotes]);

    const deleteNote = useCallback((id) => saveNotes(notes.filter(n => n.id !== id)), [notes, saveNotes]);

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
            activeTool, setActiveTool,
            highlights, addHighlight, removeHighlight, clearAllHighlights,
            highlightColor, setHighlightColor,
            penColor, setPenColor, penWidth, setPenWidth, penStyle, setPenStyle, penStrokes, setPenStrokes,
            isCalculatorVisible, setIsCalculatorVisible,
            fontSizeScale, setFontSizeScale, fontFamily, setFontFamily, updateTypography,
            isFocusMode, setIsFocusMode,
            audioState, setAudioState,
            notes, addNote, deleteNote, isNotesOpen, setIsNotesOpen
        }}>
            {children}
        </AnnotationContext.Provider>
    );
};

export const useAnnotations = () => {
    const context = useContext(AnnotationContext);
    if (!context) throw new Error('useAnnotations must be used within AnnotationProvider');
    return context;
};