import React from 'react';
import StoryThumbnailManager from './StoryThumbnailManager';

const ThumbnailPanel = ({
    thumbnailMode,
    onThumbnailModeChange,
    // Single mode props
    thumbPreview,
    onUploadSingleClick,
    thumbnailAltText,
    onThumbnailAltTextChange,
    // Story mode props
    storyThumbnails,
    setStoryThumbnails,
    onUploadStoryClick,
    onAddFromPostClick
}) => {
    return (
        <>
            <div className="my-4">
                <label className="block text-gray-700 font-semibold mb-2">Thumbnail Mode</label>
                <div className="flex rounded-lg p-1 bg-gray-200">
                    <button
                        type="button"
                        onClick={() => onThumbnailModeChange('single')}
                        className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${thumbnailMode === 'single' ? 'bg-white text-sky-600 shadow' : 'text-gray-600'}`}
                    >
                        Single Image
                    </button>
                    <button
                        type="button"
                        onClick={() => onThumbnailModeChange('story')}
                        className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${thumbnailMode === 'story' ? 'bg-white text-sky-600 shadow' : 'text-gray-600'}`}
                    >
                        Story Thumbnails
                    </button>
                </div>
            </div>

            {thumbnailMode === 'single' ? (
                <div className="p-4 border rounded-lg space-y-3 bg-gray-50">
                    <label className="block text-gray-700 font-semibold">Thumbnail Image</label>
                    {thumbPreview && <img src={thumbPreview} alt="Thumbnail Preview" className="w-full h-auto aspect-video object-contain my-4 border rounded-lg bg-white" />}
                    <button
                        type="button"
                        onClick={onUploadSingleClick}
                        className="w-full text-sm p-2 rounded-lg font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100"
                    >
                        Upload Thumbnail
                    </button>
                    <div>
                        <label htmlFor="thumbnailAltText" className="text-sm font-medium text-gray-600">Alt Text</label>
                        <input
                            type="text"
                            id="thumbnailAltText"
                            value={thumbnailAltText}
                            onChange={e => onThumbnailAltTextChange(e.target.value)}
                            placeholder="Describe the image for SEO"
                            className="w-full mt-1 p-2 text-sm border border-gray-300 rounded"
                        />
                    </div>
                </div>
            ) : (
                <StoryThumbnailManager
                    thumbnails={storyThumbnails}
                    setThumbnails={setStoryThumbnails}
                    onUploadClick={onUploadStoryClick}
                    onAddFromPostClick={onAddFromPostClick}
                />
            )}
        </>
    );
};

export default ThumbnailPanel;