/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Left-docked collapsible UX toolbar providing highlighter and html2canvas snapshot tools.
 *
 * Scope:
 * - Operates completely client-side to enrich user interaction without DB bloat or HTTP overhead.
 *
 * Security Constraints:
 * - Requires npm install html2canvas.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED:
 * • Created RadarSidebar component.
 * • Date/Phase: Phase 2 (Radar UX Toolbar)
 *
 * - EDITED:
 * • Added localStorage persistence for text highlights to persist user sessions without invoking backend database state.
 * • Date/Phase: Phase 3 (Enterprise Video Layer)
 */

import React, { useState } from 'react';
import html2canvas from 'html2canvas';

const RadarSidebar = ({ targetContainerId = 'article-content' }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);

    const handleHighlightText = () => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
            alert('Please select text inside the article first to highlight.');
            return;
        }

        const range = selection.getRangeAt(0);
        const mark = document.createElement('mark');
        mark.className = 'bg-yellow-200 text-slate-900 rounded px-1 cursor-pointer transition-colors hover:bg-yellow-300';
        mark.title = 'Click to remove highlight';
        mark.onclick = () => {
            const parent = mark.parentNode;
            while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
            parent.removeChild(mark);
        };

        try {
            range.surroundContents(mark);
            selection.removeAllRanges();

            // Save state natively to localStorage
            const saved = JSON.parse(localStorage.getItem('user_highlights') || '[]');
            saved.push({ text: mark.innerText, timestamp: Date.now() });
            localStorage.setItem('user_highlights', JSON.stringify(saved));
        } catch (e) {
            alert('Highlighting across complex HTML boundaries is not supported. Please select plain text.');
        }
    };

    const handleCaptureSnapshot = async () => {
        const container = document.getElementById(targetContainerId) || document.body;
        setIsCapturing(true);

        try {
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imageUri = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `treishvaam-insight-${Date.now()}.png`;
            link.href = imageUri;
            link.click();
        } catch (err) {
            console.error('Snapshot capture failed:', err);
            alert('Failed to generate snapshot.');
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <aside
            className="fixed left-3 top-1/3 z-40 flex items-center"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className="flex items-center bg-slate-900/90 backdrop-blur-lg border border-slate-800 text-white rounded-2xl p-2 shadow-2xl transition-all duration-300">
                <button
                    type="button"
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-sky-600 hover:bg-sky-500 transition-colors shadow-lg"
                    title="Cloudflare Radar UX Toolbar"
                >
                    📡
                </button>

                <div
                    className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-w-xs ml-3 opacity-100' : 'max-w-0 opacity-0'
                        }`}
                >
                    <button
                        type="button"
                        onClick={handleHighlightText}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                        🖍️ Highlight
                    </button>

                    <button
                        type="button"
                        onClick={handleCaptureSnapshot}
                        disabled={isCapturing}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                        📸 {isCapturing ? 'Saving...' : 'Snapshot'}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default RadarSidebar;