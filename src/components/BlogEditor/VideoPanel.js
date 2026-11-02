/**
 * AI-CONTEXT:
 * Purpose: Video upload panel for the Blog Editor to support HLS Transcoding Pipeline.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Phase 3 - Initial creation for the Enterprise Video Infrastructure.
 *   Features Cloudflare Radar aesthetic (`slate-50`, `border-slate-200`, `text-[11px]`).
 *
 * - EDITED (Phase 12.1 - Video Normalization & Auto-Cover Sync):
 * • Added onSetAsCoverVideo action support when previewing a video.
 * • Standardized video preview controls with defensive styling.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
import React from 'react';
import { FaVideo, FaTrash } from 'react-icons/fa';

const VideoPanel = ({ videoPreview, onUploadVideoClick, onRemoveVideo, onSetAsCoverVideo }) => {
    return (
        <div className="p-3 border border-slate-200 rounded space-y-3 bg-slate-50">
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <FaVideo size={10} /> Enterprise Video
            </label>

            {videoPreview && (
                <div className="relative group rounded overflow-hidden border border-slate-200 bg-black">
                    <video
                        src={videoPreview}
                        controls
                        className="w-full h-auto aspect-video"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onSetAsCoverVideo && (
                            <button
                                type="button"
                                onClick={onSetAsCoverVideo}
                                className="bg-sky-600/90 text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-sky-700 shadow-sm"
                                title="Set as Cover Video"
                            >
                                Set as Cover
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onRemoveVideo}
                            className="bg-red-600/90 text-white p-1.5 rounded hover:bg-red-700 shadow-sm"
                            title="Remove Video"
                        >
                            <FaTrash size={10} />
                        </button>
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={onUploadVideoClick}
                className="w-full h-8 text-[11px] rounded font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
                {videoPreview ? 'Replace Video File' : 'Upload Video (.mp4, .mov)'}
            </button>

            <p className="text-[9px] text-slate-400 mt-1 font-medium leading-snug">
                Videos are queued to RabbitMQ and transcoded to 1080p HLS adaptive streams with AES-128 DRM encryption.
            </p>
        </div>
    );
};

export default VideoPanel;