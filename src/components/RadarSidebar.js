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
 * - EDITED (Phase 8.2 - Circular Liquid Dropdown Pivot):
 * • Redesigned the horizontal bar into a hyper-realistic, minimal circular button.
 * • Hovering triggers a vertical expansion of the tools. Selecting a tool collapses the main list
 *   and exclusively renders the relevant sub-tool parameters.
 * • Added a rotating gradient blur animation ("liquid circling boundaries") to the active toggle.
 *
 * - EDITED (Phase 8.3 - Cylindrical Capsule & Left-Sticky Integration):
 * • Transformed the UI into a singular expanding cylindrical capsule designed to sit sticky-left of the headline.
 * • Fixed hover hitboxes using a wrapper container to prevent accidental collapse when scrolling down the tools.
 * • Sub-tools now elegantly pop out to the *right* of the capsule with a fluid frosted glass aesthetic.
 *
 * - EDITED (Phase 8.4 - CI/CD Syntax Fix & Hover Stabilization):
 * • Fixed `SyntaxError: Expected '}', got ')'` on line 333 inside the Audio Reader `.map()` function, which crashed the Cloudflare Pages CI/CD pipeline.
 * • Restructured the capsule's internal flexbox to eliminate dead-zone gaps that were causing the `onMouseLeave` event to misfire and prematurely collapse the capsule during vertical mouse travel.
 * • Isolated the spinning `conic-gradient` animation specifically to the main trigger button rather than the entire capsule wrapper, enhancing the hyper-realistic liquid aesthetic.
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
    Plus,
    ZoomIn,
    ZoomOut,
    Wand2
} from 'lucide-react';
import { useAnnotations, HIGHLIGHT_COLORS } from '../context/AnnotationContext';
import html2canvas from 'html2canvas';

// Sub-Component for individual tool buttons inside the capsule
const ToolButton = ({ icon: Icon, label, onClick, isActive }) => (
    <button
        onClick={onClick}
        className="group relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 flex-shrink-0 my-0.5"
    >
        <Icon size={18} className={`transition-all duration-300 ${isActive ? 'text-sky-600 dark:text-sky-400 scale-110' : 'text-slate-600 dark:text-slate-400 group-hover:scale-110'}`} />

        {/* Tooltip popping out to the right */}
        <span className="absolute left-full ml-3 px-2 py-1 bg-slate-800/90 text-white text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap backdrop-blur-md shadow-lg pointer-events-none z-50">
            {label}
        </span>
    </button>
);

