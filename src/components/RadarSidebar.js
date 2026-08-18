/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - High-density Apple/Mac-grade "Liquid Glass" (frosted glassmorphism) floating pill dock for financial articles.
 *
 * Scope:
 * - Renders a sleek floating top/dock bar with downward popover menus for all interactive reader tools.
 *
 * Security Constraints:
 * - Client-side state only. Zero third-party tracking or remote evaluation.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED (Phase 8.1 - Liquid Glass Enterprise Toolbar):
 * • Engineered the unified floating dock with backdrop-blur-2xl glassmorphism.
 *
 * - EDITED (Phase 8.2 - Circular Liquid Dropdown Pivot):
 * • Redesigned the horizontal bar into a minimal circular button.
 *
 * - EDITED (Phase 8.3 - Cylindrical Capsule & Left-Sticky Integration):
 * • Transformed the UI into a singular expanding cylindrical capsule designed to sit sticky-left of the headline.
 *
 * - EDITED (Phase 8.4 - CI/CD Syntax Fix & Hover Stabilization):
 * • Fixed `SyntaxError: Expected '}', got ')'` and restructured the capsule's internal flexbox to eliminate dead-zones.
 *
 * - EDITED (Phase 8.8 - Hyper-Realistic Plasma UX & Snipping Tool Portal):
 * • UX Overhaul: Upgraded the capsule to true frosted liquid glass (`backdrop-blur-[60px]`, `backdrop-saturate-[200%]`, `bg-white/10`, and inner light-refraction rim shadows).
 * • Plasma Engine: Replaced basic gradients with a 3-tier volumetric plasma orb (`mix-blend-screen`, counter-rotating corona, pulsing core) locked exactly behind the Obsidian trigger button.
 * • Snipping Tool: Deprecated full-page `html2canvas`. Integrated `SnippingToolOverlay.js` to allow precision click-and-drag coordinate cropping (Windows Snipping Tool style).
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
    Wand2,
    Crop
} from 'lucide-react';
import { useAnnotations, HIGHLIGHT_COLORS } from '../context/AnnotationContext';
import html2canvas from 'html2canvas';
import SnippingToolOverlay from './annotations/SnippingToolOverlay';

const ToolButton = ({ icon: Icon, label, onClick, isActive }) => (
    <button
        onClick={onClick}
        className="group relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 flex-shrink-0 my-0.5"
    >
        <Icon size={18} className={`transition-all duration-300 drop-shadow-md ${isActive ? 'text-sky-400 scale-110' : 'text-slate-600 dark:text-slate-300 group-hover:scale-110 group-hover:text-sky-500'}`} />

        <span className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900/95 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap backdrop-blur-md shadow-xl pointer-events-none z-50 tracking-wide border border-white/10">
            {label}
        </span>
    </button>
);

