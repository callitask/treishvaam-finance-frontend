/**
 * AI-CONTEXT:
 * Purpose: Cover image upload and alt text management panel for the Blog Editor.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated to Cloudflare Radar enterprise aesthetic. Replaced `gray-*` and `sky-*` palette 
 * with `slate-*`, updated inputs to `h-8` with `text-[11px]`, changed `rounded-lg` to `rounded`, 
 * and standardized upload button to `bg-slate-900`.
 *
 * - EDITED (Phase 12.1 - Video Cover Preview Support):
 * • Render HTML5 video preview if coverPreview points to .mp4, .m3u8, or streaming media.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
import React from 'react';

const CoverImagePanel = ({ coverPreview, onUploadCoverClick, coverImageAltText, onCoverImageAltTextChange }) => {
    return (
        <div className="p-3 border border-slate-200 rounded space-y-3 bg-slate-50">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Cover Image</label>
            {coverPreview && (
                (typeof coverPreview === 'string' && (coverPreview.endsWith('.mp4') || coverPreview.endsWith('.m3u8') || coverPreview.includes('/raw/') || coverPreview.includes('/hls/'))) ? (
                    <video
                        src={coverPreview}
                        controls
                        className="w-full h-auto aspect-video object-contain my-2 border border-slate-200 rounded bg-black"
                    />
                ) : (
                    <img
                        src={coverPreview}
                        alt="Cover Preview"
                        className="w-full h-auto aspect-video object-contain my-2 border border-slate-200 rounded bg-white"
                    />
                )
            )}
            <button
                type="button"
                onClick={onUploadCoverClick}
                className="w-full h-8 text-[11px] rounded font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
                Upload Cover Image
            </button>
            <div>
                <label htmlFor="coverImageAltText" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cover Image Alt Text</label>
                <input
                    type="text"
                    id="coverImageAltText"
                    value={coverImageAltText}
                    onChange={e => onCoverImageAltTextChange(e.target.value)}
                    placeholder="Describe the cover image for SEO"
                    className="w-full mt-1 h-8 px-2 text-[11px] border border-slate-200 rounded bg-white text-slate-800 focus:ring-1 focus:ring-sky-500 outline-none"
                />
            </div>
        </div>
    );
};

export default CoverImagePanel;