const RadarSidebar = () => {
    const {
        activeTool, setActiveTool,
        highlights, clearAllHighlights,
        highlightColor, setHighlightColor,
        penColor, setPenColor, penWidth, setPenWidth, setPenStrokes,
        isCalculatorVisible, setIsCalculatorVisible,
        fontSizeScale, updateTypography, fontFamily,
        isFocusMode, setIsFocusMode,
        audioState, setAudioState,
        notes, addNote, deleteNote
    } = useAnnotations();

    const [isHovered, setIsHovered] = useState(false);
    const [openPopover, setOpenPopover] = useState(null);
    const [newNoteText, setNewNoteText] = useState('');
    const [snapshotStatus, setSnapshotStatus] = useState('idle');

    const wrapperRef = useRef(null);
    const synthRef = useRef(null);

    // Expansion Logic: Opens if hovered and no sub-tool is active.
    const isExpanded = isHovered && openPopover === null;
    const hasActiveSubTool = openPopover !== null;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpenPopover(null);
                setActiveTool('cursor');
                setIsHovered(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setActiveTool]);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis;
        }
        return () => {
            if (synthRef.current) synthRef.current.cancel();
        };
    }, []);

    const handleToggleAudio = () => {
        if (!synthRef.current) return;
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
        synthRef.current.cancel();
        const articleElement = document.querySelector('.prose');
        const textToRead = articleElement ? articleElement.innerText : '';
        if (!textToRead) return;

        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.rate = audioState.rate;
        utterance.onend = () => setAudioState(prev => ({ ...prev, isPlaying: false, isPaused: false }));
        utterance.onerror = () => setAudioState(prev => ({ ...prev, isPlaying: false, isPaused: false }));

        synthRef.current.speak(utterance);
        setAudioState(prev => ({ ...prev, isPlaying: true, isPaused: false, currentText: textToRead }));
    };

    const handleCaptureSnapshot = async () => {
        const articleElement = document.querySelector('article');
        if (!articleElement) return;

        setSnapshotStatus('capturing');
        setOpenPopover(null);
        setActiveTool('cursor');

        try {
            const canvas = await html2canvas(articleElement, {
                scale: 2,
                useCORS: true,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
                ignoreElements: (element) => element.classList.contains('treish-no-capture')
            });

            const link = document.createElement('a');
            link.download = `Treishvaam-Snapshot-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            setSnapshotStatus('copied');
            setTimeout(() => setSnapshotStatus('idle'), 2500);
        } catch (e) {
            setSnapshotStatus('idle');
        }
    };

    const handleToolSelect = (toolId, popoverId) => {
        setActiveTool(toolId);
        setOpenPopover(popoverId);
    };

    const handleMainClick = () => {
        if (hasActiveSubTool) {
            setOpenPopover(null);
            setActiveTool('cursor');
        } else {
            setIsHovered(!isHovered);
        }
    };

    return (
        <div
            ref={wrapperRef}
            className="fixed bottom-6 right-6 lg:relative lg:bottom-auto lg:right-auto z-50 flex items-start treish-no-capture"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* FOCUS MODE BACKDROP (Global) */}
            {isFocusMode && (
                <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[-1] transition-opacity duration-500 pointer-events-none" />
            )}

            {/* CYLINDRICAL CAPSULE */}
            <div
                className={`relative flex flex-col items-center p-1 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-2xl border border-white/60 dark:border-slate-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${isExpanded ? 'h-[360px] w-12 rounded-[24px]' : 'h-12 w-12 rounded-full'
                    }`}
            >
                {/* Main Trigger Button (with Liquid Circling Boundaries) */}
                <div className="relative w-10 h-10 mb-1 flex-shrink-0">
                    {/* Hyper-Realistic Circling Gradient confined to the button */}
                    <div className={`absolute -inset-[3px] rounded-full bg-gradient-to-tr from-sky-400 via-purple-500 to-emerald-400 opacity-80 blur-[4px] animate-[spin_3s_linear_infinite] transition-opacity duration-300 pointer-events-none ${isExpanded || hasActiveSubTool ? 'opacity-100' : 'opacity-0'}`} />

                    <button
                        onClick={handleMainClick}
                        className="relative z-10 w-full h-full flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm transition-transform duration-300 hover:scale-105"
                    >
                        {hasActiveSubTool ? (
                            <X size={20} className="text-slate-700 dark:text-slate-200" />
                        ) : (
                            <Wand2 size={20} className="text-slate-700 dark:text-slate-200" />
                        )}
                    </button>
                </div>

                {/* Vertical Tools List */}
                <div
                    className={`relative z-10 flex flex-col w-full items-center transition-all duration-300 transform origin-top ${isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute top-12'
                        }`}
                >
                    <ToolButton icon={Highlighter} label="Highlighter" onClick={() => handleToolSelect('highlight', 'highlighter')} isActive={activeTool === 'highlight'} />
                    <ToolButton icon={PenTool} label="Stylus / Pen" onClick={() => handleToolSelect('pen', 'pen')} isActive={activeTool === 'pen'} />
                    <ToolButton icon={Volume2} label="Audio Reader" onClick={() => handleToolSelect('cursor', 'audio')} isActive={openPopover === 'audio'} />
                    <ToolButton icon={Type} label="Typography & Focus" onClick={() => handleToolSelect('cursor', 'type')} isActive={openPopover === 'type'} />
                    <ToolButton icon={Calculator} label="Financial Calculator" onClick={() => { setIsCalculatorVisible(true); setOpenPopover(null); setActiveTool('cursor'); }} isActive={isCalculatorVisible} />
                    <ToolButton icon={snapshotStatus === 'copied' ? Check : Camera} label={snapshotStatus === 'capturing' ? "Capturing..." : "Snapshot"} onClick={handleCaptureSnapshot} />
                    <ToolButton icon={StickyNote} label="Margin Notes" onClick={() => handleToolSelect('cursor', 'notes')} isActive={openPopover === 'notes'} />
                </div>
            </div>

            {/* EXPANDING SUB-PANELS (To the Right) */}
            <div
                className={`absolute left-full ml-4 top-0 transition-all duration-400 origin-left ${hasActiveSubTool ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                    }`}
            >
                {/* Highlighter Panel */}
                {openPopover === 'highlighter' && (
                    <div className="w-56 bg-white/75 dark:bg-slate-900/75 backdrop-blur-3xl border border-white/60 dark:border-slate-700/60 shadow-[0_16px_40px_rgba(0,0,0,0.15)] rounded-2xl p-4 flex flex-col gap-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Highlight Color</span>
                        <div className="flex items-center justify-between">
                            {HIGHLIGHT_COLORS.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setHighlightColor(c.hex)}
                                    className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 shadow-sm flex items-center justify-center"
                                    style={{ backgroundColor: c.hex, borderColor: c.border }}
                                    title={c.label}
                                >
                                    {highlightColor === c.hex && <Check size={12} className="text-slate-800" />}
                                </button>
                            ))}
                        </div>
                        <div className="pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center text-[11px]">
                            <span className="text-slate-500 font-medium">{highlights.length} saved</span>
                            {highlights.length > 0 && (
                                <button onClick={clearAllHighlights} className="text-red-500 hover:text-red-600 font-bold flex items-center gap-1">
                                    <Trash2 size={12} /> Clear
                                </button>
                            )}
                        </div>
                        <p className="text-[9px] text-slate-400 text-center -mt-2">Select text to highlight. Shift+Click to erase.</p>
                    </div>
                )}

                {/* Stylus / Pen Panel */}
                {openPopover === 'pen' && (
                    <div className="w-56 bg-white/75 dark:bg-slate-900/75 backdrop-blur-3xl border border-white/60 dark:border-slate-700/60 shadow-[0_16px_40px_rgba(0,0,0,0.15)] rounded-2xl p-4 flex flex-col gap-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Ink & Width</span>
                        <div className="flex items-center justify-between">
                            {['#0284c7', '#16a34a', '#dc2626', '#9333ea', '#0f172a'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => setPenColor(color)}
                                    className="w-6 h-6 rounded-full border-2 border-white/80 dark:border-slate-700 shadow-sm transition-transform hover:scale-110 flex items-center justify-center"
                                    style={{ backgroundColor: color }}
                                >
                                    {penColor === color && <Check size={12} className="text-white" />}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <input type="range" min="1" max="8" value={penWidth} onChange={(e) => setPenWidth(Number(e.target.value))} className="w-full accent-sky-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer" />
                            <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 w-6 text-right">{penWidth}px</span>
                        </div>
                        <button
                            onClick={() => {
                                const canvas = document.querySelector('canvas');
                                if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                                setPenStrokes([]);
                            }}
                            className="w-full py-1.5 text-center text-xs text-red-500 bg-red-50/50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg font-bold transition-colors"
                        >
                            Clear Canvas
                        </button>
                    </div>
                )}

                {/* Audio Reader Panel */}
                {openPopover === 'audio' && (
                    <div className="w-56 bg-white/75 dark:bg-slate-900/75 backdrop-blur-3xl border border-white/60 dark:border-slate-700/60 shadow-[0_16px_40px_rgba(0,0,0,0.15)] rounded-2xl p-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Narration</span>
                            <span className="text-[10px] font-mono bg-sky-100/50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 px-2 py-0.5 rounded-md font-bold">{audioState.rate}x</span>
                        </div>
                        <div className="flex items-center justify-center gap-4 py-2">
                            <button onClick={() => { if (synthRef.current) synthRef.current.cancel(); setAudioState(prev => ({ ...prev, isPlaying: false, isPaused: false })); }} disabled={!audioState.isPlaying && !audioState.isPaused} className="p-2 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300/50 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors">
                                <RotateCcw size={16} />
                            </button>
                            <button onClick={handleToggleAudio} className="p-4 rounded-full bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-600/30 transition-transform hover:scale-105">
                                {audioState.isPlaying && !audioState.isPaused ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                            {[0.75, 1.0, 1.25, 1.5].map(r => (
                                <button key={r} onClick={() => {
                                    setAudioState(prev => ({ ...prev, rate: r }));
                                    if (audioState.isPlaying) {
                                        if (synthRef.current) synthRef.current.cancel();
                                        setTimeout(handleToggleAudio, 100);
                                    }
                                }} className={`py-1 text-[11px] font-bold rounded-md transition-colors ${audioState.rate === r ? 'bg-sky-600 text-white' : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-300/50'}`}>
                                    {r}x
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Typography Panel */}
                {openPopover === 'type' && (
                    <div className="w-56 bg-white/75 dark:bg-slate-900/75 backdrop-blur-3xl border border-white/60 dark:border-slate-700/60 shadow-[0_16px_40px_rgba(0,0,0,0.15)] rounded-2xl p-4 flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <span>Font Scale</span>
                                <span className="font-mono text-slate-800 dark:text-slate-200">{fontSizeScale}%</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => updateTypography(Math.max(85, fontSizeScale - 5))} className="p-1.5 rounded-lg bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300/50 text-slate-700 dark:text-slate-300 transition-colors">
                                    <ZoomOut size={16} />
                                </button>
                                <input type="range" min="85" max="135" step="5" value={fontSizeScale} onChange={(e) => updateTypography(Number(e.target.value))} className="w-full accent-sky-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer" />
                                <button onClick={() => updateTypography(Math.min(135, fontSizeScale + 5))} className="p-1.5 rounded-lg bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300/50 text-slate-700 dark:text-slate-300 transition-colors">
                                    <ZoomIn size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Typeface</span>
                            <div className="grid grid-cols-3 gap-1.5">
                                {[{ id: 'sans', label: 'Sans' }, { id: 'serif', label: 'Serif' }, { id: 'mono', label: 'Mono' }].map(f => (
                                    <button key={f.id} onClick={() => updateTypography(undefined, f.id)} className={`py-1.5 text-[11px] rounded-lg font-bold transition-colors ${fontFamily === f.id ? 'bg-sky-600 text-white' : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-300/50'}`}>
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Focus Dimmer</span>
                            <button onClick={() => setIsFocusMode(!isFocusMode)} className={`p-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5 text-[10px] font-bold ${isFocusMode ? 'bg-amber-500 text-white' : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-300/50'}`}>
                                {isFocusMode ? <Eye size={14} /> : <EyeOff size={14} />} {isFocusMode ? 'ON' : 'OFF'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Notes Panel */}
                {openPopover === 'notes' && (
                    <div className="w-64 bg-white/75 dark:bg-slate-900/75 backdrop-blur-3xl border border-white/60 dark:border-slate-700/60 shadow-[0_16px_40px_rgba(0,0,0,0.15)] rounded-2xl p-4 flex flex-col gap-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Margin Notes</span>
                        <div className="flex flex-col gap-2">
                            <textarea value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} placeholder="Type a note here..." rows={2} className="w-full text-xs p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder-slate-400" />
                            <button onClick={() => { if (newNoteText.trim()) { addNote(newNoteText.trim()); setNewNoteText(''); } }} disabled={!newNoteText.trim()} className="self-end px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-md shadow-purple-600/20">
                                <Plus size={12} /> Add
                            </button>
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                            {notes.length === 0 ? (
                                <p className="text-[10px] text-slate-500 font-medium italic text-center py-4">No notes added.</p>
                            ) : (
                                notes.map(n => (
                                    <div key={n.id} className="p-2.5 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-700/50 flex justify-between items-start gap-2 group shadow-sm">
                                        <p className="text-[11px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{n.text}</p>
                                        <button onClick={() => deleteNote(n.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" title="Delete note">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RadarSidebar;