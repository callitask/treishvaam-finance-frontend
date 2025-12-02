import React from 'react';
import { FaGoogle, FaInfoCircle } from 'react-icons/fa';

const SeoPanel = ({
    keywords, onKeywordsChange,
    metaDescription, onMetaDescriptionChange,
    seoTitle, onSeoTitleChange,
    canonicalUrl, onCanonicalUrlChange,
    focusKeyword, onFocusKeywordChange,
    title // Passed from parent to generate default preview if SEO title is empty
}) => {

    const displayTitle = seoTitle || title || "Your Article Title";
    const displayDesc = metaDescription || "This is how your article description will appear in search results. It should be concise, engaging, and include your focus keywords.";
    const displayUrl = `https://treishfin.treishvaamgroup.com/blog/...`;

    return (
        <div className="space-y-5">

            {/* 1. SERP Preview (Visual) */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <FaGoogle /> Search Engine Preview
                </div>
                <div className="font-sans">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <img src="/logo.png" alt="" className="w-4 h-4 opacity-50" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                        <div className="text-sm text-gray-800">Treishvaam Finance</div>
                        <div className="text-xs text-gray-500">{displayUrl}</div>
                    </div>
                    <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer font-medium leading-snug truncate">
                        {displayTitle}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {displayDesc}
                    </p>
                </div>
            </div>

            {/* 2. Focus Keyword */}
            <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Focus Keyword</label>
                <input
                    type="text"
                    value={focusKeyword || ''}
                    onChange={e => onFocusKeywordChange(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                    placeholder="e.g. Nifty 50 Analysis"
                />
            </div>

            {/* 3. SEO Title */}
            <div>
                <div className="flex justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase">SEO Title Tag</label>
                    <span className={`text-xs ${displayTitle.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                        {displayTitle.length} / 60
                    </span>
                </div>
                <input
                    type="text"
                    value={seoTitle || ''}
                    onChange={e => onSeoTitleChange(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                    placeholder="Leave blank to use main post title"
                />
            </div>

            {/* 4. Meta Description */}
            <div>
                <div className="flex justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase">Meta Description</label>
                    <span className={`text-xs ${displayDesc.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                        {displayDesc.length} / 160
                    </span>
                </div>
                <textarea
                    rows="3"
                    value={metaDescription || ''}
                    onChange={e => onMetaDescriptionChange(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                    placeholder="Summarize the article..."
                />
            </div>

            {/* 5. Advanced Toggle (Canonical) */}
            <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-500 uppercase hover:text-gray-800 transition-colors">
                    <span>Advanced Settings</span>
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-3 pl-2 border-l-2 border-gray-100">
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-2">
                        Canonical URL <FaInfoCircle className="text-gray-300" title="Use this if the content was originally published elsewhere." />
                    </label>
                    <input
                        type="text"
                        value={canonicalUrl || ''}
                        onChange={e => onCanonicalUrlChange(e.target.value)}
                        className="w-full p-2 text-xs border border-gray-300 rounded bg-gray-50 focus:bg-white transition-colors"
                        placeholder="https://original-source.com/article..."
                    />

                    <div className="mt-3">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Meta Keywords</label>
                        <input
                            type="text"
                            value={keywords || ''}
                            onChange={e => onKeywordsChange(e.target.value)}
                            className="w-full p-2 text-xs border border-gray-300 rounded bg-gray-50 focus:bg-white"
                            placeholder="Comma-separated keywords"
                        />
                    </div>
                </div>
            </details>
        </div>
    );
};

export default SeoPanel;