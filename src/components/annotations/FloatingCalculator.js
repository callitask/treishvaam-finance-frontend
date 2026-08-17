/**
 * AI-CONTEXT:
 * Purpose: Draggable financial calculator rendered via React Portal.
 * Scope: Independent widget executing client-side arithmetic via switch-case (eval-free for Zero-Trust XSS protection).
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED (Phase 8 - Enterprise UX): Engineered the Calculator overlay portal to assist readers parsing complex financial metrics natively within the article view.
 */
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAnnotations } from '../../context/AnnotationContext';

const FloatingCalculator = () => {
    const { isCalculatorVisible, setIsCalculatorVisible } = useAnnotations();
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [mounted, setMounted] = useState(false);
    const dragRef = useRef(null);

    // Calculator State (Eval-Free Math Engine)
    const [display, setDisplay] = useState('0');
    const [operator, setOperator] = useState(null);
    const [previousValue, setPreviousValue] = useState(null);
    const [waitingForNewValue, setWaitingForNewValue] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Default spawn location top-right
        setPos({ x: window.innerWidth - 350, y: 100 });
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

    return ReactDOM.createPortal(
        <div
            className="fixed z-[100] w-72 bg-slate-50 dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
            style={{ left: pos.x, top: pos.y }}
        >
            <div
                className="flex items-center justify-between p-3 bg-slate-200 dark:bg-slate-800 cursor-grab active:cursor-grabbing select-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            >
                <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">Financial Calculator</span>
                <button onClick={() => setIsCalculatorVisible(false)} className="text-slate-500 hover:text-red-500 transition-colors px-2">✕</button>
            </div>
            <div className="p-4 flex flex-col gap-3">
                <div className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-right text-2xl font-mono text-slate-800 dark:text-slate-100 overflow-hidden text-ellipsis shadow-inner">
                    {display}
                </div>
                <div className="grid grid-cols-4 gap-2">
                    <button onClick={handleClear} className="col-span-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">C</button>
                    <button onClick={() => handleOp('/')} className="p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors">÷</button>
                    <button onClick={() => handleOp('*')} className="p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors">×</button>

                    {[7, 8, 9].map(n => <button key={n} onClick={() => handleNum(n)} className="p-3 bg-slate-100 dark:bg-slate-800 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">{n}</button>)}
                    <button onClick={() => handleOp('-')} className="p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors">−</button>

                    {[4, 5, 6].map(n => <button key={n} onClick={() => handleNum(n)} className="p-3 bg-slate-100 dark:bg-slate-800 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">{n}</button>)}
                    <button onClick={() => handleOp('+')} className="p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors">+</button>

                    {[1, 2, 3].map(n => <button key={n} onClick={() => handleNum(n)} className="p-3 bg-slate-100 dark:bg-slate-800 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">{n}</button>)}
                    <button onClick={handleEqual} className="row-span-2 p-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors shadow-sm">=</button>

                    <button onClick={() => handleNum(0)} className="col-span-2 p-3 bg-slate-100 dark:bg-slate-800 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">0</button>
                    <button onClick={() => handleNum('.')} className="p-3 bg-slate-100 dark:bg-slate-800 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">.</button>
                </div>
            </div>
        </div>,
        document.body
    );
};
export default FloatingCalculator;