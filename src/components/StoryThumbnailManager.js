import React from 'react';
import { FaPlus, FaBookOpen, FaTimes } from 'react-icons/fa';

const StoryThumbnailItem = ({ thumbnail, index, onAltTextChange, onRemove, onDragStart, onDragOver, onDrop, onDragEnd }) => {
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, index)}
            onDragEnd={onDragEnd}
            className="p-2 mb-2 border rounded-lg bg-white shadow-sm cursor-grab active:cursor-grabbing"
        >
            <div className="flex items-start gap-3">
                <img src={thumbnail.previewUrl} alt="Thumbnail preview" className="w-20 h-20 object-cover rounded" />
                <div className="flex-grow">
                    <input
                        type="text"
                        value={thumbnail.altText}
                        onChange={(e) => onAltTextChange(index, e.target.value)}
                        placeholder="Enter Alt Text (required for SEO)"
                        className="w-full p-2 border border-gray-300 rounded text-sm mb-2"
                        required
                    />
                     <p className="text-xs text-gray-500 truncate">
                        {thumbnail.source === 'new' ? `File: ${thumbnail.file.name}` : `URL: ${thumbnail.url}`}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="p-1 text-red-500 hover:text-red-700"
                    title="Remove Thumbnail"
                >
                    <FaTimes />
                </button>
            </div>
        </div>
    );
};


const StoryThumbnailManager = ({ thumbnails, setThumbnails, onUploadClick, onAddFromPostClick }) => {
    const dragItem = React.useRef(null);
    // --- FIX: Removed unused dragOverItem ref ---
    // const dragOverItem = React.useRef(null); 

    const handleAltTextChange = (index, newAltText) => {
        const newThumbnails = [...thumbnails];
        newThumbnails[index].altText = newAltText;
        setThumbnails(newThumbnails);
    };

    const handleRemoveThumbnail = (index) => {
        setThumbnails(thumbnails.filter((_, i) => i !== index));
    };

    const handleDragStart = (e, index) => {
        dragItem.current = index;
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, index) => {
        const draggedItemContent = thumbnails[dragItem.current];
        const newThumbnails = [...thumbnails];
        newThumbnails.splice(dragItem.current, 1);
        newThumbnails.splice(index, 0, draggedItemContent);
        dragItem.current = null;
        setThumbnails(newThumbnails.map((thumb, idx) => ({ ...thumb, displayOrder: idx })));
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
    };


    return (
        <div className="p-4 border rounded-lg space-y-4 bg-gray-50">
            <label className="block text-gray-700 font-semibold">Story Thumbnails</label>

            <div className="space-y-2">
                {thumbnails.map((thumb, index) => (
                    <StoryThumbnailItem
                        key={thumb.id}
                        thumbnail={thumb}
                        index={index}
                        onAltTextChange={handleAltTextChange}
                        onRemove={handleRemoveThumbnail}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                    />
                ))}
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onUploadClick}
                    className="flex-1 flex items-center justify-center gap-2 p-2 text-sm font-semibold text-sky-700 bg-sky-100 rounded-lg hover:bg-sky-200"
                >
                    <FaPlus /> Upload New
                </button>
                <button
                    type="button"
                    onClick={onAddFromPostClick}
                    className="flex-1 flex items-center justify-center gap-2 p-2 text-sm font-semibold text-green-700 bg-green-100 rounded-lg hover:bg-green-200"
                >
                    <FaBookOpen /> Add from Post
                </button>
            </div>
             {thumbnails.length === 0 && <p className="text-xs text-center text-gray-500 mt-2">Add images to create the story. The first image will set the orientation (Landscape/Portrait).</p>}
        </div>
    );
};

export default StoryThumbnailManager;