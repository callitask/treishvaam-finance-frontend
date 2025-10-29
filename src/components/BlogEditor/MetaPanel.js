import React from 'react';

const MetaPanel = ({ title, onTitleChange, userFriendlySlug, onUserFriendlySlugChange }) => {
    return (
        <>
            <div>
                <label htmlFor="title" className="block text-gray-700 font-semibold mb-2">Title</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={e => onTitleChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                />
            </div>

            <div>
                <label htmlFor="userFriendlySlug" className="block text-gray-700 font-semibold mb-2">
                    URL Slug (SEO Friendly)
                </label>
                <input
                    type="text"
                    id="userFriendlySlug"
                    value={userFriendlySlug}
                    onChange={e => onUserFriendlySlugChange(e.target.value)}
                    placeholder="e.g., guide-to-market-analysis"
                    className="w-full p-2 border border-gray-300 rounded"
                />
            </div>
        </>
    );
};

export default MetaPanel;