const RadarSidebar = () => {
    const {
        activeTool, setActiveTool,
        highlights, clearAllHighlights,
        highlightColor, setHighlightColor,
        penColor, setPenColor, penWidth, setPenWidth, setPenStyle, penStyle, setPenStrokes,
        isCalculatorVisible, setIsCalculatorVisible,
        fontSizeScale, updateTypography, fontFamily,
        isFocusMode, setIsFocusMode,
        audioState, setAudioState,
        notes, addNote, deleteNote
    } = useAnnotations();

    const [isHovered, setIsHovered] = useState(false);
    const [openPopover, setOpenPopover] = useState(null);
    const [newNoteText, setNewNoteText] = useState('');

    // Snipping Tool State
    const [isSnipping, setIsSnipping] = useState(false);
    const [snapshotStatus, setSnapshotStatus] = useState('idle');

    const wrapperRef = useRef(null);
    const synthRef = useRef(null);

    const isExpanded = isHovered && openPopover === null;
    const hasActiveSubTool = openPopover !== null;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpenPopover(null);
                setIsHovered(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const handleStartSnip = () => {
        setIsSnipping(true);
        setOpenPopover(null);
        setActiveTool('cursor');
        setIsHovered(false);
    };

    const handleCaptureCrop = async (bounds) => {
        setIsSnipping(false);
        setSnapshotStatus('capturing');

        try {
            const canvas = await html2canvas(document.body, {
                x: bounds.x,
                y: bounds.y,
                width: bounds.width,
                height: bounds.height,
                scale: window.devicePixelRatio || 2,
                useCORS: true,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
                ignoreElements: (element) => element.classList.contains('treish-no-capture')
            });

            const link = document.createElement('a');
            link.download = `Treishvaam-Snip-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            setSnapshotStatus('copied');
            setTimeout(() => setSnapshotStatus('idle'), 2500);
        } catch (e) {
            console.error('[RadarSidebar] Snipping capture failed:', e);
            setSnapshotStatus('idle');
        }
    };

    const handleCancelSnip = () => {
        setIsSnipping(false);
    };

    const handleToolSelect = (toolId, popoverId) => {
        setActiveTool(toolId);
        setOpenPopover(popoverId);
    };

    const handleMainClick = () => {
        if (hasActiveSubTool || activeTool !== 'cursor') {
            setOpenPopover(null);
            setActiveTool('cursor');
            setIsHovered(false);
        } else {
            setIsHovered(!isHovered);
        }
    };

    // Shared Glassmorphism CSS classes for premium enterprise aesthetic
    const glassCSS = "bg-white/10 dark:bg-slate-900/40 backdrop-blur-[60px] backdrop-saturate-[200%] border border-white/20 dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(255,255,255,0.1),0_12px_40px_-8px_rgba(0,0,0,0.4)]";

    return (
        <>
            {isSnipping && (
                <SnippingToolOverlay
                    onCapture={handleCaptureCrop}
                    onCancel={handleCancelSnip}
                />
            )}

            <div
                ref={wrapperRef}
                className="fixed bottom-6 right-6 xl:relative xl:bottom-auto xl:right-auto z-[60] flex items-start treish-no-capture"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {isFocusMode && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[-1] transition-opacity duration-500 pointer-events-none" />
                )}

                {/* CYLINDRICAL CAPSULE */}
                <div
                    className={`relative flex flex-col items-center p-1.5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${glassCSS} ${isExpanded ? 'h-[400px] w-14 rounded-[28px]' : 'h-14 w-14 rounded-full'
                        }`}
                >
                    {/* Main Trigger Button Container */}
                    <div className="relative w-11 h-11 flex-shrink-0 flex items-center justify-center z-20">

                        {/* 3-Tier Volumetric Plasma Animation */}
                        <div className={`absolute -inset-[6px] rounded-full pointer-events-none transition-all duration-700 overflow-hidden ${isExpanded || hasActiveSubTool || activeTool !== 'cursor' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                            {/* Core Spin */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-full animate-[spin_4s_linear_infinite]" />
                            {/* Counter-Rotating Corona (Liquid Interference) */}
                            <div className="absolute -inset-[2px] rounded-full blur-[12px] opacity-80 bg-gradient-to-bl from-purple-500 to-fuchsia-400 animate-[spin_5s_linear_infinite_reverse] mix-blend-screen dark:mix-blend-lighten" />
                            {/* Breathing Pulse */}
                            <div className="absolute inset-[2px] rounded-full bg-white/40 blur-[4px] animate-pulse mix-blend-overlay" />
                        </div>

                        {/* Frosted Obsidian Main Button */}
                        <button
                            onClick={handleMainClick}
                            className="relative z-10 w-full h-full flex items-center justify-center rounded-full bg-slate-900 text-sky-50 shadow-[inset_0_1px_3px_rgba(255,255,255,0.2),0_4px_15px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:scale-105"
                        >
                            {hasActiveSubTool || activeTool !== 'cursor' ? (
                                <X size={20} />
                            ) : (
                                <Wand2 size={20} />
                            )}
                        </button>
                    </div>

                    {/* Vertical Tools List (Expands inside the cylinder) */}
                    <div
                        className={`relative z-10 flex flex-col w-full items-center mt-2 transition-all duration-300 transform origin-top ${isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none absolute top-12'
                            }`}
                    >
                        <ToolButton icon={Highlighter} label="Highlighter" onClick={() => handleToolSelect('highlight', 'highlighter')} isActive={activeTool === 'highlight'} />
                        <ToolButton icon={PenTool} label="Stylus / Pen" onClick={() => handleToolSelect('pen', 'pen')} isActive={activeTool === 'pen'} />
                        <ToolButton icon={Volume2} label="Audio Reader" onClick={() => handleToolSelect('cursor', 'audio')} isActive={openPopover === 'audio'} />
                        <ToolButton icon={Type} label="Typography" onClick={() => handleToolSelect('cursor', 'type')} isActive={openPopover === 'type'} />
                        <ToolButton icon={Calculator} label="Calculator" onClick={() => { setIsCalculatorVisible(true); setOpenPopover(null); setActiveTool('cursor'); setIsHovered(false); }} isActive={isCalculatorVisible} />
                        <ToolButton icon={snapshotStatus === 'copied' ? Check : Crop} label={snapshotStatus === 'capturing' ? "Processing..." : "Snipping Tool"} onClick={handleStartSnip} />
                        <ToolButton icon={StickyNote} label="Margin Notes" onClick={() => handleToolSelect('cursor', 'notes')} isActive={openPopover === 'notes'} />
                    </div>
                </div>

                {/* EXPANDING SUB-PANELS (Pops out to the Right) */}
                <div
                    className={`absolute left-full ml-5 top-0 transition-all duration-400 origin-left z-50 ${hasActiveSubTool ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                        }`}
                >
                    {openPopover && (
                        <div className={`w-72 rounded-[28px] p-6 flex flex-col gap-5 ${glassCSS}`}>

                            {/* Highlighter Panel */}
                            {openPopover === 'highlighter' && (
                                <>
                                    <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center shadow-sm">Highlight Color</span>
                                    <div className="flex items-center justify-between px-1">
                                        {HIGHLIGHT_COLORS.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => setHighlightColor(c.hex)}
                                                className="w-8 h-8 rounded-full border-[3px] transition-transform hover:scale-110 shadow-lg flex items-center justify-center"
                                                style={{ backgroundColor: c.hex, borderColor: c.border }}
                                                title={c.label}
                                            >
                                                {highlightColor === c.hex && <Check size={16} className="text-slate-800 drop-shadow-md" />}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="pt-4 border-t border-white/20 dark:border-slate-600/50 flex justify-between items-center text-[11px]">
                                        <span className="text-slate-600 dark:text-slate-300 font-bold">{highlights.length} saved</span>
                                        {highlights.length > 0 && (
                                            <button onClick={clearAllHighlights} className="text-red-500 hover:text-red-400 font-bold flex items-center gap-1 bg-red-50/50 dark:bg-red-900/30 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                                                <Trash2 size={14} /> Clear
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Stylus / Pen Panel */}
                            {openPopover === 'pen' && (
                                <>
                                    <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center shadow-sm">Ink & Style</span>

                                    <div className="flex bg-slate-200/50 dark:bg-slate-800/60 rounded-xl p-1 shadow-inner">
                                        {[{ id: 'pen', label: 'Solid' }, { id: 'brush', label: 'Soft' }, { id: 'fountain', label: 'Nib' }].map(style => (
                                            <button
                                                key={style.id}
                                                onClick={() => setPenStyle(style.id)}
                                                className={`flex-1 text-[11px] font-bold py-2 rounded-lg transition-all ${penStyle === style.id ? 'bg-white dark:bg-slate-700 shadow-md text-sky-600 dark:text-sky-400 scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                            >
                                                {style.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between px-1">
                                        {['#0284c7', '#16a34a', '#dc2626', '#9333ea', '#0f172a'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setPenColor(color)}
                                                className="w-8 h-8 rounded-full border-[3px] border-white/80 dark:border-slate-700 shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
                                                style={{ backgroundColor: color }}
                                            >
                                                {penColor === color && <Check size={16} className="text-white drop-shadow-md" />}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <input type="range" min="1" max="12" value={penWidth} onChange={(e) => setPenWidth(Number(e.target.value))} className="w-full accent-sky-500 h-1.5 bg-slate-300/50 dark:bg-slate-600/50 rounded-lg cursor-pointer shadow-inner" />
                                        <span className="text-[12px] font-mono font-bold text-slate-800 dark:text-slate-200 w-8 text-right">{penWidth}px</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const canvas = document.querySelector('canvas');
                                            if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                                            setPenStrokes([]);
                                        }}
                                        className="w-full py-2.5 text-center text-xs text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-900/40 hover:bg-red-200/50 dark:hover:bg-red-800/40 rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
                                    >
                                        Clear Canvas
                                    </button>
                                </>
                            )}

                            {/* Audio Reader Panel */}
                            {openPopover === 'audio' && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest shadow-sm">Narration</span>
                                        <span className="text-[10px] font-mono bg-sky-200/50 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300 px-2.5 py-1 rounded-lg font-bold shadow-sm">{audioState.rate}x</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-6 py-3">
                                        <button onClick={() => { if (synthRef.current) synthRef.current.cancel(); setAudioState(prev => ({ ...prev, isPlaying: false, isPaused: false })); }} disabled={!audioState.isPlaying && !audioState.isPaused} className="p-3 rounded-full bg-slate-200/60 dark:bg-slate-700/60 hover:bg-slate-300/60 text-slate-700 dark:text-slate-200 disabled:opacity-40 transition-all shadow-sm">
                                            <RotateCcw size={20} />
                                        </button>
                                        <button onClick={handleToggleAudio} className="p-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-900/20 dark:shadow-white/20 transition-transform hover:scale-110">
                                            {audioState.isPlaying && !audioState.isPaused ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/20 dark:border-slate-600/50">
                                        {[0.75, 1.0, 1.25, 1.5].map(r => (
                                            <button key={r} onClick={() => {
                                                setAudioState(prev => ({ ...prev, rate: r }));
                                                if (audioState.isPlaying) {
                                                    if (synthRef.current) synthRef.current.cancel();
                                                    setTimeout(handleToggleAudio, 100);
                                                }
                                            }} className={`py-2 text-[11px] font-bold rounded-xl transition-all shadow-sm ${audioState.rate === r ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 scale-105' : 'bg-slate-200/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-300/50'}`}>
                                                {r}x
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Typography Panel */}
                            {openPopover === 'type' && (
                                <>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest shadow-sm">
                                            <span>Font Scale</span>
                                            <span className="font-mono text-slate-800 dark:text-slate-200">{fontSizeScale}%</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => updateTypography(Math.max(85, fontSizeScale - 5))} className="p-2.5 rounded-xl bg-slate-200/60 dark:bg-slate-700/60 hover:bg-slate-300/60 text-slate-700 dark:text-slate-200 transition-colors shadow-sm">
                                                <ZoomOut size={18} />
                                            </button>
                                            <input type="range" min="85" max="135" step="5" value={fontSizeScale} onChange={(e) => updateTypography(Number(e.target.value))} className="w-full accent-slate-900 dark:accent-white h-1.5 bg-slate-300/50 dark:bg-slate-600/50 rounded-lg cursor-pointer shadow-inner" />
                                            <button onClick={() => updateTypography(Math.min(135, fontSizeScale + 5))} className="p-2.5 rounded-xl bg-slate-200/60 dark:bg-slate-700/60 hover:bg-slate-300/60 text-slate-700 dark:text-slate-200 transition-colors shadow-sm">
                                                <ZoomIn size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 pt-5 border-t border-white/20 dark:border-slate-600/50">
                                        <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center shadow-sm">Typeface</span>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[{ id: 'sans', label: 'Sans' }, { id: 'serif', label: 'Serif' }, { id: 'mono', label: 'Mono' }].map(f => (
                                                <button key={f.id} onClick={() => updateTypography(undefined, f.id)} className={`py-2 text-[11px] rounded-xl font-bold transition-all shadow-sm ${fontFamily === f.id ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 scale-105' : 'bg-slate-200/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-300/50'}`}>
                                                    {f.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-5 border-t border-white/20 dark:border-slate-600/50 flex justify-between items-center">
                                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 shadow-sm">Focus Dimmer</span>
                                        <button onClick={() => setIsFocusMode(!isFocusMode)} className={`px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2 text-xs font-bold ${isFocusMode ? 'bg-amber-500 text-white scale-105' : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-300/60'}`}>
                                            {isFocusMode ? <Eye size={16} /> : <EyeOff size={16} />} {isFocusMode ? 'ON' : 'OFF'}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Notes Panel */}
                            {openPopover === 'notes' && (
                                <>
                                    <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest shadow-sm">Margin Notes</span>
                                    <div className="flex flex-col gap-3">
                                        <textarea value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} placeholder="Type a note here..." rows={3} className="w-full text-xs p-3.5 rounded-2xl border border-white/50 dark:border-slate-600/50 bg-white/40 dark:bg-slate-950/40 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 placeholder-slate-500 shadow-inner resize-none" />
                                        <button onClick={() => { if (newNoteText.trim()) { addNote(newNoteText.trim()); setNewNoteText(''); } }} disabled={!newNoteText.trim()} className="self-end px-5 py-2.5 bg-slate-900 dark:bg-white disabled:opacity-40 text-white dark:text-slate-900 text-[11px] font-bold rounded-xl transition-all shadow-lg flex items-center gap-1.5 hover:scale-105">
                                            <Plus size={14} /> Add Note
                                        </button>
                                    </div>
                                    <div className="max-h-52 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar pt-4 border-t border-white/20 dark:border-slate-600/50">
                                        {notes.length === 0 ? (
                                            <p className="text-[11px] text-slate-500 font-medium italic text-center py-6">No notes added.</p>
                                        ) : (
                                            notes.map(n => (
                                                <div key={n.id} className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/50 flex justify-between items-start gap-3 group shadow-sm transition-all hover:shadow-md">
                                                    <p className="text-[11px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-medium">{n.text}</p>
                                                    <button onClick={() => deleteNote(n.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-110 mt-0.5" title="Delete note">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default RadarSidebar;