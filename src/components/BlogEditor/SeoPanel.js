import React from 'react';

const SeoPanel = ({ keywords, onKeywordsChange, metaDescription, onMetaDescriptionChange, customSnippet, onCustomSnippetChange }) => {
    return (
        <>
            <div>
                <label htmlFor="keywords" className="block text-gray-700 font-semibold mb-2">Keywords (Comma-separated)</label>
                <input
                    type="text"
                    id="keywords"
                    value={keywords}
                    onChange={e => onKeywordsChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="e.g., investing, stocks, financial freedom"
                />
            </div>

            <div>
                <label htmlFor="metaDescription" className="block text-gray-700 font-semibold mb-2">Meta Description (for SEO)</label>
                <textarea
                    id="metaDescription"
                    value={metaDescription}
                    onChange={e => onMetaDescriptionChange(e.target.value)}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="A brief summary for search engines (about 155 characters)."
                />
            </div>

            <div>
                <label htmlFor="customSnippet" className="block text-gray-700 font-semibold mb-2">Custom Snippet (for Previews)</label>
                <textarea
                    id="customSnippet"
                    value={customSnippet}
                    onChange={e => onCustomSnippetChange(e.target.value)}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="A short preview for display on the blog page."
                />
            </div>
        </>
    );
};

export default SeoPanel;
