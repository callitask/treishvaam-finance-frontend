/**
 * AI-CONTEXT:
 * Purpose: SEO configuration and SERP preview panel for the Blog Editor.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated to Cloudflare Radar enterprise aesthetic. Replaced `gray-*` palette with `slate-*`,
 * tightened SERP preview to `p-3` with `shadow-none`, changed inputs to `h-8` with `text-[11px]`,
 * and updated text area to match.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
import React from 'react';
import { FaGoogle, FaInfoCircle } from 'react-icons/fa';

const SeoPanel = ({
    keywords, onKeywordsChange,
    metaDescription, onMetaDescriptionChange,
    seoTitle, onSeoTitleChange,
    canonicalUrl, onCanonicalUrlChange,
    focusKeyword, onFocusKeywordChange,
    title
}) => {
    const displayTitle = seoTitle || title || "Your Article Title";
    const displayDesc = metaDescription || "This is how your article description will appear in search results. It should be concise, engaging, and include your focus keywords.";
    const displayUrl = `https://treishvaamfinance.com/blog/...`;

    return (
        <div className="space-y-4">
            {/* 1. SERP Preview (Visual) */}
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <div className="flex items-center gap-1.5 mb-2.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    <FaGoogle size={10} /> Search Engine Preview
                </div>
                <div className="font-sans">
                    <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center">
                            <img src="/logo.webp" alt="" className="w-3 h-3 opacity-80" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                        <div className="text-[11px] font-medium text-slate-800">Treishvaam Finance</div>
                        <div className="text-[10px] text-slate-500">{displayUrl}</div>
                    </div>
                    <h3 className="text-[15px] text-[#1a0dab] hover:underline cursor-pointer font-medium leading-snug truncate">
                        {displayTitle}
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                        {displayDesc}
                    </p>
                </div>
            </div>

            {/* 2. Focus Keyword */}
            <div>
                <label htmlFor="focusKeyword" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Focus Keyword</label>
                <input
                    type="text"
                    id="focusKeyword"
                    name="focusKeyword"
                    value={focusKeyword || ''}
                    onChange={e => onFocusKeywordChange(e.target.value)}
                    className="w-full h-8 px-2 text-[11px] border border-slate-200 rounded bg-white text-slate-800 focus:ring-1 focus:ring-sky-500 outline-none"
                    placeholder="e.g. Nifty 50 Analysis"
                />
            </div>

            {/* 3. SEO Title */}
            <div>
                <div className="flex justify-between mb-1">
                    <label htmlFor="seoTitle" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">SEO Title Tag</label>
                    <span className={`text-[9px] font-mono ${displayTitle.length > 60 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                        {displayTitle.length} / 60
                    </span>
                </div>
                <input
                    type="text"
                    id="seoTitle"
                    name="seoTitle"
                    value={seoTitle || ''}
                    onChange={e => onSeoTitleChange(e.target.value)}
                    className="w-full h-8 px-2 text-[11px] border border-slate-200 rounded bg-white text-slate-800 focus:ring-1 focus:ring-sky-500 outline-none"
                    placeholder="Leave blank to use main post title"
                />
            </div>

            {/* 4. Meta Description */}
            <div>
                <div className="flex justify-between mb-1">
                    <label htmlFor="metaDescription" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Meta Description</label>
                    <span className={`text-[9px] font-mono ${displayDesc.length > 160 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                        {displayDesc.length} / 160
                    </span>
                </div>
                <textarea
                    id="metaDescription"
                    name="metaDescription"
                    rows="3"
                    value={metaDescription || ''}
                    onChange={e => onMetaDescriptionChange(e.target.value)}
                    className="w-full p-2 text-[11px] border border-slate-200 rounded bg-white text-slate-800 focus:ring-1 focus:ring-sky-500 outline-none resize-none"
                    placeholder="Summarize the article..."
                />
            </div>

            {/* 5. Advanced Toggle (Canonical) */}
            <details className="group border border-slate-200 rounded bg-slate-50">
                <summary className="flex items-center gap-2 p-2 cursor-pointer text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:text-slate-800 transition-colors select-none">
                    <span>Advanced Settings</span>
                    <span className="group-open:rotate-180 transition-transform ml-auto">▼</span>
                </summary>
                <div className="p-3 pt-0 border-t border-slate-200 mt-2">
                    <label htmlFor="canonicalUrl" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 mb-1">
                        Canonical URL <FaInfoCircle size={10} className="text-slate-400" title="Use this if the content was originally published elsewhere." />
                    </label>
                    <input
                        type="text"
                        id="canonicalUrl"
                        name="canonicalUrl"
                        value={canonicalUrl || ''}
                        onChange={e => onCanonicalUrlChange(e.target.value)}
                        className="w-full h-8 px-2 text-[11px] border border-slate-200 rounded bg-white focus:ring-1 focus:ring-sky-500 transition-colors"
                        placeholder="https://original-source.com/article..."
                    />
                    <div className="mt-3">
                        <label htmlFor="keywords" className="block text-[10px] font-bold text-slate-600 mb-1">Meta Keywords</label>
                        <input
                            type="text"
                            id="keywords"
                            name="keywords"
                            value={keywords || ''}
                            onChange={e => onKeywordsChange(e.target.value)}
                            className="w-full h-8 px-2 text-[11px] border border-slate-200 rounded bg-white focus:ring-1 focus:ring-sky-500"
                            placeholder="Comma-separated keywords"
                        />
                    </div>
                </div>
            </details>
        </div>
    );
};

export default SeoPanel;