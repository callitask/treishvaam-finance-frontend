/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - High-density Apple/Mac-grade "Liquid Glass" (frosted glassmorphism) floating pill dock for financial articles.
 *
 * Scope:
 * - Renders a sleek floating top/dock bar with downward popover menus for all interactive reader tools:
 *   1. Multi-Color Highlighter & Eraser
 *   2. Stylus / Apple Pencil Canvas Overlay
 *   3. Web Speech API Audio Reader (Text-to-Speech)
 *   4. Typography & Focus Reading Mode Scaler
 *   5. Zero-Trust Financial Calculator
 *   6. High-Resolution Area Screenshot / Snapshot (html2canvas)
 *   7. Sticky Margin Notes & Quick Bookmarks
 *
 * Security Constraints:
 * - Client-side state only. Zero third-party tracking or remote evaluation.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED (Phase 8.1 - Liquid Glass Enterprise Toolbar):
 * • Engineered the unified floating dock with backdrop-blur-2xl glassmorphism, popover menus,
 *   dynamic audio narration, typography controls, and screenshot export.
 *
 * - DO-NOT-DELETE RULE (ABSOLUTE):
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    Highlighter,
    PenTool,
    Calculator,
    Volume2,
    VolumeX,
    Play,
    Pause,
    RotateCcw,
    Camera,
    Type,
    StickyNote,
    Trash2,
    Eye,
    EyeOff,
    Check,
    X,
    ChevronDown,
    Plus,
    ZoomIn,
    ZoomOut
} from 'lucide-react';
import { useAnnotations, HIGHLIGHT_COLORS } from '../context/AnnotationContext';
import html2canvas from 'html2canvas';

