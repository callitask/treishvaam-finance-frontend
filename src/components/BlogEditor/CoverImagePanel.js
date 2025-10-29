import React from 'react';

const CoverImagePanel = ({ coverPreview, onUploadCoverClick, coverImageAltText, onCoverImageAltTextChange }) => {
    return (
        <div className="p-4 border rounded-lg space-y-3 bg-gray-50">
            <label className="block text-gray-700 font-semibold">Cover Image</label>
            {coverPreview && <img src={coverPreview} alt="Cover Preview" className="w-full h-auto aspect-video object-contain my-4 border rounded-lg bg-white" />}
            <button
                type="button"
                onClick={onUploadCoverClick}
                className="w-full text-sm p-2 rounded-lg font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100"
            >
                Upload Cover Image
            </button>
            <div>
                <label htmlFor="coverImageAltText" className="text-sm font-medium text-gray-600">Cover Image Alt Text</label>
                <input
                    type="text"
                    id="coverImageAltText"
                    value={coverImageAltText}
                    onChange={e => onCoverImageAltTextChange(e.target.value)}
                    placeholder="Describe the cover image for SEO"
                    className="w-full mt-1 p-2 text-sm border border-gray-300 rounded"
                />
            </div>
        </div>
    );
};

export default CoverImagePanel;
