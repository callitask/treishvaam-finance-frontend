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
 * - EDITED (Phase 8.9 - Unified State Machine & Atomic Client Persistence):
 * • Engineered `past` and `future` state history stacks supporting synchronized Undo/Redo operations across highlights and stylus strokes.
 * • Implemented `handleClearAll` master reset to purge React state, active DOM `<mark>` elements, and `localStorage` cache atomically.
 * • Added `undo` and `redo` handlers with history roll-forward/roll-back logic and localStorage persistence synchronization.
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

    // Undo/Redo History Stacks
    const [past, setPast] = useState([]);
    const [future, setFuture] = useState([]);

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

    // 1. Core Persistence Logic
    const persistState = useCallback((newHighlights, newStrokes) => {
        if (articleId && typeof window !== 'undefined') {
            try {
                localStorage.setItem(`treish_hl_${articleId}`, JSON.stringify(newHighlights));
                localStorage.setItem(`treish_strokes_${articleId}`, JSON.stringify(newStrokes));
            } catch (e) {
                console.warn('[AnnotationContext] Failed to persist state to localStorage', e);
            }
        }
    }, [articleId]);

    // 2. Master History Engine (For all DOM and Canvas changes)
    const saveStateToHistory = useCallback((newHighlights, newStrokes) => {
        setPast(prev => [...prev, { highlights, penStrokes }]);
        setFuture([]); // Clear redo stack on net-new action
        setHighlights(newHighlights);
        setPenStrokes(newStrokes);
        persistState(newHighlights, newStrokes);
    }, [highlights, penStrokes, persistState]);

    const undo = useCallback(() => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        setPast(newPast);
        setFuture(prev => [{ highlights, penStrokes }, ...prev]);

        setHighlights(previous.highlights);
        setPenStrokes(previous.penStrokes);
        persistState(previous.highlights, previous.penStrokes);
    }, [past, highlights, penStrokes, persistState]);

    const redo = useCallback(() => {
        if (future.length === 0) return;
        const next = future[0];
        const newFuture = future.slice(1);

        setFuture(newFuture);
        setPast(prev => [...prev, { highlights, penStrokes }]);

        setHighlights(next.highlights);
        setPenStrokes(next.penStrokes);
        persistState(next.highlights, next.penStrokes);
    }, [future, highlights, penStrokes, persistState]);

    const handleClearAll = useCallback(() => {
        // Save current state so the clear action can be undone
        saveStateToHistory([], []);

        // Purge physical DOM marks
        if (typeof document !== 'undefined') {
            document.querySelectorAll('mark.treish-highlight').forEach(mark => {
                const parent = mark.parentNode;
                if (parent) {
                    parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
                    parent.normalize();
                }
            });
        }
    }, [saveStateToHistory]);

    // History-wrapped highlight mutations
    const addHighlight = useCallback((highlight) => {
        saveStateToHistory([...highlights, highlight], penStrokes);
    }, [highlights, penStrokes, saveStateToHistory]);

    const removeHighlight = useCallback((id) => {
        saveStateToHistory(highlights.filter(h => h.id !== id), penStrokes);
    }, [highlights, penStrokes, saveStateToHistory]);

    const clearAllHighlights = useCallback(() => {
        saveStateToHistory([], penStrokes);
        if (typeof document !== 'undefined') {
            document.querySelectorAll('mark.treish-highlight').forEach(mark => {
                const parent = mark.parentNode;
                if (parent) {
                    parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
                    parent.normalize();
                }
            });
        }
    }, [penStrokes, saveStateToHistory]);

    // 3. Hydration on Mount
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
            console.warn('[AnnotationContext] Failed to load cached preferences', e);
        }
    }, [articleId]);

    const saveNotes = useCallback((newNotes) => {
        setNotes(newNotes);
        if (articleId && typeof window !== 'undefined') {
            localStorage.setItem(`treish_notes_${articleId}`, JSON.stringify(newNotes));
        }
    }, [articleId]);

    const addNote = useCallback((noteText) => {
        const id = window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
        saveNotes([{ id, text: noteText, timestamp: new Date().toISOString() }, ...notes]);
    }, [notes, saveNotes]);

    const deleteNote = useCallback((id) => {
        saveNotes(notes.filter(n => n.id !== id));
    }, [notes, saveNotes]);

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
            penColor, setPenColor, penWidth, setPenWidth, penStyle, setPenStyle,
            penStrokes, setPenStrokes,
            past, future, undo, redo, saveStateToHistory, handleClearAll,
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