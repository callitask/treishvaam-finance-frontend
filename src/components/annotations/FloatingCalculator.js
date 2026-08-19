/**
 * AI-CONTEXT:
 * Purpose: Draggable financial calculator rendered via React Portal.
 * Scope: Independent widget executing client-side arithmetic via switch-case (eval-free for Zero-Trust XSS protection).
 * 
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED (Phase 8 - Enterprise UX): Engineered the Calculator overlay portal to assist readers parsing complex financial metrics natively within the article view.
 * 
 * - EDITED (Phase 8.1 - Enterprise UI Density): 
 * • Applied Cloudflare Radar density specifications and z-index optimizations to ensure portal layering over all modal backdrops.
 * • Bound drag events to native PointerEvents for universal desktop/mobile gesture support.
 * 
 * - EDITED (Phase 8.11 - Liquid Glass & Advanced Finance Ops):
 * • UX Overhaul: Migrated from a basic opaque box to a macOS-style hyper-realistic Liquid Glass draggable widget using explicit WebKit inline CSS.
 * • Finance Engine: Built a dual-mode state machine (Standard vs Finance). Integrated PV, FV, PMT, and ROI algorithmic calculations.
 * • Notes Integration: Added direct-to-margin-notes export formatting (e.g., "[Finance Calc] PV: $10k...").
 * 
 * - EDITED (Phase 8.12 - Grid Alignment & Interstitial UX):
 * • Restored Apple-standard 5x4 CSS Grid geometry to reclaim the missing '=' operator.
 * • Replaced obstructive absolute modal with a sleek 'translate-y' slide-up portal for the Notes integration.
 * 
 * - DO-NOT-DELETE RULE (ABSOLUTE):
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAnnotations } from '../../context/AnnotationContext';

const FloatingCalculator = () => {
    const { isCalculatorVisible, setIsCalculatorVisible, addNote } = useAnnotations();
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [mounted, setMounted] = useState(false);
    const dragRef = useRef(null);

    // Standard Calc State
    const [display, setDisplay] = useState('0');
    const [operator, setOperator] = useState(null);
    const [previousValue, setPreviousValue] = useState(null);
    const [waitingForNewValue, setWaitingForNewValue] = useState(false);

    // Mode State
    const [calcMode, setCalcMode] = useState('standard'); // 'standard' | 'finance'

    // Finance Ops State
    const [finState, setFinState] = useState({ rate: '', nper: '', pmt: '', pv: '', fv: '' });

    // UX Interstitial State
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [noteDraft, setNoteDraft] = useState('');

    useEffect(() => {
        setMounted(true);
        setPos({ x: window.innerWidth > 400 ? window.innerWidth - 350 : 20, y: 100 });
    }, []);

    if (!mounted || !isCalculatorVisible) return null;

    const handlePointerDown = (e) => {
        e.target.setPointerCapture(e.pointerId);
        dragRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    };

    const handlePointerMove = (e) => {
        if (dragRef.current && e.target.hasPointerCapture(e.pointerId)) {
            setPos({
                x: e.clientX - dragRef.current.x,
                y: e.clientY - dragRef.current.y
            });
        }
    };

    const handlePointerUp = (e) => {
        e.target.releasePointerCapture(e.pointerId);
        dragRef.current = null;
    };

    // Standard Math
    const handleNum = (num) => {
        if (waitingForNewValue) {
            setDisplay(String(num));
            setWaitingForNewValue(false);
        } else {
            setDisplay(display === '0' ? String(num) : display + num);
        }
    };

    const handleOp = (op) => {
        const currentVal = parseFloat(display);
        if (previousValue == null) {
            setPreviousValue(currentVal);
        } else if (operator && !waitingForNewValue) {
            const result = calculate(previousValue, currentVal, operator);
            setDisplay(String(result));
            setPreviousValue(result);
        }
        setOperator(op);
        setWaitingForNewValue(true);
    };

    const handleAdvancedOp = (op) => {
        const currentVal = parseFloat(display);
        if (op === '+/-') {
            setDisplay(String(currentVal * -1));
        } else if (op === '%') {
            setDisplay(String(currentVal / 100));
        }
    };

    const calculate = (a, b, op) => {
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/': return b === 0 ? 0 : a / b;
            default: return b;
        }
    };

    const handleEqual = () => {
        if (operator && previousValue != null) {
            const result = calculate(previousValue, parseFloat(display), operator);
            setDisplay(String(result));
            setPreviousValue(null);
            setOperator(null);
            setWaitingForNewValue(true);
        }
    };

    const handleClear = () => {
        setDisplay('0');
        setPreviousValue(null);
        setOperator(null);
        setWaitingForNewValue(false);
    };

    // Finance Math Engine
    const updateFin = (field, val) => setFinState(prev => ({ ...prev, [field]: val }));

    const calculateFinance = (target) => {
        const r = parseFloat(finState.rate) / 100 || 0;
        const n = parseFloat(finState.nper) || 0;
        const p = parseFloat(finState.pmt) || 0;
        const pv = parseFloat(finState.pv) || 0;
        const fv = parseFloat(finState.fv) || 0;

        let result = 0;
        if (target === 'FV') {
            // FV = PV*(1+r)^n + PMT*(((1+r)^n - 1)/r)
            result = pv * Math.pow(1 + r, n) + (r === 0 ? p * n : p * ((Math.pow(1 + r, n) - 1) / r));
            updateFin('fv', result.toFixed(2));
            setDisplay(String(result.toFixed(2)));
        } else if (target === 'PV') {
            // PV = (FV - PMT*(((1+r)^n - 1)/r)) / (1+r)^n
            const futureVal = fv || 0;
            result = (futureVal - (r === 0 ? p * n : p * ((Math.pow(1 + r, n) - 1) / r))) / Math.pow(1 + r, n);
            updateFin('pv', result.toFixed(2));
            setDisplay(String(result.toFixed(2)));
        } else if (target === 'ROI') {
            // ROI = (FV - PV) / PV * 100
            if (pv !== 0) result = ((fv - pv) / pv) * 100;
            setDisplay(String(result.toFixed(2)) + '%');
        }
        setWaitingForNewValue(true);
    };

    const openNoteModal = () => {
        setIsNoteModalOpen(true);
        setNoteDraft('');
    };

    const confirmSendToNotes = () => {
        let noteString = '';
        if (calcMode === 'standard') {
            noteString = `[Calculation] Result: ${display}`;
        } else {
            noteString = `[Finance Calc]\nRate: ${finState.rate || 0}%\nPeriods: ${finState.nper || 0}\nPMT: $${finState.pmt || 0}\nPV: $${finState.pv || 0}\nFV: $${finState.fv || 0}\nResult: ${display}`;
        }

        if (noteDraft.trim()) {
            noteString = `${noteDraft.trim()}\n\n${noteString}`;
        }

        addNote(noteString);
        setIsNoteModalOpen(false);
    };

    const glassStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(50px) saturate(200%)',
        WebkitBackdropFilter: 'blur(50px) saturate(200%)',
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5), inset 0 -1px 1px rgba(255,255,255,0.1), 0 16px 40px -8px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.2)'
    };

    const inputStyle = "w-full bg-white/20 dark:bg-slate-900/50 border border-white/20 dark:border-slate-700 rounded p-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400";

    return ReactDOM.createPortal(
        <div
            className="fixed z-[100] w-72 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 animate-fade-in"
            style={{ left: pos.x, top: pos.y, ...glassStyle }}
        >
            <div
                className="flex items-center justify-between p-3 border-b border-white/20 cursor-grab active:cursor-grabbing select-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            >
                <div className="flex gap-2 bg-slate-900/10 dark:bg-slate-900/50 p-1 rounded-lg">
                    <button onClick={() => setCalcMode('standard')} className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${calcMode === 'standard' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>Standard</button>
                    <button onClick={() => setCalcMode('finance')} className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${calcMode === 'finance' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>Finance</button>
                </div>
                <button onClick={() => setIsCalculatorVisible(false)} className="w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center text-xs transition-colors shadow-sm">✕</button>
            </div>

            <div className="p-4 flex flex-col gap-3 relative">
                <div className="w-full p-3 bg-white/40 dark:bg-slate-950/40 border border-white/30 dark:border-slate-700/50 rounded-xl text-right text-3xl font-mono text-slate-800 dark:text-slate-100 overflow-hidden text-ellipsis shadow-inner">
                    {display}
                </div>

                {calcMode === 'standard' ? (
                    <div className="grid grid-cols-4 gap-2">
                        <button onClick={handleClear} className="col-span-1 p-3 bg-slate-200/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 font-bold rounded-xl hover:bg-white/40 transition-colors shadow-sm">AC</button>
                        <button onClick={() => handleAdvancedOp('+/-')} className="p-3 bg-slate-200/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 font-bold rounded-xl hover:bg-white/40 transition-colors shadow-sm">+/-</button>
                        <button onClick={() => handleAdvancedOp('%')} className="p-3 bg-slate-200/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 font-bold rounded-xl hover:bg-white/40 transition-colors shadow-sm">%</button>
                        <button onClick={() => handleOp('/')} className="p-3 bg-sky-500/80 text-white font-bold rounded-xl hover:bg-sky-400 transition-colors shadow-sm">÷</button>

                        {[7, 8, 9].map(n => <button key={n} onClick={() => handleNum(n)} className="p-3 bg-white/30 dark:bg-slate-800/30 text-slate-900 dark:text-slate-100 font-semibold rounded-xl hover:bg-white/50 transition-colors shadow-sm">{n}</button>)}
                        <button onClick={() => handleOp('*')} className="p-3 bg-sky-500/80 text-white font-bold rounded-xl hover:bg-sky-400 transition-colors shadow-sm">×</button>

                        {[4, 5, 6].map(n => <button key={n} onClick={() => handleNum(n)} className="p-3 bg-white/30 dark:bg-slate-800/30 text-slate-900 dark:text-slate-100 font-semibold rounded-xl hover:bg-white/50 transition-colors shadow-sm">{n}</button>)}
                        <button onClick={() => handleOp('-')} className="p-3 bg-sky-500/80 text-white font-bold rounded-xl hover:bg-sky-400 transition-colors shadow-sm">−</button>

                        {[1, 2, 3].map(n => <button key={n} onClick={() => handleNum(n)} className="p-3 bg-white/30 dark:bg-slate-800/30 text-slate-900 dark:text-slate-100 font-semibold rounded-xl hover:bg-white/50 transition-colors shadow-sm">{n}</button>)}
                        <button onClick={() => handleOp('+')} className="p-3 bg-sky-500/80 text-white font-bold rounded-xl hover:bg-sky-400 transition-colors shadow-sm">+</button>

                        <button onClick={() => handleNum(0)} className="col-span-2 p-3 bg-white/30 dark:bg-slate-800/30 text-slate-900 dark:text-slate-100 font-semibold rounded-xl hover:bg-white/50 transition-colors shadow-sm">0</button>
                        <button onClick={() => handleNum('.')} className="p-3 bg-white/30 dark:bg-slate-800/30 text-slate-900 dark:text-slate-100 font-semibold rounded-xl hover:bg-white/50 transition-colors shadow-sm">.</button>
                        <button onClick={handleEqual} className="p-3 bg-sky-500/80 text-white font-bold rounded-xl hover:bg-sky-400 transition-colors shadow-sm">=</button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-2 gap-2">
                            <div><label className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Rate (%)</label><input type="number" value={finState.rate} onChange={e => updateFin('rate', e.target.value)} className={inputStyle} /></div>
                            <div><label className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Periods (N)</label><input type="number" value={finState.nper} onChange={e => updateFin('nper', e.target.value)} className={inputStyle} /></div>
                            <div><label className="text-[10px] font-bold text-slate-600 dark:text-slate-300">PMT ($)</label><input type="number" value={finState.pmt} onChange={e => updateFin('pmt', e.target.value)} className={inputStyle} /></div>
                            <div><label className="text-[10px] font-bold text-slate-600 dark:text-slate-300">PV ($)</label><input type="number" value={finState.pv} onChange={e => updateFin('pv', e.target.value)} className={inputStyle} /></div>
                            <div className="col-span-2"><label className="text-[10px] font-bold text-slate-600 dark:text-slate-300">FV ($)</label><input type="number" value={finState.fv} onChange={e => updateFin('fv', e.target.value)} className={inputStyle} /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            <button onClick={() => calculateFinance('PV')} className="p-2 bg-indigo-500/80 text-white text-xs font-bold rounded-lg hover:bg-indigo-400 transition-colors shadow">Solve PV</button>
                            <button onClick={() => calculateFinance('FV')} className="p-2 bg-indigo-500/80 text-white text-xs font-bold rounded-lg hover:bg-indigo-400 transition-colors shadow">Solve FV</button>
                            <button onClick={() => calculateFinance('ROI')} className="p-2 bg-emerald-500/80 text-white text-xs font-bold rounded-lg hover:bg-emerald-400 transition-colors shadow">Solve ROI</button>
                        </div>
                        <button onClick={() => { setFinState({ rate: '', nper: '', pmt: '', pv: '', fv: '' }); setDisplay('0'); }} className="mt-1 p-2 w-full bg-slate-200/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors">Clear Fields</button>
                    </div>
                )}

                <button
                    onClick={openNoteModal}
                    className="mt-2 w-full p-2.5 bg-slate-900/80 dark:bg-white/80 hover:bg-slate-900 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-extrabold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                    Send to Notes
                </button>
            </div>

            {/* Interstitial Slide-up Modal */}
            <div className={`absolute bottom-0 left-0 right-0 h-full z-50 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-xl border-t border-white/20 p-4 flex flex-col justify-center gap-3 transition-transform duration-300 ${isNoteModalOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Add a custom note (optional):</label>
                <textarea
                    value={noteDraft}
                    onChange={e => setNoteDraft(e.target.value)}
                    placeholder="Enter notes..."
                    className="w-full bg-white/10 border border-white/20 rounded p-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400 resize-none h-24"
                />
                <div className="flex gap-2 justify-end mt-2">
                    <button onClick={() => setIsNoteModalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-white text-[10px] font-bold transition-colors">Cancel</button>
                    <button onClick={confirmSendToNotes} className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-[10px] font-bold transition-colors shadow-lg">Confirm Send</button>
                </div>
            </div>
        </div>,
        document.body
    );
};
export default FloatingCalculator;