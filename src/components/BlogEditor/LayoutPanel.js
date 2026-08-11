/**
 * AI-CONTEXT:
 * Purpose: Layout selection and tagging control panel for the Blog Editor.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated to Cloudflare Radar enterprise aesthetic. Replaced `gray-*` palette with `slate-*`,
 * updated selects to `h-8` with `text-[11px]`, and standardized label typography.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
import React from 'react';
import TagsInput from './TagsInput';

const LayoutPanel = ({ layoutStyle, onLayoutStyleChange, tags, onTagsChange }) => {
    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="layoutStyle" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Layout Style</label>
                <select
                    id="layoutStyle"
                    value={layoutStyle}
                    onChange={onLayoutStyleChange}
                    className="w-full h-8 px-2 border border-slate-200 rounded text-[11px] bg-white text-slate-800 focus:ring-1 focus:ring-sky-500 outline-none"
                >
                    <option value="DEFAULT">Default (Masonry)</option>
                    <option value="BANNER">Banner</option>
                    <option value="MULTI_COLUMN_2">2 Column Row</option>
                    <option value="MULTI_COLUMN_3">3 Column Row</option>
                    <option value="MULTI_COLUMN_4">4 Column Row</option>
                    <option value="MULTI_COLUMN_5">5 Column Row</option>
                    <option value="MULTI_COLUMN_6">6 Column Row</option>
                </select>
            </div>
            <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Tags</label>
                <TagsInput tags={tags} setTags={onTagsChange} />
            </div>
        </div>
    );
};

export default LayoutPanel;