const RadarSidebar = () => {
    const {
        activeTool, setActiveTool,
        highlights, clearAllHighlights,
        highlightColor, setHighlightColor,
        penColor, setPenColor, penWidth, setPenWidth, setPenStrokes,
        isCalculatorVisible, setIsCalculatorVisible,
        fontSizeScale, setFontSizeScale, fontFamily, setFontFamily, updateTypography,
        isFocusMode, setIsFocusMode,
        audioState, setAudioState,
        notes, addNote, deleteNote, isNotesOpen, setIsNotesOpen
    } = useAnnotations();

    // Active Popover State (null | 'highlighter' | 'pen' | 'audio' | 'type' | 'notes')
    const [openPopover, setOpenPopover] = useState(null);
    const [newNoteText, setNewNoteText] = useState('');
    const [snapshotStatus, setSnapshotStatus] = useState('idle'); // 'idle' | 'capturing' | 'copied'

    const dockRef = useRef(null);
    const synthRef = useRef(null);

    // Close popovers on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dockRef.current && !dockRef.current.contains(e.target)) {
                setOpenPopover(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Web Speech API Initialization
    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis;
        }
        return () => {
            if (synthRef.current) synthRef.current.cancel();
        };
    }, []);

    // ─── AUDIO READER HANDLERS ──────────────────────────────────────────────
    const handleToggleAudio = () => {
        if (!synthRef.current) {
            alert('Speech Synthesis is not supported in your browser.');
            return;
        }

        if (audioState.isPlaying && !audioState.isPaused) {
            synthRef.current.pause();
            setAudioState(prev => ({ ...prev, isPaused: true }));
            return;
        }

        if (audioState.isPaused) {
            synthRef.current.resume();
            setAudioState(prev => ({ ...prev, isPaused: false }));
            return;
        }

        // Start Fresh Narration
        synthRef.current.cancel();
        const articleElement = document.querySelector('.prose');
        const textToRead = articleElement ? articleElement.innerText : '';

        if (!textToRead) return;

        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.rate = audioState.rate;

        utterance.onend = () => {
            setAudioState(prev => ({ ...prev, isPlaying: false, isPaused: false, progress: 100 }));
        };

        utterance.onerror = () => {
            setAudioState(prev => ({ ...prev, isPlaying: false, isPaused: false }));
        };

        synthRef.current.speak(utterance);
        setAudioState(prev => ({ ...prev, isPlaying: true, isPaused: false, currentText: textToRead }));
    };

    const handleStopAudio = () => {
        if (synthRef.current) synthRef.current.cancel();
        setAudioState(prev => ({ ...prev, isPlaying: false, isPaused: false, progress: 0 }));
    };

    const handleChangeAudioRate = (newRate) => {
        setAudioState(prev => ({ ...prev, rate: newRate }));
        if (audioState.isPlaying) {
            handleStopAudio();
            setTimeout(handleToggleAudio, 100);
        }
    };

    // ─── HIGH-RES SCREENSHOT HANDLER ─────────────────────────────────────────
    const handleCaptureSnapshot = async () => {
        const articleElement = document.querySelector('article');
        if (!articleElement) return;

        setSnapshotStatus('capturing');
        setOpenPopover(null);

        try {
            const canvas = await html2canvas(articleElement, {
                scale: 2, // Retina resolution
                useCORS: true,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
                ignoreElements: (element) => element.classList.contains('treish-no-capture')
            });

            // Auto download screenshot
            const link = document.createElement('a');
            link.download = `Treishvaam-Article-Snapshot-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            setSnapshotStatus('copied');
            setTimeout(() => setSnapshotStatus('idle'), 2500);
        } catch (e) {
            console.error('[RadarSidebar] Snapshot failed:', e);
            setSnapshotStatus('idle');
        }
    };

    return (
        <>
            {/* Focus Mode Dimming Backdrop */}
            {isFocusMode && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300 pointer-events-none"
                />
            )}

            {/* Apple/Mac Liquid Glass Floating Pill Dock */}
            <nav
                aria-label="Article Reading and Annotation Tools"
                ref={dockRef}
                className="fixed top-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-3 py-2 bg-white/75 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/60 dark:border-slate-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-full transition-all duration-300 treish-no-capture"
            >
                {/* 1. HIGHLIGHTER TOOL */}
                <div className="relative">
                    <button
                        onClick={() => {
                            if (activeTool === 'highlight') {
                                setOpenPopover(openPopover === 'highlighter' ? null : 'highlighter');
                            } else {
                                setActiveTool('highlight');
                                setOpenPopover('highlighter');
                            }
                        }}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeTool === 'highlight'
                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 ring-2 ring-amber-400/50 shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        title="Highlight Text (Shift+Click to erase)"
                    >
                        <Highlighter size={14} style={{ color: highlightColor }} />
                        <span className="hidden sm:inline">Highlight</span>
                        <ChevronDown size={12} className="opacity-60" />
                    </button>

                    {/* Highlighter Popover Dropdown */}
                    {openPopover === 'highlighter' && (
                        <div className="absolute top-full mt-2 left-0 w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-3 flex flex-col gap-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Highlight Color</span>
                            <div className="flex items-center justify-between">
                                {HIGHLIGHT_COLORS.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => {
                                            setHighlightColor(c.hex);
                                            setActiveTool('highlight');
                                        }}
                                        className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                                        style={{ backgroundColor: c.hex, borderColor: c.border }}
                                        title={c.label}
                                    >
                                        {highlightColor === c.hex && <Check size={12} className="text-slate-800" />}
                                    </button>
                                ))}
                            </div>
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px]">
                                <span className="text-slate-500">{highlights.length} saved</span>
                                {highlights.length > 0 && (
                                    <button
                                        onClick={clearAllHighlights}
                                        className="text-red-500 hover:text-red-600 font-semibold flex items-center gap-1"
                                    >
                                        <Trash2 size={12} /> Clear all
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. STYLUS / PEN TOOL */}
                <div className="relative">
                    <button
                        onClick={() => {
                            if (activeTool === 'pen') {
                                setOpenPopover(openPopover === 'pen' ? null : 'pen');
                            } else {
                                setActiveTool('pen');
                                setOpenPopover('pen');
                            }
                        }}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeTool === 'pen'
                            ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300 ring-2 ring-sky-400/50 shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        title="Stylus / Freehand Pen"
                    >
                        <PenTool size={14} style={{ color: penColor }} />
                        <span className="hidden sm:inline">Pen</span>
                        <ChevronDown size={12} className="opacity-60" />
                    </button>

                    {/* Pen Popover Dropdown */}
                    {openPopover === 'pen' && (
                        <div className="absolute top-full mt-2 left-0 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-3 flex flex-col gap-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ink Color & Width</span>
                            <div className="flex items-center justify-between">
                                {['#0284c7', '#16a34a', '#dc2626', '#9333ea', '#0f172a'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setPenColor(color)}
                                        className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 shadow-sm transition-transform hover:scale-110 flex items-center justify-center"
                                        style={{ backgroundColor: color }}
                                    >
                                        {penColor === color && <Check size={12} className="text-white" />}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-500">Size:</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="8"
                                    value={penWidth}
                                    onChange={(e) => setPenWidth(Number(e.target.value))}
                                    className="w-full accent-sky-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                                />
                                <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300">{penWidth}px</span>
                            </div>
                            <button
                                onClick={() => {
                                    const canvas = document.querySelector('canvas');
                                    if (canvas) {
                                        const ctx = canvas.getContext('2d');
                                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                                    }
                                    setPenStrokes([]);
                                }}
                                className="w-full py-1 text-center text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors"
                            >
                                Clear Canvas Strokes
                            </button>
                        </div>
                    )}
                </div>

                {/* 3. AUDIO READER (TTS) */}
                <div className="relative">
                    <button
                        onClick={() => setOpenPopover(openPopover === 'audio' ? null : 'audio')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${audioState.isPlaying
                            ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 ring-2 ring-indigo-400/50 shadow-sm animate-pulse'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        title="Listen to Article (Audio Narration)"
                    >
                        {audioState.isPlaying ? <Volume2 size={14} /> : <Volume2 size={14} className="opacity-70" />}
                        <span className="hidden sm:inline">Listen</span>
                        <ChevronDown size={12} className="opacity-60" />
                    </button>

                    {/* Audio Popover Dropdown */}
                    {openPopover === 'audio' && (
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Audio Narration</span>
                                <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold">{audioState.rate}x Speed</span>
                            </div>

                            {/* Play / Pause / Stop Controls */}
                            <div className="flex items-center justify-center gap-3 py-1">
                                <button
                                    onClick={handleStopAudio}
                                    disabled={!audioState.isPlaying && !audioState.isPaused}
                                    className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 disabled:opacity-40 transition-colors"
                                    title="Restart"
                                >
                                    <RotateCcw size={14} />
                                </button>
                                <button
                                    onClick={handleToggleAudio}
                                    className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-transform hover:scale-105"
                                >
                                    {audioState.isPlaying && !audioState.isPaused ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                                </button>
                            </div>

                            {/* Rate Selector */}
                            <div className="grid grid-cols-4 gap-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                                {[0.75, 1.0, 1.25, 1.5].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => handleChangeAudioRate(r)}
                                        className={`py-1 text-[11px] font-semibold rounded-md transition-colors ${audioState.rate === r
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {r}x
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. TYPOGRAPHY & READER MODE */}
                <div className="relative">
                    <button
                        onClick={() => setOpenPopover(openPopover === 'type' ? null : 'type')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Typography & Focus Mode"
                    >
                        <Type size={14} />
                        <span className="hidden sm:inline">Aa</span>
                        <ChevronDown size={12} className="opacity-60" />
                    </button>

                    {/* Typography Popover Dropdown */}
                    {openPopover === 'type' && (
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Font Size Scaler */}
                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <span>Font Scale</span>
                                    <span className="font-mono text-slate-700 dark:text-slate-300">{fontSizeScale}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateTypography(Math.max(85, fontSizeScale - 5))}
                                        className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                                    >
                                        <ZoomOut size={14} />
                                    </button>
                                    <input
                                        type="range"
                                        min="85"
                                        max="135"
                                        step="5"
                                        value={fontSizeScale}
                                        onChange={(e) => updateTypography(Number(e.target.value))}
                                        className="w-full accent-sky-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                                    />
                                    <button
                                        onClick={() => updateTypography(Math.min(135, fontSizeScale + 5))}
                                        className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                                    >
                                        <ZoomIn size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Font Family Selector */}
                            <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Typeface</span>
                                <div className="grid grid-cols-3 gap-1">
                                    {[
                                        { id: 'sans', label: 'Sans', font: 'font-sans' },
                                        { id: 'serif', label: 'Serif', font: 'font-serif' },
                                        { id: 'mono', label: 'Mono', font: 'font-mono' }
                                    ].map(f => (
                                        <button
                                            key={f.id}
                                            onClick={() => updateTypography(undefined, f.id)}
                                            className={`py-1 text-xs rounded font-medium transition-colors ${f.font} ${fontFamily === f.id
                                                ? 'bg-sky-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                                }`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Focus Mode Toggle */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Focus Dimmer</span>
                                <button
                                    onClick={() => setIsFocusMode(!isFocusMode)}
                                    className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold ${isFocusMode
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                        }`}
                                >
                                    {isFocusMode ? <Eye size={14} /> : <EyeOff size={14} />}
                                    <span>{isFocusMode ? 'ON' : 'OFF'}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 5. FINANCIAL CALCULATOR TOGGLE */}
                <button
                    onClick={() => setIsCalculatorVisible(!isCalculatorVisible)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${isCalculatorVisible
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-400/50 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    title="Toggle Financial Calculator"
                >
                    <Calculator size={14} />
                    <span className="hidden md:inline">Calc</span>
                </button>

                {/* 6. HIGH-RES SNAPSHOT TOOL */}
                <button
                    onClick={handleCaptureSnapshot}
                    disabled={snapshotStatus === 'capturing'}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${snapshotStatus === 'copied'
                        ? 'bg-green-600 text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    title="Export High-Res PNG Snapshot"
                >
                    {snapshotStatus === 'copied' ? <Check size={14} /> : <Camera size={14} />}
                    <span className="hidden md:inline">{snapshotStatus === 'capturing' ? 'Capturing...' : snapshotStatus === 'copied' ? 'Saved!' : 'Snapshot'}</span>
                </button>

                {/* 7. STICKY MARGIN NOTES */}
                <div className="relative">
                    <button
                        onClick={() => setOpenPopover(openPopover === 'notes' ? null : 'notes')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${notes.length > 0
                            ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 ring-2 ring-purple-400/50'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        title="Margin Notes & Bookmarks"
                    >
                        <StickyNote size={14} />
                        <span className="hidden md:inline">Notes</span>
                        {notes.length > 0 && (
                            <span className="w-4 h-4 bg-purple-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                                {notes.length}
                            </span>
                        )}
                    </button>

                    {/* Notes Popover Dropdown */}
                    {openPopover === 'notes' && (
                        <div className="absolute top-full mt-2 right-0 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Article Margin Notes</span>

                            {/* New Note Form */}
                            <div className="flex flex-col gap-1.5">
                                <textarea
                                    value={newNoteText}
                                    onChange={(e) => setNewNoteText(e.target.value)}
                                    placeholder="Write a quick note on this article..."
                                    rows={2}
                                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                />
                                <button
                                    onClick={() => {
                                        if (newNoteText.trim()) {
                                            addNote(newNoteText.trim());
                                            setNewNoteText('');
                                        }
                                    }}
                                    disabled={!newNoteText.trim()}
                                    className="self-end px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1"
                                >
                                    <Plus size={12} /> Add Note
                                </button>
                            </div>

                            {/* Notes List */}
                            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {notes.length === 0 ? (
                                    <p className="text-[11px] text-slate-400 italic text-center py-2">No notes added yet.</p>
                                ) : (
                                    notes.map(n => (
                                        <div key={n.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex justify-between items-start gap-2 group">
                                            <p className="text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{n.text}</p>
                                            <button
                                                onClick={() => deleteNote(n.id)}
                                                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Delete note"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Reset to Default Cursor */}
                {activeTool !== 'cursor' && (
                    <button
                        onClick={() => {
                            setActiveTool('cursor');
                            setOpenPopover(null);
                        }}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
                        title="Exit active tool (Return to cursor)"
                    >
                        <X size={14} />
                    </button>
                )}
            </nav>
        </>
    );
};

export default RadarSidebar;