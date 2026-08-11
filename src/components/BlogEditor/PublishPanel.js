/**
 * AI-CONTEXT:
 * Purpose: Publication scheduling and featuring panel for the Blog Editor.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated to Cloudflare Radar enterprise aesthetic. Replaced `gray-*` palette with `slate-*`,
 * changed inputs to `h-8` with `text-[11px]`, tightened layout padding, and standardized publish button
 * to `bg-slate-900` from `bg-sky-600`.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
import React from 'react';

const PublishPanel = ({ scheduledTime, onScheduledTimeChange, isFeatured, onIsFeaturedChange, isUpdating }) => {
    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="scheduledTime" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Schedule Publication</label>
                <input
                    type="datetime-local"
                    id="scheduledTime"
                    value={scheduledTime}
                    onChange={e => onScheduledTimeChange(e.target.value)}
                    className="w-full h-8 px-2 border border-slate-200 rounded text-[11px] bg-white text-slate-800 focus:ring-1 focus:ring-sky-500 outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Leave blank to publish immediately.</p>
            </div>
            <div className="flex items-center bg-slate-50 p-2 rounded border border-slate-200">
                <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={e => onIsFeaturedChange(e.target.checked)}
                    className="h-3.5 w-3.5 text-slate-800 border-slate-300 rounded focus:ring-slate-500 cursor-pointer"
                />
                <label htmlFor="isFeatured" className="ml-2 text-[11px] font-bold text-slate-700 cursor-pointer">Mark as Featured</label>
            </div>
            <button
                type="submit"
                className="w-full bg-slate-900 text-white font-bold py-2.5 rounded hover:bg-slate-800 transition-colors text-[11px] uppercase tracking-wider"
            >
                {isUpdating ? 'Update Post' : 'Publish Post'}
            </button>
        </div>
    );
};

export default PublishPanel;