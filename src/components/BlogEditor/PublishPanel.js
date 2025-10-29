import React from 'react';

const PublishPanel = ({ scheduledTime, onScheduledTimeChange, isFeatured, onIsFeaturedChange, isUpdating }) => {
    return (
        <>
            <div>
                <label htmlFor="scheduledTime" className="block text-gray-700 font-semibold mb-2">Schedule Publication</label>
                <input
                    type="datetime-local"
                    id="scheduledTime"
                    value={scheduledTime}
                    onChange={e => onScheduledTimeChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank to publish immediately.</p>
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={e => onIsFeaturedChange(e.target.checked)}
                    className="h-5 w-5 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                />
                <span className="ml-2 text-gray-700">Mark as Featured</span>
            </div>

            <button
                type="submit"
                className="w-full bg-sky-600 text-white font-bold py-3 rounded-lg hover:bg-sky-700 transition"
            >
                {isUpdating ? 'Update Post' : 'Publish Post'}
            </button>
        </>
    );
};

export default PublishPanel;
