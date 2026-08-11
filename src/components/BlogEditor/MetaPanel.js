/**
 * AI-CONTEXT:
 * Purpose: Title and URL slug management panel for the Blog Editor.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated to Cloudflare Radar enterprise aesthetic. Replaced `gray-*` palette with `slate-*`,
 * updated inputs to `h-8` with `text-[11px]`, and tightened layout structure.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
import React from 'react';

const MetaPanel = ({ title, onTitleChange, userFriendlySlug, onUserFriendlySlugChange }) => {
    return (
        <div className="space-y-3">
            <div>
                <label htmlFor="title" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Title</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={e => onTitleChange(e.target.value)}
                    className="w-full h-8 px-2 border border-slate-200 rounded text-[11px] bg-white text-slate-800 focus:ring-1 focus:ring-sky-500 outline-none"
                    required
                />
            </div>
            <div>
                <label htmlFor="userFriendlySlug" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    URL Slug (SEO Friendly)
                </label>
                <input
                    type="text"
                    id="userFriendlySlug"
                    value={userFriendlySlug}
                    onChange={e => onUserFriendlySlugChange(e.target.value)}
                    placeholder="e.g., guide-to-market-analysis"
                    className="w-full h-8 px-2 border border-slate-200 rounded text-[11px] bg-white text-slate-800 focus:ring-1 focus:ring-sky-500 outline-none placeholder-slate-400"
                />
            </div>
        </div>
    );
};

export default MetaPanel;